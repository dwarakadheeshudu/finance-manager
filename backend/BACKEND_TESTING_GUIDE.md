# Backend Setup & Testing Guide

This guide describes how to run and test the FastAPI backend on your laptop.

---

## Pre-requisites
Make sure you have **Python 3.10 or higher** installed on your system. You can verify this by running:
```bash
python --version
```

---

## Installation & Setup Steps

Follow these steps to set up the environment and run the backend:

### 1. Extract the Files
Extract the zip archive to a folder of your choice on your laptop.

### 2. Open Terminal
Open a terminal (Command Prompt/PowerShell on Windows, or Terminal on macOS/Linux) and navigate to the project root directory (the folder where `backend` and `finance.db` are located).

### 3. Create a Python Virtual Environment
Creating a virtual environment ensures that the backend dependencies do not conflict with other Python packages on your laptop.

Run the following command:
```bash
# Windows
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

### 4. Activate the Virtual Environment
Activate the environment you just created:

* **Windows (Command Prompt):**
  ```cmd
  venv\Scripts\activate.bat
  ```
* **Windows (PowerShell):**
  ```powershell
  venv\Scripts\Activate.ps1
  ```
* **macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```

Once activated, your terminal prompt should display `(venv)` at the beginning.

### 5. Install Dependencies
Install all the required python packages using `pip`:
```bash
pip install -r backend/requirements.txt
pip install email-validator
```

---

## Running the Backend

Start the FastAPI application server using Uvicorn:

```bash
# From the project root folder (where finance.db and backend/ are located):
python -m uvicorn backend.app.main:app --port 8000 --reload
```

You should see output indicating that the server is running on `http://127.0.0.1:8000`.

---

## Testing & Verification

### 1. Interactive API Documentation (Swagger UI)
Once the server is running, open your web browser and go to:
* **[http://localhost:8000/docs](http://localhost:8000/docs)**

This is the interactive Swagger UI where you can view all API endpoints, request schemas, and test endpoints directly by clicking **"Try it out"**.

### 2. Pre-seeded Admin Credentials
If you use the provided SQLite database file (`finance.db`), you can log in or authorize with:
- **Email**: `admin@finance.com`
- **Password**: `admin123`

*(Note: If `finance.db` is missing, the backend will automatically generate a new SQLite database file and seed the administrator account above upon startup).*
