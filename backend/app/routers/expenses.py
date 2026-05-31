from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from backend.app.database import get_db
from backend.app.models import Expense, User, Budget, Notification
from backend.app.schemas import ExpenseCreate, ExpenseResponse, ExpenseNLCreate
from backend.app.auth import get_current_user
from backend.app.services.ai_service import categorize_expense_nlp, extract_amount_nlp

router = APIRouter(prefix="/expenses", tags=["Expenses"])

def check_budget_limit(db: Session, user_id: int, category: str):
    """
    Checks if spending in a category has exceeded the budget, and creates a notification if so.
    """
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Calculate sum spent
    total_spent = db.query(Expense).filter(
        Expense.user_id == user_id,
        Expense.category == category,
        Expense.date >= start_of_month
    ).with_entities(Expense.amount).all()
    
    sum_spent = sum(item[0] for item in total_spent)
    
    # Fetch budget limit
    budget = db.query(Budget).filter(Budget.user_id == user_id, Budget.category == category).first()
    if budget and sum_spent > budget.limit_amount:
        # Check if notification already sent this month for this category
        existing_notif = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.type == "budget_exceeded",
            Notification.message.like(f"%{category}%"),
            Notification.created_at >= start_of_month
        ).first()
        
        if not existing_notif:
            notif = Notification(
                user_id=user_id,
                message=f"🚨 Budget Exceeded: Your spending on {category} has reached ₹{sum_spent:,.2f}, which is over your limit of ₹{budget.limit_amount:,.2f}.",
                type="budget_exceeded",
                is_read=False
            )
            db.add(notif)
            db.commit()

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    if category:
        query = query.filter(Expense.category == category)
        
    return query.order_by(Expense.date.desc()).all()

@router.post("/", response_model=ExpenseResponse)
def create_expense(expense_in: ExpenseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_expense = Expense(
        user_id=current_user.id,
        amount=expense_in.amount,
        category=expense_in.category,
        expense_text=expense_in.expense_text or "Manual Log",
        confidence=100.0,
        date=expense_in.date or datetime.utcnow()
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    # Check budget constraints
    check_budget_limit(db, current_user.id, expense_in.category)
    
    return db_expense

@router.post("/nlp", response_model=ExpenseResponse)
def create_expense_nlp(expense_in: ExpenseNLCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    text = expense_in.expense_text
    
    # NLP parser runs
    category, confidence = categorize_expense_nlp(text)
    amount = extract_amount_nlp(text)
    
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract spending amount from description. Try including a number like '₹250' or '1000'."
        )

    db_expense = Expense(
        user_id=current_user.id,
        amount=amount,
        category=category,
        expense_text=text,
        confidence=confidence,
        date=datetime.utcnow()
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    # Check budget constraints
    check_budget_limit(db, current_user.id, category)
    
    return db_expense

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, expense_in: ExpenseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    expense.amount = expense_in.amount
    expense.category = expense_in.category
    expense.expense_text = expense_in.expense_text
    if expense_in.date:
        expense.date = expense_in.date
        
    db.commit()
    db.refresh(expense)
    
    # Check budgets
    check_budget_limit(db, current_user.id, expense.category)
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return None
