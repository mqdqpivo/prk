from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.database import get_db
from app.models import User, UserRole, ScheduleSlot, TeacherSubjectGroup, Teacher
from app.schemas import ScheduleSlotOut, ScheduleSlotCreate
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/schedule", tags=["schedule"])


@router.get("", response_model=list[ScheduleSlotOut])
def list_schedule(
    group_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    week: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(ScheduleSlot).options(
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.subject),
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.group),
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.teacher).joinedload(Teacher.user),
    ).join(TeacherSubjectGroup)

    if group_id:
        q = q.filter(TeacherSubjectGroup.group_id == group_id)
    if teacher_id:
        q = q.filter(TeacherSubjectGroup.teacher_id == teacher_id)
    if week in ("odd", "even"):
        q = q.filter(ScheduleSlot.week_type.in_([week, "all"]))

    return q.order_by(ScheduleSlot.day_of_week, ScheduleSlot.lesson_number).all()


@router.post("", response_model=ScheduleSlotOut)
def create_slot(
    data: ScheduleSlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.dean))
):
    conflict = db.query(ScheduleSlot).join(TeacherSubjectGroup).filter(
        ScheduleSlot.day_of_week == data.day_of_week,
        ScheduleSlot.lesson_number == data.lesson_number,
        ScheduleSlot.room == data.room,
        ScheduleSlot.week_type.in_([data.week_type, "all"]),
    ).first()
    if conflict:
        raise HTTPException(status_code=400, detail="Конфликт расписания: аудитория занята")

    tsg = db.query(TeacherSubjectGroup).filter(TeacherSubjectGroup.id == data.tsg_id).first()
    if tsg:
        teacher_conflict = db.query(ScheduleSlot).join(TeacherSubjectGroup).filter(
            ScheduleSlot.day_of_week == data.day_of_week,
            ScheduleSlot.lesson_number == data.lesson_number,
            TeacherSubjectGroup.teacher_id == tsg.teacher_id,
            ScheduleSlot.week_type.in_([data.week_type, "all"]),
        ).first()
        if teacher_conflict:
            raise HTTPException(status_code=400, detail="Конфликт расписания: преподаватель занят")

    slot = ScheduleSlot(**data.model_dump())
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return db.query(ScheduleSlot).options(
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.subject),
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.group),
    ).filter(ScheduleSlot.id == slot.id).first()


@router.put("/{slot_id}", response_model=ScheduleSlotOut)
def update_slot(
    slot_id: int,
    data: ScheduleSlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.dean))
):
    slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Слот не найден")
    for key, value in data.model_dump().items():
        setattr(slot, key, value)
    db.commit()
    db.refresh(slot)
    return db.query(ScheduleSlot).options(
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.subject),
        joinedload(ScheduleSlot.tsg).joinedload(TeacherSubjectGroup.group),
    ).filter(ScheduleSlot.id == slot.id).first()


@router.delete("/{slot_id}")
def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.dean))
):
    slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Слот не найден")
    db.delete(slot)
    db.commit()
    return {"message": "Слот удалён"}
