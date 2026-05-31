from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import os
from backend.app.database import get_db
from backend.app.models import User, Report
from backend.app.schemas import ReportResponse
from backend.app.auth import get_current_user
from backend.app.services.report_service import generate_pdf_report, generate_excel_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate/pdf")
def create_pdf_report(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Report for the last 30 days
    start_date = datetime.utcnow() - timedelta(days=30)
    end_date = datetime.utcnow()
    
    file_path = generate_pdf_report(db, current_user, start_date, end_date)
    
    # Save log to DB
    report_log = Report(
        user_id=current_user.id,
        type="monthly",
        start_date=start_date,
        end_date=end_date,
        file_path=file_path
    )
    db.add(report_log)
    db.commit()
    db.refresh(report_log)

    return {"message": "PDF Report generated successfully", "report_id": report_log.id, "file_name": os.path.basename(file_path)}

@router.post("/generate/excel")
def create_excel_report(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    start_date = datetime.utcnow() - timedelta(days=30)
    end_date = datetime.utcnow()
    
    file_path = generate_excel_report(db, current_user, start_date, end_date)
    
    report_log = Report(
        user_id=current_user.id,
        type="monthly",
        start_date=start_date,
        end_date=end_date,
        file_path=file_path
    )
    db.add(report_log)
    db.commit()
    db.refresh(report_log)

    return {"message": "Excel Report generated successfully", "report_id": report_log.id, "file_name": os.path.basename(file_path)}

@router.get("/download/{report_id}")
def download_report(report_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
         raise HTTPException(status_code=404, detail="Report log not found.")
         
    if not os.path.exists(report.file_path):
         raise HTTPException(status_code=404, detail="Physical report file not found on server.")
         
    # Return FileResponse
    media_type = "application/pdf" if report.file_path.endswith(".pdf") else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    return FileResponse(
        path=report.file_path,
        media_type=media_type,
        filename=os.path.basename(report.file_path)
    )

@router.get("/history", response_model=List[ReportResponse])
def get_reports_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()
