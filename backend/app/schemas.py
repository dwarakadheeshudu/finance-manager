from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    full_name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    monthly_salary: Optional[float] = None
    savings_goal: Optional[float] = None

class SetupFinancials(BaseModel):
    monthly_salary: float = Field(..., gt=0)
    savings_goal: float = Field(..., ge=0)

class UserResponse(UserBase):
    id: int
    role: str
    monthly_salary: float
    savings_goal: float
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Budget Schemas
class BudgetBase(BaseModel):
    category: str
    limit_amount: float = Field(..., ge=0)
    percentage: Optional[float] = 0.0

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    limit_amount: float = Field(..., ge=0)
    percentage: Optional[float] = 0.0

class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0)
    category: str
    expense_text: Optional[str] = None
    date: Optional[datetime] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseNLCreate(BaseModel):
    expense_text: str

class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int
    confidence: float
    created_at: datetime
    date: datetime

    class Config:
        from_attributes = True

# SavingsGoal Schemas
class SavingsGoalBase(BaseModel):
    title: str
    target_amount: float = Field(..., gt=0)
    current_amount: Optional[float] = 0.0
    target_date: datetime

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[datetime] = None
    is_completed: Optional[bool] = None

class SavingsGoalResponse(SavingsGoalBase):
    id: int
    user_id: int
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionResponse(BaseModel):
    id: int
    user_id: int
    horizon: str
    category: str
    predicted_amount: float
    prediction_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Health Score Schemas
class FinancialHealthScoreResponse(BaseModel):
    id: int
    user_id: int
    score: int
    grade: str
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Report Schemas
class ReportResponse(BaseModel):
    id: int
    user_id: int
    type: str
    start_date: datetime
    end_date: datetime
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True

# AI Insight Schemas
class AIInsightResponse(BaseModel):
    id: int
    user_id: int
    insight_text: str
    category: Optional[str] = None
    priority: float
    created_at: datetime

    class Config:
        from_attributes = True

# AI Service Input/Output Schemas
class AICategorizeInput(BaseModel):
    expense_text: str

class AICategorizeOutput(BaseModel):
    category: str
    confidence: float

class AIPredictOutput(BaseModel):
    weekly_spending: float
    monthly_spending: float
    category_spending: dict
    expected_remaining_balance: float

class AISavingsRecommendationOutput(BaseModel):
    recommendations: List[str]

class AIFinancialHealthScoreOutput(BaseModel):
    score: int
    grade: str
    feedback: str

class AIChatInput(BaseModel):
    message: str

class AIChatOutput(BaseModel):
    response: str

# Admin Dashboard Schemas
class AdminAnalyticsResponse(BaseModel):
    total_users: int
    active_users: int
    total_transactions: int
    ai_usage_analytics: dict
    system_health: dict
