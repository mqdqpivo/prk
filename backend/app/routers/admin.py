from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.database import get_db
from app.models import User, UserRole, Group, Specialty, Subject
from app.schemas import GroupCreate, GroupOut, SubjectOut, SpecialtyOut
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api", tags=["admin"])


@router.get("/groups", response_model=list[GroupOut])
def list_groups(
    specialty_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Group).options(joinedload(Group.specialty))
    if specialty_id:
        q = q.filter(Group.specialty_id == specialty_id)
    return q.order_by(Group.name).all()


@router.post("/groups", response_model=GroupOut)
def create_group(
    data: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.dean))
):
    group = Group(**data.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return db.query(Group).options(joinedload(Group.specialty)).filter(Group.id == group.id).first()


@router.put("/groups/{group_id}", response_model=GroupOut)
def update_group(
    group_id: int,
    data: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.dean))
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")
    for key, value in data.model_dump().items():
        setattr(group, key, value)
    db.commit()
    db.refresh(group)
    return db.query(Group).options(joinedload(Group.specialty)).filter(Group.id == group.id).first()


@router.get("/specialties", response_model=list[SpecialtyOut])
def list_specialties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Specialty).order_by(Specialty.code).all()


@router.get("/subjects", response_model=list[SubjectOut])
def list_subjects(
    specialty_id: Optional[int] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Subject)
    if specialty_id:
        q = q.filter(Subject.specialty_id == specialty_id)
    if semester:
        q = q.filter(Subject.semester == semester)
    return q.order_by(Subject.name).all()
