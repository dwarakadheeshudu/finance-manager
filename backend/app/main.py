from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import User
from backend.app.auth import get_password_hash
from backend.app.routers import (
    auth, expenses, budgets, savings, ai, reports, admin, notifications, dashboard
)

# Initialize Database tables
Base.metadata.create_all(bind=engine)

# Create default admin user on startup
db = SessionLocal()
try:
    admin_exists = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin_exists:
        hashed_pw = get_password_hash(settings.ADMIN_PASSWORD)
        admin_user = User(
            full_name="System Administrator",
            email=settings.ADMIN_EMAIL,
            password_hash=hashed_pw,
            role="admin",
            monthly_salary=100000.0,
            savings_goal=20000.0
        )
        db.add(admin_user)
        db.commit()
        print("Default admin user created successfully.")
except Exception as e:
    print(f"Error creating default admin: {e}")
finally:
    db.close()

# Rate Limiter setup
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend REST API for the Smart Personal Finance Manager With AI application.",
    version="1.0.0"
)

# Set rate limiter in app state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a static files route to serve generated reports
REPORTS_DIR = "backend_static_reports"
os.makedirs(REPORTS_DIR, exist_ok=True)
app.mount("/static/reports", StaticFiles(directory=REPORTS_DIR), name="reports")

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(expenses.router, prefix=settings.API_V1_STR)
app.include_router(budgets.router, prefix=settings.API_V1_STR)
app.include_router(savings.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app_name": settings.PROJECT_NAME,
        "api_version": "v1",
        "documentation": "/docs"
    }
