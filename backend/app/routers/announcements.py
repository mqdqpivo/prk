from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.database import get_db
from app.models import (
    User, UserRole, Announcement, Notification, NotificationType,
    Student, ParentStudent, Teacher, TeacherSubjectGroup
)
from app.schemas import AnnouncementCreate, AnnouncementOut
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


@router.get("", response_model=list[AnnouncementOut])
def list_announcements(
    target_group_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Announcement).options(joinedload(Announcement.author))

    if current_user.role == UserRole.student:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        group_id = student.group_id if student else None
        q = q.filter(
            (Announcement.target_role.in_(["all", "student"])) |
            (Announcement.target_group_id == group_id)
        )
    elif current_user.role == UserRole.parent:
        q = q.filter(Announcement.target_role.in_(["all", "parent"]))
    elif current_user.role == UserRole.teacher:
        q = q.filter(Announcement.target_role.in_(["all", "teacher"]))

    if target_group_id:
        q = q.filter(Announcement.target_group_id == target_group_id)

    return q.order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc()).all()


@router.post("", response_model=AnnouncementOut)
def create_announcement(
    data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher, UserRole.admin, UserRole.dean))
):
    announcement = Announcement(
        author_id=current_user.id,
        **data.model_dump()
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    target_users = []
    if data.target_role in ("all", "student"):
        if data.target_group_id:
            students = db.query(Student).filter(Student.group_id == data.target_group_id).all()
            target_users.extend([s.user_id for s in students])
        else:
            users = db.query(User).filter(User.role == UserRole.student, User.is_active == True).all()
            target_users.extend([u.id for u in users])
    if data.target_role in ("all", "parent"):
        users = db.query(User).filter(User.role == UserRole.parent, User.is_active == True).all()
        target_users.extend([u.id for u in users])
    if data.target_role in ("all", "teacher"):
        users = db.query(User).filter(User.role == UserRole.teacher, User.is_active == True).all()
        target_users.extend([u.id for u in users])

    for uid in set(target_users):
        notif = Notification(
            user_id=uid,
            type=NotificationType.announcement,
            title=f"Новое объявление: {data.title}",
            body=data.content[:200],
            link=f"/announcements",
        )
        db.add(notif)
    db.commit()

    return db.query(Announcement).options(
        joinedload(Announcement.author)
    ).filter(Announcement.id == announcement.id).first()


@router.put("/{announcement_id}", response_model=AnnouncementOut)
def update_announcement(
    announcement_id: int,
    data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher, UserRole.admin, UserRole.dean))
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Объявление не найдено")
    for key, value in data.model_dump().items():
        setattr(ann, key, value)
    db.commit()
    db.refresh(ann)
    return ann


@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher, UserRole.admin, UserRole.dean))
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Объявление не найдено")
    db.delete(ann)
    db.commit()
    return {"message": "Объявление удалено"}


@router.post("/{announcement_id}/pin")
def pin_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.dean))
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Объявление не найдено")
    ann.is_pinned = not ann.is_pinned
    db.commit()
    return {"is_pinned": ann.is_pinned}
