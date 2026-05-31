# Smart Personal Finance Manager With AI

An AI-powered personal finance manager designed with a premium fintech dashboard UI. The application helps users log monthly salary income, track expenses in natural language, automatically categorize transactions using mock-BERT NLP intelligence, project future spends, check financial health ratings, and chat with their financial assistant.

---

## Technical Architecture

The application is structured into two main components:

1. **FastAPI Backend (REST API)**: Located in `/backend`. Uses SQLAlchemy models, bcrypt authentication hashes, JWT sessions, rate limiting, PDF reports compile engines, and a dedicated AI integration layer.
2. **Vite + React SPA (Frontend)**: Located in `/frontend`. Uses TypeScript, Tailwind CSS styling, Glassmorphic component styles, Framer Motion transitions, and Recharts interactive graphs.

---

## Pre-Requisites

Make sure you have the following installed on your machine:
- **Python**: Version 3.10 or higher
- **NodeJS**: Version 18 or higher (includes `npm`)

---

## Quick Start & Installation

Follow these steps to launch the application:

### 1. Launch FastAPI Backend

Open a terminal in the project root folder and execute the following:

```bash
# Navigate to backend folder (do this manually)
# Create a python virtual environment (already created)
# Install dependencies
backend/venv/Scripts/pip install -r backend/requirements.txt
backend/venv/Scripts/pip install email-validator

# Run the FastAPI server using Uvicorn
backend/venv/Scripts/python -m uvicorn backend.app.main:app --port 8000 --reload
```

The API documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

*Note: On startup, the database tables are automatically initialized inside a local SQLite file (`finance.db`) and a system administrator account is registered:*
- **Admin Email**: `admin@finance.com`
- **Admin Password**: `admin123`

---

### 2. Launch Vite React Frontend

Open a new terminal in the project root folder and execute:

```bash
# Navigate to frontend folder (do this manually)
# Install dependencies
npm install

# Start development server
npm run dev
```

The React dashboard client will be available at: [http://localhost:5173](http://localhost:5173)

---

## AI Service Layer & BERT Model Plug-in

The backend features a dedicated service module located at `backend/app/services/ai_service.py`. 

### Replacing Mock Categorizer with custom BERT weights
To load your custom BERT sequence classifier, follow these instructions inside `backend/app/services/ai_service.py`:

1. Install PyTorch and transformers:
   ```bash
   backend/venv/Scripts/pip install torch transformers
   ```
2. Modify the model loader block at the top of `ai_service.py`:
   ```python
   from transformers import AutoTokenizer, AutoModelForSequenceClassification
   import torch
   
   MODEL_PATH = "./my_bert_model_weights_folder"
   tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
   model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
   
   CATEGORIES = ["Food", "Travel", "Shopping", "Entertainment", "Bills", "Healthcare", "Education", "Investments", "Savings", "Emergency", "Others"]
   ```
3. Update the categorization function:
   ```python
   def categorize_expense_bert(text: str):
       inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
       with torch.no_grad():
           outputs = model(**inputs)
       probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
       confidence, class_idx = torch.max(probs, dim=-1)
       return CATEGORIES[class_idx.item()], float(confidence.item() * 100)
   ```

---

## Core API Endpoints

The API is fully structured under the `/api` prefix:

### Authentication
- `POST /api/auth/register` - Create user account.
- `POST /api/auth/login` - Retrieve access token.
- `GET /api/auth/me` - Fetch profile metadata.
- `PUT /api/auth/setup-financials` - Setup monthly salary & saving targets.

### Expenses & Budgets
- `GET /api/expenses/` - Query transactions list.
- `POST /api/expenses/` - Log manual expense.
- `POST /api/expenses/nlp` - Log natural language expense (AI parsed).
- `GET /api/budgets/status` - Aggregates category targets vs spent.
- `PUT /api/budgets/{id}` - Adjust budget target limit.

### AI Integration
- `POST /api/ai/categorize-expense` - Parse query string into category & confidence.
- `POST /api/ai/predict-expense` - Time-series spending forecasts.
- `POST /api/ai/savings-recommendation` - Retrieve actionable savings advice.
- `POST /api/ai/financial-health-score` - Calculates 0-100 score + diagnostics.
- `POST /api/ai/chat` - Chatbot RAG assistant.

### Downloads & Reports
- `POST /api/reports/generate/pdf` - Compiles printable PDF summary report.
- `POST /api/reports/generate/excel` - Compiles complete spreadsheet log.
- `GET /api/reports/download/{id}` - Serves report binary download.

### Administration
- `GET /api/admin/analytics` - System health, CPU metrics, and adoption statistics.
