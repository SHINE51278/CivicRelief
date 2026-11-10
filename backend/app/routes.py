
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Report, User, ReportStatusHistory
from app.schemas import ReportCreate, ReportResponse
from app.dependencies import (
    get_current_citizen,
    get_current_admin,
)


router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Reports"],
)


# --------------------------------
# Request schema for status update
# --------------------------------

class StatusUpdate(BaseModel):
    status: Literal[
        "Submitted",
        "In Review",
        "Verified",
        "Assigned",
        "In Progress",
        "Resolved",
    ]

    remarks: str | None = Field(
        default=None,
        max_length=1000,
    )


# --------------------------------
# Database dependency
# --------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# --------------------------------
# Format history response
# --------------------------------

def format_history(history):
    return [
        {
            "id": item.id,
            "report_id": item.report_id,
            "old_status": item.old_status,
            "new_status": item.new_status,
            "changed_by_id": item.changed_by_id,
            "changed_by_name": (
                item.changed_by.full_name
                if item.changed_by
                else "System"
            ),
            "remarks": item.remarks,
            "changed_at": item.changed_at,
        }
        for item in history
    ]


# --------------------------------
# Create a new report (CITIZEN)
# --------------------------------

@router.post("/", response_model=ReportResponse, status_code=201)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_citizen),
):
    report = Report(
        **payload.model_dump(),
        user_id=current_user.id,
    )

    try:
        db.add(report)
        db.flush()

        initial_history = ReportStatusHistory(
            report_id=report.id,
            old_status=None,
            new_status=report.status,
            changed_by_id=current_user.id,
            remarks="Report submitted",
        )

        db.add(initial_history)
        db.commit()
        db.refresh(report)

        return report

    except Exception:
        db.rollback()
        raise


# --------------------------------
# Retrieve logged-in citizen's reports
# --------------------------------

@router.get("/mine", response_model=list[ReportResponse])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_citizen),
):
    return (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(Report.id.desc())
        .all()
    )


# --------------------------------
# Citizen dashboard statistics
# --------------------------------

@router.get("/mine/stats")
def get_my_report_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_citizen),
):
    query = db.query(Report).filter(
        Report.user_id == current_user.id
    )

    total = query.count()

    resolved = query.filter(
        Report.status == "Resolved"
    ).count()

    in_progress = query.filter(
        Report.status == "In Progress"
    ).count()

    pending = total - resolved - in_progress

    return {
        "total_reports": total,
        "pending_reports": pending,
        "in_progress_reports": in_progress,
        "resolved_reports": resolved,
    }


# --------------------------------
# Retrieve all reports (ADMIN)
# --------------------------------

@router.get("/", response_model=list[ReportResponse])
def list_reports(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    return (
        db.query(Report)
        .order_by(Report.id.desc())
        .all()
    )


# --------------------------------
# Track one report (CITIZEN)
# --------------------------------

@router.get("/mine/{report_id}", response_model=ReportResponse)
def track_my_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_citizen),
):
    report = (
        db.query(Report)
        .filter(
            Report.id == report_id,
            Report.user_id == current_user.id,
        )
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found in your account.",
        )

    return report


# --------------------------------
# Retrieve citizen's report history
# --------------------------------

@router.get("/mine/{report_id}/history")
def get_my_report_history(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_citizen),
):
    report = (
        db.query(Report)
        .filter(
            Report.id == report_id,
            Report.user_id == current_user.id,
        )
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found in your account.",
        )

    history = (
        db.query(ReportStatusHistory)
        .filter(ReportStatusHistory.report_id == report_id)
        .order_by(ReportStatusHistory.changed_at.asc())
        .all()
    )

    return format_history(history)


# --------------------------------
# Retrieve one report (ADMIN)
# --------------------------------

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    report = db.get(Report, report_id)

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    return report


# --------------------------------
# Retrieve report history (ADMIN)
# --------------------------------

@router.get("/{report_id}/history")
def get_report_history(
    report_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    report = db.get(Report, report_id)

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    history = (
        db.query(ReportStatusHistory)
        .filter(ReportStatusHistory.report_id == report_id)
        .order_by(ReportStatusHistory.changed_at.asc())
        .all()
    )

    return format_history(history)


# --------------------------------
# Update report status (ADMIN)
# --------------------------------

@router.patch("/{report_id}/status", response_model=ReportResponse)
def update_report_status(
    report_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    report = db.get(Report, report_id)

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    previous_status = report.status

    # Record only actual status changes
    if previous_status == payload.status:
        return report

    history_entry = ReportStatusHistory(
        report_id=report.id,
        old_status=previous_status,
        new_status=payload.status,
        changed_by_id=current_admin.id,
        remarks=payload.remarks,
    )

    try:
        report.status = payload.status

        db.add(history_entry)
        db.commit()
        db.refresh(report)

        return report

    except Exception:
        db.rollback()
        raise


# --------------------------------
# Global report statistics (ADMIN)
# --------------------------------

@router.get("/stats/summary")
def report_statistics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    total = db.query(Report).count()

    civic = db.query(Report).filter(
        Report.category == "civic"
    ).count()

    emergency = db.query(Report).filter(
        Report.category == "emergency"
    ).count()

    resolved = db.query(Report).filter(
        Report.status == "Resolved"
    ).count()

    pending = db.query(Report).filter(
        Report.status != "Resolved"
    ).count()

    return {
        "total_reports": total,
        "civic_reports": civic,
        "emergency_reports": emergency,
        "resolved_reports": resolved,
        "pending_reports": pending,
    }
