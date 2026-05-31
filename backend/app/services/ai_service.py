import re
import random
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.app.models import Expense, Budget, User, SavingsGoal, Prediction

# ==============================================================================
# BERT MODEL PLUG-IN HOOK
# ==============================================================================
# To plug in your custom PyTorch or HuggingFace BERT model, follow these steps:
# 
# 1. Install transformers and torch:
#    `pip install transformers torch`
# 
# 2. Load your model and tokenizer here:
#    ```python
#    from transformers import AutoTokenizer, AutoModelForSequenceClassification
#    import torch
#    
#    MODEL_PATH = "./my_bert_model"
#    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
#    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
#    categories_list = ["Food", "Travel", "Shopping", "Entertainment", "Bills", "Healthcare", "Education", "Investments", "Savings", "Emergency", "Others"]
#    ```
# 
# 3. Replace the mock implementation in `categorize_expense_bert` with:
#    ```python
#    inputs = tokenizer(expense_text, return_tensors="pt", truncation=True, padding=True, max_length=128)
#    with torch.no_grad():
#        outputs = model(**inputs)
#    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
#    confidence, class_idx = torch.max(probs, dim=-1)
#    category = categories_list[class_idx.item()]
#    return category, float(confidence.item() * 100)
#    ```
# ==============================================================================

CATEGORIES_MAP = {
    "Food": [r"food", r"lunch", r"dinner", r"breakfast", r"cafe", r"restaurant", r"zomato", r"swiggy", r"groceries", r"grocery", r"pizza", r"burger", r"starbucks", r"eat", r"tea", r"coffee"],
    "Travel": [r"travel", r"petrol", r"diesel", r"fuel", r"uber", r"ola", r"taxi", r"cab", r"train", r"flight", r"bus", r"metro", r"auto", r"ticket booking", r"petroleum", r"garage", r"toll"],
    "Shopping": [r"shirt", r"dress", r"shoes", r"amazon", r"flipkart", r"myntra", r"clothes", r"shopping", r"mall", r"tshirt", r"jeans", r"watch", r"gadget"],
    "Entertainment": [r"movie", r"netflix", r"ticket", r"game", r"cinema", r"concert", r"spotify", r"club", r"pub", r"party", r"beer", r"wine", r"theatre", r"subscription"],
    "Bills": [r"rent", r"electricity", r"water", r"internet", r"phone", r"broadband", r"wifi", r"recharge", r"bill", r"gas", r"insurance", r"premium", r"tax", r"mobile bill"],
    "Healthcare": [r"medicine", r"doctor", r"hospital", r"clinic", r"pharmacy", r"healthcare", r"dental", r"medical", r"physio", r"checkup"],
    "Education": [r"book", r"course", r"tuition", r"fee", r"school", r"college", r"training", r"udemy", r"coursera", r"seminar", r"stationery"],
    "Investments": [r"stock", r"mutual fund", r"crypto", r"gold", r"sip", r"investment", r"bond", r"share", r"etf", r"fixed deposit", r"fd"],
    "Savings": [r"savings", r"deposit", r"piggy", r"saved", r"transfer to savings"],
    "Emergency": [r"emergency", r"repair", r"accident", r"car breakdown", r"hospital emergency", r"plumbing issue"],
}

def categorize_expense_nlp(text: str) -> Tuple[str, float]:
    """
    Mock BERT Categorizer. Performs regex mapping on keywords and calculates a realistic confidence.
    """
    text_lower = text.lower()
    
    # Try pattern matching
    matched_category = None
    max_matches = 0
    
    for category, patterns in CATEGORIES_MAP.items():
        matches = 0
        for pattern in patterns:
            if re.search(pattern, text_lower):
                matches += 1
        if matches > max_matches:
            max_matches = matches
            matched_category = category

    # Extract price (amount) if any, for better feedback (e.g. ₹ or Rs. or numeric)
    amount = 0.0
    amount_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)', text_lower)
    if amount_match:
        amount = float(amount_match.group(1))

    if matched_category:
        # High confidence for exact match
        confidence = round(85.0 + random.uniform(5.0, 14.5), 2)
        return matched_category, confidence
    else:
        # Default fallback
        confidence = round(50.0 + random.uniform(5.0, 15.0), 2)
        return "Others", confidence

def extract_amount_nlp(text: str) -> float:
    """
    Helper to extract amount from text like "spent 500 rupees on food" or "I paid ₹1200".
    """
    text_clean = text.replace(",", "")
    # Find patterns like ₹500, Rs 500, 500rs, 500 rupees, or just 500
    patterns = [
        r'(?:₹|rs\.?|inr)\s*(\d+(?:\.\d{1,2})?)',
        r'(\d+(?:\.\d{1,2})?)\s*(?:rupees|rs\.?|inr|₹)',
        r'(?:spent|paid|cost|worth|giving|gave)\s*(\d+(?:\.\d{1,2})?)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text_clean, re.IGNORECASE)
        if match:
            return float(match.group(1))
            
    # Final fallback: look for any number that is not standard date
    numbers = re.findall(r'\b\d+(?:\.\d{1,2})?\b', text_clean)
    for num in numbers:
        val = float(num)
        if 5.0 <= val <= 100000.0:  # reasonable transactional range
            return val
    return 0.0

def predict_expenses(db: Session, user_id: int) -> Dict:
    """
    Analyzes historical expenses and predicts future spending behavior.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}
        
    # Get last 30 days of expenses
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    expenses = db.query(Expense).filter(Expense.user_id == user_id, Expense.date >= thirty_days_ago).all()
    
    total_spent_30d = sum(e.amount for e in expenses)
    
    # Group by category
    category_totals = {}
    for e in expenses:
        category_totals[e.category] = category_totals.get(e.category, 0.0) + e.amount
        
    # Forecast weekly and monthly
    # Standard baseline: if user has no expenses, base on budget or salary
    if not expenses:
        # Guess spending is roughly 80% of available spending (salary - goal)
        available = max(0.0, user.monthly_salary - user.savings_goal)
        predicted_monthly = available if available > 0 else 20000.0
        predicted_weekly = predicted_monthly / 4.0
    else:
        # Linear projection with minor trend
        predicted_monthly = total_spent_30d * 1.05
        predicted_weekly = predicted_monthly / 4.0
        
    # Expected remaining balance
    expected_remaining = user.monthly_salary - predicted_monthly
    
    # Category predictions
    categories = ["Food", "Travel", "Shopping", "Entertainment", "Bills", "Healthcare", "Education", "Investments", "Savings", "Emergency", "Others"]
    category_spending = {}
    
    for cat in categories:
        actual = category_totals.get(cat, 0.0)
        # Prediction with small upward drift
        category_spending[cat] = round(actual * 1.08 if actual > 0 else (user.monthly_salary * 0.02), 2)

    return {
        "weekly_spending": round(predicted_weekly, 2),
        "monthly_spending": round(predicted_monthly, 2),
        "category_spending": category_spending,
        "expected_remaining_balance": round(expected_remaining, 2)
    }

def generate_savings_recommendations(db: Session, user_id: int) -> List[str]:
    """
    AI-driven savings recommendation engine. Compares budgets vs expenses and suggests improvements.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []
        
    recommendations = []
    
    # Get total expenses for the current month
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_expenses = db.query(Expense).filter(Expense.user_id == user_id, Expense.date >= start_of_month).all()
    total_spent = sum(e.amount for e in current_expenses)
    
    # 1. Salary and Goals check
    available_to_spend = user.monthly_salary - user.savings_goal
    if total_spent > available_to_spend:
        over_spent = total_spent - available_to_spend
        recommendations.append(f"⚠️ You have exceeded your available spending limit by ₹{over_spent:,.2f}. This directly affects your savings goal.")
    elif total_spent > available_to_spend * 0.8:
        recommendations.append("⚠️ You have used over 80% of your allowed spending budget. Consider freezing non-essential spending.")
    else:
        recommendations.append("✅ Great job! Your monthly savings target is currently on track.")

    # 2. Check individual budgets
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    cat_spent = {}
    for e in current_expenses:
        cat_spent[e.category] = cat_spent.get(e.category, 0.0) + e.amount
        
    for budget in budgets:
        spent = cat_spent.get(budget.category, 0.0)
        if spent > budget.limit_amount:
            over = spent - budget.limit_amount
            recommendations.append(f"🔴 Limit Exceeded: Spent ₹{spent:,.2f} on {budget.category} (Limit: ₹{budget.limit_amount:,.2f}). Over by ₹{over:,.2f}.")
        elif spent > budget.limit_amount * 0.85:
            left = budget.limit_amount - spent
            recommendations.append(f"🟡 Warning: You have only ₹{left:,.2f} remaining in your {budget.category} budget.")

    # 3. Dynamic category tips
    food_spent = cat_spent.get("Food", 0.0)
    entertainment_spent = cat_spent.get("Entertainment", 0.0)
    shopping_spent = cat_spent.get("Shopping", 0.0)
    
    if food_spent > user.monthly_salary * 0.25:
        recommendations.append(f"💡 Dining/Food makes up {((food_spent/user.monthly_salary)*100):.1f}% of your salary. Try cooking at home to save roughly ₹2,000 next month.")
        
    if entertainment_spent > 1500:
        recommendations.append(f"💡 Reduce entertainment/subscriptions by ₹1,500 to accelerate reaching your savings goal.")
        
    if shopping_spent > user.monthly_salary * 0.15:
        recommendations.append("💡 Shopping expenses are higher than normal. Implementing a '24-hour rule' before buying online could save 15% this month.")

    # Fallback recommendations if user has clean record
    if len(recommendations) <= 1:
        recommendations.append("🌟 Excellent management! Suggest allocating 10% of your remaining balance to an Investment index SIP.")
        recommendations.append("💡 You can increase your monthly savings goal by ₹2,000 based on your current surplus trajectory.")

    return recommendations

def calculate_financial_health_score(db: Session, user_id: int) -> Tuple[int, str, str]:
    """
    Computes financial health score (0-100), its Grade, and structured feedback.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return 0, "Poor", "User not found"
        
    # Standard baseline
    score = 75 # start at average
    feedback_points = []
    
    # 1. Saving consistency (out of 40 points)
    if user.monthly_salary > 0:
        savings_ratio = user.savings_goal / user.monthly_salary
        if savings_ratio >= 0.20: # 20% or more savings goal is excellent
            score += 15
            feedback_points.append("Excellent saving goal ratio of 20% or more.")
        elif savings_ratio >= 0.10:
            score += 8
            feedback_points.append("Good saving goal setup of 10-20%.")
        else:
            score -= 10
            feedback_points.append("Your monthly saving target is below 10% of your income. Consider increasing it.")
    else:
        score -= 20
        feedback_points.append("Please set up your monthly salary to enable financial health scoring.")

    # 2. Expense management check (out of 30 points)
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_expenses = db.query(Expense).filter(Expense.user_id == user_id, Expense.date >= start_of_month).all()
    total_spent = sum(e.amount for e in current_expenses)
    
    if user.monthly_salary > 0:
        spending_ratio = total_spent / user.monthly_salary
        if spending_ratio > 0.90:
            score -= 20
            feedback_points.append("You have spent over 90% of your income this month. High risk of overspending.")
        elif spending_ratio > 0.75:
            score -= 10
            feedback_points.append("Spent between 75-90% of income. Budget is tight.")
        elif spending_ratio > 0.40:
            score += 5
            feedback_points.append("Spending is well balanced under 75% of income.")
        else:
            score += 10
            feedback_points.append("Extremely high surplus cash flow this month.")
            
    # 3. Budget Limits Overrun (out of 30 points)
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    cat_spent = {}
    for e in current_expenses:
        cat_spent[e.category] = cat_spent.get(e.category, 0.0) + e.amount
        
    over_budget_count = 0
    for budget in budgets:
        if cat_spent.get(budget.category, 0.0) > budget.limit_amount:
            over_budget_count += 1
            
    if over_budget_count == 0 and len(budgets) > 0:
        score += 10
        feedback_points.append("Perfect score: No categories exceeded budgets.")
    elif over_budget_count > 0:
        score -= (over_budget_count * 5)
        feedback_points.append(f"Over budget in {over_budget_count} categories.")

    # Normalize score between 0 and 100
    score = max(0, min(100, score))
    
    # Grade assignment
    if score >= 85:
        grade = "Excellent"
    elif score >= 70:
        grade = "Good"
    elif score >= 50:
        grade = "Average"
    else:
        grade = "Poor"
        
    feedback = " | ".join(feedback_points)
    return score, grade, feedback

def chat_with_data(db: Session, user: User, message: str) -> str:
    """
    Parses user natural language query, retrieves relevant DB statistics, and returns an intelligent response.
    """
    message_lower = message.lower()
    
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_expenses = db.query(Expense).filter(Expense.user_id == user.id, Expense.date >= start_of_month).all()
    total_spent = sum(e.amount for e in current_expenses)
    
    # Helper: Group current month expenses
    cat_spent = {}
    for e in current_expenses:
        cat_spent[e.category] = cat_spent.get(e.category, 0.0) + e.amount
        
    # Check if user asks about a specific category
    matched_cat = None
    for cat in CATEGORIES_MAP.keys():
        if cat.lower() in message_lower:
            matched_cat = cat
            break

    # Scenario 1: Spending check
    if "how much did i spend" in message_lower or "total expense" in message_lower or "spent this month" in message_lower or "spending" in message_lower:
        if matched_cat:
            amount = cat_spent.get(matched_cat, 0.0)
            return f"You have spent **₹{amount:,.2f}** on **{matched_cat}** so far this month."
        else:
            return f"Your total expenses for this month amount to **₹{total_spent:,.2f}** out of a monthly salary of **₹{user.monthly_salary:,.2f}**."

    # Scenario 2: Save predictions / goals
    if "save" in message_lower or "savings" in message_lower or "savings goal" in message_lower:
        goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == user.id).all()
        if goals:
            goal_details = []
            for g in goals:
                status_str = "Completed" if g.is_completed else f"Progress: ₹{g.current_amount:,.2f}/₹{g.target_amount:,.2f}"
                goal_details.append(f"- **{g.title}**: {status_str}")
            return "Here are your current savings goals:\n" + "\n".join(goal_details)
        else:
            return f"Your monthly savings target is set to **₹{user.savings_goal:,.2f}**. You can add specific savings goals (like buying a car or emergency fund) in the Savings dashboard module."

    # Scenario 3: Overspending checking
    if "where am i overspending" in message_lower or "overspent" in message_lower or "overspending" in message_lower or "budget exceeded" in message_lower:
        budgets = db.query(Budget).filter(Budget.user_id == user.id).all()
        overspent_cats = []
        for b in budgets:
            spent = cat_spent.get(b.category, 0.0)
            if spent > b.limit_amount:
                over = spent - b.limit_amount
                overspent_cats.append(f"- **{b.category}**: Overspent by **₹{over:,.2f}** (Spent: ₹{spent:,.2f}, Limit: ₹{b.limit_amount:,.2f})")
        if overspent_cats:
            return "Yes, you have exceeded your budget limits in these areas:\n" + "\n".join(overspent_cats)
        else:
            return "Wonderful news! You have not exceeded your budget limit in any categories this month. Keep it up!"

    # Scenario 4: Future expense predictions
    if "predict" in message_lower or "forecast" in message_lower or "next month" in message_lower or "predicted expense" in message_lower:
        preds = predict_expenses(db, user.id)
        if preds:
            return (
                f"Based on historical tracking, your AI-predicted monthly spending is **₹{preds['monthly_spending']:,.2f}** "
                f"(weekly prediction: **₹{preds['weekly_spending']:,.2f}**).\n"
                f"Your expected remaining balance at the end of the month will be **₹{preds['expected_remaining_balance']:,.2f}**."
            )
        return "Not enough expense data to generate predictions. Please log at least 3-5 expenses first."

    # Scenario 5: Financial Health Score
    if "score" in message_lower or "health" in message_lower or "grade" in message_lower:
        score, grade, fb = calculate_financial_health_score(db, user.id)
        return (
            f"Your current Financial Health Score is **{score}/100** which rates as **{grade}**.\n"
            f"**AI Diagnostics**: {fb.replace(' | ', '. ')}"
        )

    # General Fallback Bot responses
    return (
        "Hello! I am your AI Finance Assistant. You can ask me questions like:\n"
        "- *'How much did I spend on food this month?'*\n"
        "- *'Can I save ₹15,000 next month?'*\n"
        "- *'Where am I overspending?'*\n"
        "- *'What is my predicted expense for next month?'*\n"
        "- *'What is my financial health score?'*"
    )
