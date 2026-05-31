from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, FinancialHealthScore, AIInsight
from backend.app.schemas import (
    AICategorizeInput, AICategorizeOutput, AIPredictOutput,
    AISavingsRecommendationOutput, AIFinancialHealthScoreOutput,
    AIChatInput, AIChatOutput
)
from backend.app.auth import get_current_user
from backend.app.services.ai_service import (
    categorize_expense_nlp, predict_expenses,
    generate_savings_recommendations, calculate_financial_health_score,
    chat_with_data
)

router = APIRouter(prefix="/ai", tags=["AI Integration"])

@router.post("/categorize-expense", response_model=AICategorizeOutput)
def categorize_expense(payload: AICategorizeInput, current_user: User = Depends(get_current_user)):
    category, confidence = categorize_expense_nlp(payload.expense_text)
    return {"category": category, "confidence": confidence}

@router.post("/predict-expense", response_model=AIPredictOutput)
def predict_expense(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    preds = predict_expenses(db, current_user.id)
    if not preds:
        raise HTTPException(status_code=400, detail="Cannot generate predictions. Check if your salary is configured.")
    return preds

@router.post("/savings-recommendation", response_model=AISavingsRecommendationOutput)
def savings_recommendation(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recs = generate_savings_recommendations(db, current_user.id)
    
    # Store recommendations in database as AIInsights
    # Delete old insights for current user first
    db.query(AIInsight).filter(AIInsight.user_id == current_user.id).delete()
    
    for idx, rec in enumerate(recs):
        insight = AIInsight(
            user_id=current_user.id,
            insight_text=rec,
            priority=1.0 - (idx * 0.1) # priority decays
        )
        db.add(insight)
    db.commit()

    return {"recommendations": recs}

@router.post("/financial-health-score", response_model=AIFinancialHealthScoreOutput)
def financial_health_score(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    score, grade, feedback = calculate_financial_health_score(db, current_user.id)
    
    # Store in database
    health_record = FinancialHealthScore(
        user_id=current_user.id,
        score=score,
        grade=grade,
        feedback=feedback
    )
    db.add(health_record)
    db.commit()
    db.refresh(health_record)
    
    return {"score": score, "grade": grade, "feedback": feedback}

@router.post("/chat", response_model=AIChatOutput)
def chat(payload: AIChatInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    response = chat_with_data(db, current_user, payload.message)
    return {"response": response}
