from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.database import get_db
from app.models import User, Grade, Subject
from app.schemas import GradeOut
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/grades", tags=["grades"])


@router.get("", response_model=list[GradeOut])
def list_grades(
    student_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Grade).options(
        joinedload(Grade.subject),
        joinedload(Grade.student)
    )
    if student_id:
        q = q.filter(Grade.student_id == student_id)
    if subject_id:
        q = q.filter(Grade.subject_id == subject_id)
    if semester:
        q = q.join(Subject).filter(Subject.semester == semester)
    return q.order_by(Grade.grade_date.desc()).all()
