from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from backend.app.database import get_db
from backend.app.models import User, Expense, Budget, SavingsGoal, FinancialHealthScore
from backend.app.auth import get_current_user
from backend.app.services.ai_service import predict_expenses, calculate_financial_health_score

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])

@router.get("/analytics")
def get_dashboard_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Assembles comprehensive statistics and historical charts ready for Recharts.
    """
    # 1. Base statistics
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.date >= start_of_month
    ).all()
    
    total_expenses = sum(e.amount for e in current_expenses)
    remaining_balance = current_user.monthly_salary - total_expenses
    
    # Calculate actual savings:
    # 1. Total current amount in SavingsGoals, plus any leftover salary if remaining balance > 0
    goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()
    total_goals_savings = sum(g.current_amount for g in goals)
    
    # Standard fallback: actual savings can be modeled as salary - expenses (capped at savings_goal if appropriate, or shown as total left)
    actual_savings = max(0.0, current_user.monthly_salary - total_expenses)
    
    # Financial Health Score
    score, grade, feedback = calculate_financial_health_score(db, current_user.id)

    # 2. Charts Data: Category Distribution Pie Chart
    cat_distribution = {}
    for e in current_expenses:
        cat_distribution[e.category] = cat_distribution.get(e.category, 0.0) + e.amount
    
    pie_chart_data = [
        {"name": name, "value": round(val, 2)}
        for name, val in cat_distribution.items()
    ]
    if not pie_chart_data:
        # Fallback empty chart data
        pie_chart_data = [{"name": "No Data", "value": 0.0}]

    # 3. Charts Data: Monthly Expense and Income vs Expense (Past 6 Months)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    historical_expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.date >= six_months_ago
    ).all()

    # Group by month
    monthly_data = {}
    for e in historical_expenses:
        month_str = e.date.strftime("%b %Y")
        monthly_data[month_str] = monthly_data.get(month_str, 0.0) + e.amount

    # Ensure current month is present
    current_month_str = datetime.utcnow().strftime("%b %Y")
    if current_month_str not in monthly_data:
         monthly_data[current_month_str] = total_expenses

    bar_chart_data = []
    # Sort chronologically (simplification: sort by date or order of inserting)
    for month, spent in sorted(monthly_data.items(), key=lambda x: datetime.strptime(x[0], "%b %Y")):
        bar_chart_data.append({
            "month": month,
            "income": current_user.monthly_salary,
            "expenses": round(spent, 2),
            "savings": round(max(0.0, current_user.monthly_salary - spent), 2)
        })

    # 4. Charts Data: Savings Progress Chart (Actual vs Goal)
    savings_progress = {
        "goal_amount": current_user.savings_goal,
        "actual_amount": round(actual_savings, 2),
        "percentage": round((actual_savings / current_user.savings_goal * 100), 2) if current_user.savings_goal > 0 else 0.0
    }

    # 5. Charts Data: Predicted Future Spending
    preds = predict_expenses(db, current_user.id)
    predicted_chart_data = []
    if preds and "category_spending" in preds:
        predicted_chart_data = [
            {"category": cat, "predicted": round(val, 2)}
            for cat, val in preds["category_spending"].items()
        ]

    # Combine all elements
    return {
        "summary": {
            "monthly_salary": current_user.monthly_salary,
            "total_expenses": round(total_expenses, 2),
            "savings_goal": current_user.savings_goal,
            "actual_savings": round(actual_savings, 2),
            "remaining_balance": round(remaining_balance, 2),
            "health_score": score,
            "health_grade": grade,
            "health_feedback": feedback
        },
        "pie_chart": pie_chart_data,
        "bar_chart": bar_chart_data,
        "savings_progress": savings_progress,
        "predicted_chart": predicted_chart_data
    }
