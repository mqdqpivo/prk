from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional

from app.database import get_db
from app.models import (
    User, UserRole, Student, Grade, Attendance, Assignment,
    AssignmentSubmission, TeacherSubjectGroup, ScheduleSlot,
    ChatMessage, Subject
)
from app.schemas import StudentOut, GradeOut, AttendanceOut, AssignmentOut, DashboardStats
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("", response_model=list[StudentOut])
def list_students(
    group_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Student).options(joinedload(Student.user), joinedload(Student.group))
    if group_id:
        q = q.filter(Student.group_id == group_id)
    if search:
        q = q.join(User).filter(
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%"))
        )
    return q.all()


@router.get("/me/dashboard", response_model=DashboardStats)
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.student))
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Профиль студента не найден")

    avg_grade = db.query(func.avg(Grade.value)).filter(Grade.student_id == student.id).scalar()

    month_ago = date.today() - timedelta(days=30)
    absences = db.query(Attendance).filter(
        Attendance.student_id == student.id,
        Attendance.status == "absent",
        Attendance.lesson_date >= month_ago
    ).count()

    assignments_due = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.student_id == student.id,
        AssignmentSubmission.status.in_(["pending", "submitted"])
    ).count()

    new_messages = db.query(ChatMessage).filter(
        ChatMessage.receiver_id == current_user.id,
        ChatMessage.is_read == False
    ).count()

    return DashboardStats(
        avg_grade=round(float(avg_grade), 2) if avg_grade else None,
        absences_month=absences,
        assignments_due=assignments_due,
        new_messages=new_messages
    )


@router.get("/{student_id}", response_model=StudentOut)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).options(
        joinedload(Student.user), joinedload(Student.group)
    ).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Студент не найден")
    return student


@router.get("/{student_id}/grades", response_model=list[GradeOut])
def get_student_grades(
    student_id: int,
    subject_id: Optional[int] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Grade).options(
        joinedload(Grade.subject)
    ).filter(Grade.student_id == student_id)
    if subject_id:
        q = q.filter(Grade.subject_id == subject_id)
    if semester:
        q = q.join(Subject).filter(Subject.semester == semester)
    return q.order_by(Grade.grade_date.desc()).all()


@router.get("/{student_id}/attendance", response_model=list[AttendanceOut])
def get_student_attendance(
    student_id: int,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Attendance).options(
        joinedload(Attendance.schedule_slot)
    ).filter(Attendance.student_id == student_id)
    if date_from:
        q = q.filter(Attendance.lesson_date >= date_from)
    if date_to:
        q = q.filter(Attendance.lesson_date <= date_to)
    return q.order_by(Attendance.lesson_date.desc()).all()


@router.get("/{student_id}/assignments", response_model=list[AssignmentOut])
def get_student_assignments(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Студент не найден")

    assignments = db.query(Assignment).options(
        joinedload(Assignment.tsg)
    ).join(TeacherSubjectGroup).filter(
        TeacherSubjectGroup.group_id == student.group_id
    ).order_by(Assignment.due_date.desc()).all()
    return assignments
