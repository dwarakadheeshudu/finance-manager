# MedicAI Clinical Model Evaluation & End-to-End Proof Report

**Executed:** `2026-11-25T14:53:50.164027Z`
**Runner:** `tests/evaluate_models.py` (FastAPI `TestClient` + `scikit-learn` metrics)

## 1. Classification Metrics Across All 6 Diagnostic Models

| Model | Samples (N) | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Confusion Matrix `[[TN, FP], [FN, TP]]` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Cancer Risk (Oncology XGBoost) | 240 | 0.9458 | 1.0000 | 0.8917 | 0.9427 | 1.0000 | `[[120, 0], [13, 107]]` |
| Heart Disease (Cardiology SVM) | 240 | 0.9917 | 1.0000 | 0.9833 | 0.9916 | 1.0000 | `[[120, 0], [2, 118]]` |
| Parkinson's Voice (KNN Acoustics) | 200 | 0.9950 | 0.9901 | 1.0000 | 0.9950 | 1.0000 | `[[99, 1], [0, 100]]` |
| Type 2 Diabetes (ADA 2026) | 240 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | `[[120, 0], [0, 120]]` |
| Chronic Kidney Disease (KDIGO 2024) | 240 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | `[[120, 0], [0, 120]]` |
| Pneumonia / Respiratory (CURB-65) | 240 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | `[[120, 0], [0, 120]]` |
| **Macro Average** | **1400** | **0.9888** | **0.9983** | **0.9792** | **0.9882** | **1.0000** | — |

## 2. End-to-End Functional, PDF, Appointment & Security Checks

- **PASS** — **Parkinson WAV Signal Extraction**: Healthy=5.3%, Dysphonic=98.5%
- **PASS** — **Rare Disease Dynamic Prioritization & Honest Search**: Mitochondrial top=3T High-Resolution Brain MRI with Spectroscopy (MRS - NAA/Choline ratios) (86.0%)
- **PASS** — **Appointment Persistence, 409 Conflict, Tele-URL, PDF Slip & Cancellation**: Ref=MED-APT-2026-22991, PDF=3620 bytes, 409 conflict & slot release verified
- **PASS** — **Master Clinical PDF Generation & Verifiable Audit Seal**: ReportId=MED-RPT-2026-33084B, PDF=4095 bytes
- **PASS** — **HIPAA Safe Harbor PHI Anonymization**: Redacted Name, DOB, Email, Phone, SSN
