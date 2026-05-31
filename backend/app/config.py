import os

class Settings:
    PROJECT_NAME: str = "Smart Personal Finance Manager With AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "finance_manager_super_secret_key_1234567890")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database URLs
    # Will use postgresql://user:password@host:port/dbname if DATABASE_URL is defined,
    # otherwise defaults to SQLite local database file
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finance.db")
    
    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = "60 per minute"
    
    # Admin settings
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@finance.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")


settings = Settings()
