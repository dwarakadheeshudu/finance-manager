from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from backend.app.database import get_db
from backend.app.models import User, Budget
from backend.app.schemas import UserCreate, UserResponse, Token, UserLogin, SetupFinancials
from backend.app.auth import get_password_hash, verify_password, create_access_token, get_current_user, settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Check if this email is the admin email
    role = "user"
    if user_in.email.lower() == settings.ADMIN_EMAIL.lower():
        role = "admin"

    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hashed_pw,
        role=role,
        monthly_salary=0.0,
        savings_goal=0.0
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password."
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/form", response_model=Token, include_in_schema=False)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password."
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/setup-financials", response_model=UserResponse)
def setup_financials(setup: SetupFinancials, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if setup.savings_goal > setup.monthly_salary:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Savings goal cannot be greater than monthly salary."
        )

    current_user.monthly_salary = setup.monthly_salary
    current_user.savings_goal = setup.savings_goal
    db.commit()

    # Step 4: AI Budget Planning
    # Automatically allocate spending to standard categories.
    available_spending = setup.monthly_salary - setup.savings_goal
    
    # Category percentages
    default_allocations = {
        "Food": (0.20, 20.0),          # (fraction, percentage)
        "Travel": (0.125, 12.5),
        "Shopping": (0.10, 10.0),
        "Entertainment": (0.075, 7.5),
        "Bills": (0.25, 25.0),
        "Emergency": (0.125, 12.5),
        "Others": (0.125, 12.5)
    }

    # Delete existing budgets for clean slate or update them
    db.query(Budget).filter(Budget.user_id == current_user.id).delete()

    for category, (fraction, percentage) in default_allocations.items():
        limit_amt = round(available_spending * fraction, 2)
        budget = Budget(
            user_id=current_user.id,
            category=category,
            limit_amount=limit_amt,
            percentage=percentage
        )
        db.add(budget)

    db.commit()
    db.refresh(current_user)
    return current_user
