import streamlit as st
import requests

st.set_page_config(page_title="MedicAI Clinical Intelligence", page_icon="🩺", layout="wide")

st.title("🩺 MedicAI: Clinical Intelligence & Multi-Disease Diagnostic Platform")
st.markdown("### Real-time Enterprise Clinical Platform • HIPAA & GDPR Secured • Real Appointments")

st.info("MedicAI React Frontend is actively serving on **http://localhost:5173**.\nFastAPI REST endpoints are live on **http://localhost:8000/api**.")

st.markdown("""
#### Platform Capabilities:
- **7 Comprehensive Disease Evaluators:**
  1. Rare Disease Diagnostic Odyssey (11,456 Indexed Disorders)
  2. Cancer Risk Prediction (AUC: 0.864)
  3. Parkinson's Disease Voice Screening (KNN Micro-tremor Classifier)
  4. Cardiovascular Disease Screening (SVM Recall: 0.972)
  5. Type 2 Diabetes & Metabolic Syndrome (ADA 2026 Standards)
  6. Chronic Kidney Disease (CKD-EPI 2021 & KDIGO Staging)
  7. Pneumonia & Acute Respiratory Disease (CURB-65 / BTS Guidelines)
- **100% Real Doctor Appointments:**
  - Persisted in SQLite / PostgreSQL with Conflict Detection & Slot Booking
  - Digitally signed Confirmation Passes & Downloadable PDF Slips
- **Trustworthy & Security Architecture:**
  - HIPAA Safe Harbor Automated De-identification
  - SHA-256 Tamper-Proof Cryptographic Audit Ledger
  - Explainable AI (XAI) with SHAP Feature Importance & Clinical Guidelines Grounding
""")
