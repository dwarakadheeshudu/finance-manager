import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user") # user, admin
    monthly_salary = Column(Float, default=0.0)
    savings_goal = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    savings_goals = relationship("SavingsGoal", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    health_scores = relationship("FinancialHealthScore", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="user", cascade="all, delete-orphan")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, index=True, nullable=False)
    limit_amount = Column(Float, nullable=False)
    percentage = Column(Float, default=0.0) # percentage of available spending
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="budgets")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expense_text = Column(String, nullable=True) # Natural language text
    amount = Column(Float, nullable=False)
    category = Column(String, index=True, nullable=False)
    confidence = Column(Float, default=100.0) # AI classification confidence
    date = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="expenses")

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="savings_goals")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    horizon = Column(String, nullable=False) # weekly, monthly
    category = Column(String, nullable=False)
    predicted_amount = Column(Float, nullable=False)
    prediction_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="predictions")

class FinancialHealthScore(Base):
    __tablename__ = "financial_health_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False) # 0 to 100
    grade = Column(String, nullable=False) # Excellent, Good, Average, Poor
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="health_scores")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False) # budget_exceeded, goal_progress, trend_alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False) # monthly, yearly
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reports")

class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    insight_text = Column(Text, nullable=False)
    category = Column(String, nullable=True)
    priority = Column(Float, default=0.5) # 0.0 - 1.0 (Low to High importance)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ai_insights")

# ==============================================================================
# MEDICAI CLINICAL & APPOINTMENT MODELS (SECURE & VERIFIABLE)
# ==============================================================================
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=False, index=True)
    qualifications = Column(String, nullable=False)
    registration_number = Column(String, nullable=False, unique=True)
    hospital = Column(String, nullable=False)
    experience_years = Column(Integer, default=10)
    consultation_fee = Column(Float, default=100.0)
    rating = Column(Float, default=4.9)
    available_days = Column(String, default="Mon-Sat")
    room_number = Column(String, default="Wing 4B, Room 210")
    teleconsult_available = Column(Boolean, default=True)
    verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    appointments = relationship("DoctorAppointment", back_populates="doctor_rel")

class DoctorAppointment(Base):
    __tablename__ = "doctor_appointments"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String, unique=True, index=True, nullable=False)
    patient_name = Column(String, nullable=False)
    patient_email = Column(String, nullable=True)
    patient_phone = Column(String, nullable=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    doctor_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    appointment_date = Column(String, nullable=False, index=True) # YYYY-MM-DD
    time_slot = Column(String, nullable=False, index=True) # e.g. "10:00 AM"
    consultation_type = Column(String, default="In-Person") # In-Person or Tele-Consultation
    chief_complaint = Column(String, nullable=True)
    status = Column(String, default="Confirmed") # Confirmed, Cancelled, Completed
    security_verification_hash = Column(String, nullable=False) # SHA-256 tamper-proof hash
    teleconsult_url = Column(String, nullable=True)
    room_number = Column(String, nullable=True)
    fee_paid = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    doctor_rel = relationship("Doctor", back_populates="appointments")

class MedicalAuditLog(Base):
    __tablename__ = "medical_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False, index=True)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    patient_pseudonym = Column(String, nullable=True)
    action_summary = Column(String, nullable=False)
    details_json = Column(Text, nullable=True)
    cryptographic_hash = Column(String, nullable=False)
    previous_hash = Column(String, nullable=True)
    client_ip = Column(String, default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ClinicalPredictionRecord(Base):
    __tablename__ = "clinical_predictions"

    id = Column(Integer, primary_key=True, index=True)
    disease_type = Column(String, nullable=False, index=True)
    patient_pseudonym = Column(String, nullable=False)
    risk_percentage = Column(Float, nullable=False)
    risk_category = Column(String, nullable=False) # Low, Moderate, High, Critical
    confidence_interval = Column(String, nullable=True)
    clinical_rationale = Column(Text, nullable=True)
    shap_attributions = Column(Text, nullable=True)
    guideline_citation = Column(String, nullable=True)
    verification_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

