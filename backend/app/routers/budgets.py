from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime
from backend.app.database import get_db
from backend.app.models import Budget, User, Expense
from backend.app.schemas import BudgetResponse, BudgetUpdate
from backend.app.auth import get_current_user

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("/", response_model=List[BudgetResponse])
def get_budgets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Budget).filter(Budget.user_id == current_user.id).all()

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, budget_in: BudgetUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget record not found.")

    available_spending = current_user.monthly_salary - current_user.savings_goal
    if available_spending <= 0:
         available_spending = 1.0 # prevent division by zero

    budget.limit_amount = budget_in.limit_amount
    budget.percentage = budget_in.percentage if budget_in.percentage > 0 else round((budget_in.limit_amount / available_spending) * 100, 2)
    db.commit()
    db.refresh(budget)
    return budget

@router.get("/status")
def get_budgets_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns actual category-wise spending vs the configured budget limit.
    """
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.date >= start_of_month
    ).all()

    # Calculate actual spending
    cat_spent = {}
    for e in expenses:
        cat_spent[e.category] = cat_spent.get(e.category, 0.0) + e.amount

    status_list = []
    for b in budgets:
        spent = cat_spent.get(b.category, 0.0)
        percentage_used = round((spent / b.limit_amount * 100), 2) if b.limit_amount > 0 else 0.0
        status_list.append({
            "id": b.id,
            "category": b.category,
            "limit_amount": b.limit_amount,
            "percentage": b.percentage,
            "spent": round(spent, 2),
            "percentage_used": percentage_used,
            "remaining": round(max(0.0, b.limit_amount - spent), 2),
            "is_exceeded": spent > b.limit_amount
        })

    return status_list
