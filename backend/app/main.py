import os
import sys

# Ensure the parent of the 'backend' folder is in sys.path so that absolute imports starting with 'backend' work on Render
backend_parent = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_parent not in sys.path:
    sys.path.insert(0, backend_parent)

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from sqlalchemy import text
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import User
from backend.app.auth import get_password_hash
from backend.app.routers import (
    auth, expenses, budgets, savings, ai, reports, admin, notifications, dashboard, medicai
)

# Initialize Database tables and Admin user safely on startup
try:
    Base.metadata.create_all(bind=engine)
    
    # If the database is PostgreSQL, automatically enable Row Level Security (RLS) on all public tables to fix security issues
    if engine.name == "postgresql":
        try:
            with engine.begin() as connection:
                connection.execute(text("""
                    DO $$ 
                    DECLARE 
                        r RECORD;
                    BEGIN 
                        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
                        LOOP 
                            EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
                        END LOOP; 
                    END $$;
                """))
            print("Row Level Security (RLS) enabled on all public tables.")
        except Exception as rls_err:
            print(f"Failed to enable Row Level Security on startup: {rls_err}")

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
        
        medicai.ensure_doctors_seeded(db)
    except Exception as e:
        print(f"Error checking/creating default admin user: {e}")
    finally:
        db.close()
except Exception as e:
    print(f"Database initialization failed during server startup: {e}")

# Rate Limiter setup
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend REST API for the MedicAI Clinical Intelligence Enterprise Platform.",
    version="3.5.0-verified"
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
    expose_headers=["Content-Disposition", "X-Report-Id", "X-Verification-Hash"],
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
app.include_router(medicai.router, prefix=settings.API_V1_STR)

@app.get("/api/status")
def read_root():
    return {
        "status": "online",
        "app_name": settings.PROJECT_NAME,
        "api_version": "v1",
        "documentation": "/docs"
    }

# Mount and serve built React frontend application at root / for unified single-server deployment on http://127.0.0.1:8000
frontend_dist_dir = os.path.join(backend_parent, "frontend", "dist")

# Exception handler to support client-side SPA routing for non-API 404s
@app.exception_handler(StarletteHTTPException)
async def spa_404_exception_handler(request, exc):
    if exc.status_code == 404:
        path = request.url.path
        if not path.startswith(("/api", "/docs", "/redoc", "/openapi.json", "/static")):
            index_path = os.path.join(frontend_dist_dir, "index.html")
            if os.path.exists(index_path):
                return FileResponse(index_path)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

if os.path.exists(frontend_dist_dir):
    assets_dir = os.path.join(frontend_dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend_assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(full_path: str):
        # Exclude internal API, Swagger docs, OpenAPI, and static reports
        if full_path.startswith(("api", "docs", "redoc", "openapi.json", "static")):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        
        target_file = os.path.join(frontend_dist_dir, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        
        index_file = os.path.join(frontend_dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Frontend index.html not found"})

