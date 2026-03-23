from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional

from app.database import get_db
from app.models import (
    User, UserRole, Student, ParentStudent, Grade, Attendance,
    ScheduleSlot, TeacherSubjectGroup, ChatMessage, Subject
)
from app.schemas import ParentStudentOut, GradeOut, AttendanceOut, ScheduleSlotOut, DashboardStats
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/parents", tags=["parents"])


def _get_parent_children(db: Session, parent_id: int):
    return db.query(ParentStudent).options(
        joinedload(ParentStudent.student).joinedload(Student.user),
        joinedload(ParentStudent.student).joinedload(Student.group)
    ).filter(ParentStudent.parent_id == parent_id).all()


def _verify_parent_child(db: Session, parent_id: int, student_id: int):
    link = db.query(ParentStudent).filter(
        ParentStudent.parent_id == parent_id,
        ParentStudent.student_id == student_id
    ).first()
    if not link:
        raise HTTPException(status_code=403, detail="Это не ваш ребёнок")
    return link


@router.get("/me/children", response_model=list[ParentStudentOut])
def get_children(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.parent))
):
    return _get_parent_children(db, current_user.id)


@router.get("/me/child/{student_id}/grades", response_model=list[GradeOut])
def get_child_grades(
    student_id: int,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.parent))
):
    _verify_parent_child(db, current_user.id, student_id)
    q = db.query(Grade).options(joinedload(Grade.subject)).filter(Grade.student_id == student_id)
    if subject_id:
        q = q.filter(Grade.subject_id == subject_id)
    return q.order_by(Grade.grade_date.desc()).all()


@router.get("/me/child/{student_id}/attendance", response_model=list[AttendanceOut])
def get_child_attendance(
    student_id: int,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.parent))
):
    _verify_parent_child(db, current_user.id, student_id)
    q = db.query(Attendance).options(
        joinedload(Attendance.schedule_slot)
    ).filter(Attendance.student_id == student_id)
    if date_from:
        q = q.filter(Attendance.lesson_date >= date_from)
    if date_to:
        q = q.filter(Attendance.lesson_date <= date_to)
    return q.order_by(Attendance.lesson_date.desc()).all()


@router.get("/me/child/{student_id}/schedule", response_model=list[ScheduleSlotOut])
def get_child_schedule(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.parent))
):
    _verify_parent_child(db, current_user.id, student_id)
    student = db.query(Student).filter(Student.id == student_id).first()
    slots = db.query(ScheduleSlot).options(
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.subject),
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.teacher),
    ).join(TeacherSubjectGroup).filter(
        TeacherSubjectGroup.group_id == student.group_id
    ).order_by(ScheduleSlot.day_of_week, ScheduleSlot.lesson_number).all()
    return slots


@router.get("/me/dashboard")
def parent_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.parent))
):
    children = _get_parent_children(db, current_user.id)
    result = []
    for ps in children:
        student = ps.student
        avg_grade = db.query(func.avg(Grade.value)).filter(Grade.student_id == student.id).scalar()
        month_ago = date.today() - timedelta(days=30)
        absences = db.query(Attendance).filter(
            Attendance.student_id == student.id,
            Attendance.status == "absent",
            Attendance.lesson_date >= month_ago
        ).count()
        result.append({
            "student": {
                "id": student.id,
                "user": {
                    "id": student.user.id,
                    "first_name": student.user.first_name,
                    "last_name": student.user.last_name,
                    "middle_name": student.user.middle_name,
                    "email": student.user.email,
                    "role": student.user.role.value,
                },
                "group": {"id": student.group.id, "name": student.group.name} if student.group else None,
                "student_number": student.student_number,
            },
            "avg_grade": round(float(avg_grade), 2) if avg_grade else None,
            "absences_month": absences,
            "relation": ps.relation.value if ps.relation else None,
        })
    return result
