from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import date

from app.database import get_db
from app.models import User, Attendance, Student
from app.schemas import AttendanceOut
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.get("", response_model=list[AttendanceOut])
def list_attendance(
    student_id: Optional[int] = None,
    group_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Attendance).options(
        joinedload(Attendance.schedule_slot),
        joinedload(Attendance.student).joinedload(Student.user)
    )
    if student_id:
        q = q.filter(Attendance.student_id == student_id)
    if group_id:
        q = q.join(Student).filter(Student.group_id == group_id)
    if date_from:
        q = q.filter(Attendance.lesson_date >= date_from)
    if date_to:
        q = q.filter(Attendance.lesson_date <= date_to)
    return q.order_by(Attendance.lesson_date.desc()).all()
