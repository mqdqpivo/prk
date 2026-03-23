from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from datetime import date, timedelta

from app.database import get_db
from app.models import (
    User, Grade, Attendance, Student, Subject, Group,
    TeacherSubjectGroup, Specialty
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/grades-dynamics")
def grades_dynamics(
    student_id: Optional[int] = None,
    group_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(
        func.date_trunc('week', Grade.grade_date).label("week"),
        func.avg(Grade.value).label("avg_grade")
    )
    if student_id:
        q = q.filter(Grade.student_id == student_id)
    if group_id:
        q = q.join(Student).filter(Student.group_id == group_id)
    if subject_id:
        q = q.filter(Grade.subject_id == subject_id)

    results = q.group_by("week").order_by("week").all()
    return [{"week": r.week.isoformat() if r.week else None, "avg_grade": round(float(r.avg_grade), 2)} for r in results]


@router.get("/attendance-stats")
def attendance_stats(
    group_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(
        Attendance.status,
        func.count(Attendance.id).label("count")
    )
    if group_id:
        q = q.join(Student).filter(Student.group_id == group_id)
    if date_from:
        q = q.filter(Attendance.lesson_date >= date_from)
    if date_to:
        q = q.filter(Attendance.lesson_date <= date_to)

    results = q.group_by(Attendance.status).all()
    return [{"status": r.status.value if r.status else r.status, "count": r.count} for r in results]


@router.get("/group-performance")
def group_performance(
    group_id: Optional[int] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(
        Student.id.label("student_id"),
        User.last_name,
        User.first_name,
        func.avg(Grade.value).label("avg_grade")
    ).join(User, Student.user_id == User.id).join(Grade, Grade.student_id == Student.id)

    if group_id:
        q = q.filter(Student.group_id == group_id)
    if semester:
        q = q.join(Subject, Grade.subject_id == Subject.id).filter(Subject.semester == semester)

    results = q.group_by(Student.id, User.last_name, User.first_name).order_by(User.last_name).all()
    return [{
        "student_id": r.student_id,
        "name": f"{r.last_name} {r.first_name}",
        "avg_grade": round(float(r.avg_grade), 2)
    } for r in results]


@router.get("/subject-avg")
def subject_avg(
    group_id: Optional[int] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(
        Subject.name,
        func.avg(Grade.value).label("avg_grade")
    ).join(Grade, Grade.subject_id == Subject.id)

    if group_id:
        q = q.join(Student, Grade.student_id == Student.id).filter(Student.group_id == group_id)
    if semester:
        q = q.filter(Subject.semester == semester)

    results = q.group_by(Subject.name).order_by(Subject.name).all()
    return [{"subject": r.name, "avg_grade": round(float(r.avg_grade), 2)} for r in results]


@router.get("/top-students")
def top_students(
    group_id: Optional[int] = None,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(
        Student.id.label("student_id"),
        User.last_name,
        User.first_name,
        func.avg(Grade.value).label("avg_grade")
    ).join(User, Student.user_id == User.id).join(Grade, Grade.student_id == Student.id)

    if group_id:
        q = q.filter(Student.group_id == group_id)

    results = q.group_by(Student.id, User.last_name, User.first_name).order_by(
        func.avg(Grade.value).desc()
    ).limit(limit).all()

    return [{
        "student_id": r.student_id,
        "name": f"{r.last_name} {r.first_name}",
        "avg_grade": round(float(r.avg_grade), 2)
    } for r in results]
