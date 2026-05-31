from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models import SavingsGoal, User, Notification
from backend.app.schemas import SavingsGoalCreate, SavingsGoalResponse, SavingsGoalUpdate
from backend.app.auth import get_current_user

router = APIRouter(prefix="/savings", tags=["Savings Goals"])

@router.get("/", response_model=List[SavingsGoalResponse])
def get_savings_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()

@router.post("/", response_model=SavingsGoalResponse)
def create_savings_goal(goal_in: SavingsGoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = SavingsGoal(
        user_id=current_user.id,
        title=goal_in.title,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount or 0.0,
        target_date=goal_in.target_date,
        is_completed=(goal_in.current_amount or 0.0) >= goal_in.target_amount
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    
    # Send notification if goal completed initially
    if goal.is_completed:
        notif = Notification(
            user_id=current_user.id,
            message=f"🎉 Goal Completed: Congratulations! You've achieved your savings target for '{goal.title}' of ₹{goal.target_amount:,.2f}.",
            type="goal_progress",
            is_read=False
        )
        db.add(notif)
        db.commit()
        
    return goal

@router.put("/{goal_id}", response_model=SavingsGoalResponse)
def update_savings_goal(goal_id: int, goal_in: SavingsGoalUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found.")
        
    if goal_in.title is not None:
        goal.title = goal_in.title
    if goal_in.target_amount is not None:
        goal.target_amount = goal_in.target_amount
    if goal_in.current_amount is not None:
        goal.current_amount = goal_in.current_amount
    if goal_in.target_date is not None:
        goal.target_date = goal_in.target_date
    if goal_in.is_completed is not None:
        goal.is_completed = goal_in.is_completed
    else:
        goal.is_completed = goal.current_amount >= goal.target_amount

    db.commit()
    db.refresh(goal)

    # Check if we should trigger completion notification
    if goal.is_completed:
        existing = db.query(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.type == "goal_progress",
            Notification.message.like(f"%{goal.title}%")
        ).first()
        if not existing:
            notif = Notification(
                user_id=current_user.id,
                message=f"🎉 Goal Completed: Congratulations! You've achieved your savings target for '{goal.title}' of ₹{goal.target_amount:,.2f}.",
                type="goal_progress",
                is_read=False
            )
            db.add(notif)
            db.commit()
            
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_savings_goal(goal_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found.")
    db.delete(goal)
    db.commit()
    return None
