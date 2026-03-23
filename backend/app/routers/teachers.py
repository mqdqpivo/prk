from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional

from app.database import get_db
from app.models import (
    User, UserRole, Teacher, TeacherSubjectGroup, ScheduleSlot,
    Grade, Attendance, Student, Subject, GradeType, AttendanceStatus
)
from app.schemas import (
    TSGOut, ScheduleSlotOut, GradeOut, GradeCreate, GradeUpdate,
    AttendanceOut, AttendanceBulkCreate, StudentOut
)
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/teachers", tags=["teachers"])


def _get_teacher(db: Session, user_id: int) -> Teacher:
    teacher = db.query(Teacher).filter(Teacher.user_id == user_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Профиль преподавателя не найден")
    return teacher


@router.get("/me/groups", response_model=list[TSGOut])
def get_my_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    teacher = _get_teacher(db, current_user.id)
    tsgs = db.query(TeacherSubjectGroup).options(
        joinedload(TeacherSubjectGroup.subject),
        joinedload(TeacherSubjectGroup.group)
    ).filter(TeacherSubjectGroup.teacher_id == teacher.id).all()
    return tsgs


@router.get("/me/schedule", response_model=list[ScheduleSlotOut])
def get_my_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    teacher = _get_teacher(db, current_user.id)
    slots = db.query(ScheduleSlot).options(
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.subject),
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.group),
    ).join(TeacherSubjectGroup).filter(
        TeacherSubjectGroup.teacher_id == teacher.id
    ).order_by(ScheduleSlot.day_of_week, ScheduleSlot.lesson_number).all()
    return slots


@router.get("/me/gradebook", response_model=list[GradeOut])
def get_gradebook(
    group_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    teacher = _get_teacher(db, current_user.id)
    q = db.query(Grade).options(
        joinedload(Grade.student).joinedload(Student.user),
        joinedload(Grade.subject)
    ).filter(Grade.teacher_id == teacher.id)
    if subject_id:
        q = q.filter(Grade.subject_id == subject_id)
    if group_id:
        q = q.join(Student).filter(Student.group_id == group_id)
    return q.order_by(Grade.grade_date.desc()).all()


@router.post("/me/grades", response_model=GradeOut)
def create_grade(
    data: GradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    teacher = _get_teacher(db, current_user.id)
    grade = Grade(
        student_id=data.student_id,
        subject_id=data.subject_id,
        teacher_id=teacher.id,
        grade_type=data.grade_type,
        value=data.value,
        grade_date=data.grade_date or date.today(),
        comment=data.comment,
    )
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


@router.put("/me/grades/{grade_id}", response_model=GradeOut)
def update_grade(
    grade_id: int,
    data: GradeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    teacher = _get_teacher(db, current_user.id)
    grade = db.query(Grade).filter(Grade.id == grade_id, Grade.teacher_id == teacher.id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Оценка не найдена")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(grade, key, value)
    grade.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(grade)
    return grade


@router.delete("/me/grades/{grade_id}")
def delete_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    teacher = _get_teacher(db, current_user.id)
    grade = db.query(Grade).filter(Grade.id == grade_id, Grade.teacher_id == teacher.id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Оценка не найдена")
    db.delete(grade)
    db.commit()
    return {"message": "Оценка удалена"}


@router.get("/me/attendance/{slot_id}/{date_str}", response_model=list[AttendanceOut])
def get_attendance_for_slot(
    slot_id: int,
    date_str: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    lesson_date = date.fromisoformat(date_str)
    records = db.query(Attendance).options(
        joinedload(Attendance.student).joinedload(Student.user)
    ).filter(
        Attendance.schedule_slot_id == slot_id,
        Attendance.lesson_date == lesson_date
    ).all()
    return records


@router.post("/me/attendance", response_model=list[AttendanceOut])
def bulk_attendance(
    data: AttendanceBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    db.query(Attendance).filter(
        Attendance.schedule_slot_id == data.schedule_slot_id,
        Attendance.lesson_date == data.lesson_date
    ).delete()

    records = []
    for r in data.records:
        att = Attendance(
            student_id=r.student_id,
            schedule_slot_id=data.schedule_slot_id,
            lesson_date=data.lesson_date,
            status=r.status,
            comment=r.comment,
            marked_by=current_user.id,
        )
        db.add(att)
        records.append(att)
    db.commit()
    for r in records:
        db.refresh(r)
    return records
