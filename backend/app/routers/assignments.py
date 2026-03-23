from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.database import get_db
from app.models import (
    User, UserRole, Assignment, AssignmentSubmission, TeacherSubjectGroup,
    Student, SubmissionStatus
)
from app.schemas import (
    AssignmentCreate, AssignmentOut, SubmissionCreate, SubmissionCheck, SubmissionOut
)
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


@router.get("", response_model=list[AssignmentOut])
def list_assignments(
    group_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Assignment).options(
        joinedload(Assignment.tsg).joinedload(TeacherSubjectGroup.subject),
        joinedload(Assignment.tsg).joinedload(TeacherSubjectGroup.group),
    ).join(TeacherSubjectGroup)
    if group_id:
        q = q.filter(TeacherSubjectGroup.group_id == group_id)
    if subject_id:
        q = q.filter(TeacherSubjectGroup.subject_id == subject_id)
    return q.order_by(Assignment.due_date.desc()).all()


@router.post("", response_model=AssignmentOut)
def create_assignment(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    assignment = Assignment(**data.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    tsg = db.query(TeacherSubjectGroup).filter(TeacherSubjectGroup.id == data.tsg_id).first()
    if tsg:
        students = db.query(Student).filter(Student.group_id == tsg.group_id).all()
        for student in students:
            sub = AssignmentSubmission(
                assignment_id=assignment.id,
                student_id=student.id,
                status=SubmissionStatus.pending
            )
            db.add(sub)
        db.commit()

    return db.query(Assignment).options(
        joinedload(Assignment.tsg).joinedload(TeacherSubjectGroup.subject),
        joinedload(Assignment.tsg).joinedload(TeacherSubjectGroup.group),
    ).filter(Assignment.id == assignment.id).first()


@router.get("/{assignment_id}", response_model=AssignmentOut)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assignment = db.query(Assignment).options(
        joinedload(Assignment.tsg).joinedload(TeacherSubjectGroup.subject),
        joinedload(Assignment.tsg).joinedload(TeacherSubjectGroup.group),
    ).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    return assignment


@router.put("/{assignment_id}", response_model=AssignmentOut)
def update_assignment(
    assignment_id: int,
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    for key, value in data.model_dump().items():
        setattr(assignment, key, value)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    db.delete(assignment)
    db.commit()
    return {"message": "Задание удалено"}


@router.post("/{assignment_id}/submit", response_model=SubmissionOut)
def submit_assignment(
    assignment_id: int,
    data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.student))
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Профиль студента не найден")

    submission = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.student_id == student.id
    ).first()

    if not submission:
        submission = AssignmentSubmission(
            assignment_id=assignment_id,
            student_id=student.id,
        )
        db.add(submission)

    submission.content = data.content
    submission.file_url = data.file_url
    submission.submitted_at = datetime.utcnow()

    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if assignment and assignment.due_date and datetime.utcnow() > assignment.due_date:
        submission.status = SubmissionStatus.late
    else:
        submission.status = SubmissionStatus.submitted

    db.commit()
    db.refresh(submission)
    return submission


@router.get("/{assignment_id}/submissions", response_model=list[SubmissionOut])
def get_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher, UserRole.admin, UserRole.dean))
):
    return db.query(AssignmentSubmission).options(
        joinedload(AssignmentSubmission.student).joinedload(Student.user)
    ).filter(
        AssignmentSubmission.assignment_id == assignment_id
    ).all()


@router.put("/{assignment_id}/submissions/{sub_id}", response_model=SubmissionOut)
def check_submission(
    assignment_id: int,
    sub_id: int,
    data: SubmissionCheck,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.teacher))
):
    submission = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.id == sub_id,
        AssignmentSubmission.assignment_id == assignment_id
    ).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Работа не найдена")
    submission.score = data.score
    submission.feedback = data.feedback
    submission.checked_at = datetime.utcnow()
    submission.status = SubmissionStatus.checked
    db.commit()
    db.refresh(submission)
    return submission
