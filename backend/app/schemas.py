from datetime import datetime, date, time
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserBase(BaseModel):
    email: EmailStr
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None


class UserOut(UserBase):
    id: int
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class SpecialtyOut(BaseModel):
    id: int
    code: Optional[str] = None
    name: Optional[str] = None
    profile: Optional[str] = None
    level: Optional[str] = None
    short_code: Optional[str] = None
    duration_years: Optional[int] = None

    class Config:
        from_attributes = True


class GroupBase(BaseModel):
    name: str
    specialty_id: int
    year_start: int
    curator_id: Optional[int] = None


class GroupCreate(GroupBase):
    pass


class GroupOut(GroupBase):
    id: int
    specialty: Optional[SpecialtyOut] = None

    class Config:
        from_attributes = True


class StudentOut(BaseModel):
    id: int
    user_id: int
    group_id: int
    student_number: Optional[str] = None
    birth_date: Optional[date] = None
    enrollment_date: Optional[date] = None
    user: Optional[UserOut] = None
    group: Optional[GroupOut] = None

    class Config:
        from_attributes = True


class TeacherOut(BaseModel):
    id: int
    user_id: int
    position: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


class SubjectOut(BaseModel):
    id: int
    name: Optional[str] = None
    short_name: Optional[str] = None
    specialty_id: Optional[int] = None
    semester: Optional[int] = None
    hours_total: Optional[int] = None
    hours_lectures: Optional[int] = None
    hours_practice: Optional[int] = None

    class Config:
        from_attributes = True


class TSGOut(BaseModel):
    id: int
    teacher_id: int
    subject_id: int
    group_id: int
    academic_year: Optional[str] = None
    semester: Optional[int] = None
    subject: Optional[SubjectOut] = None
    group: Optional[GroupOut] = None
    teacher: Optional[TeacherOut] = None

    class Config:
        from_attributes = True


class ScheduleSlotOut(BaseModel):
    id: int
    tsg_id: int
    day_of_week: int
    lesson_number: int
    room: Optional[str] = None
    week_type: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    tsg: Optional[TSGOut] = None

    class Config:
        from_attributes = True


class ScheduleSlotCreate(BaseModel):
    tsg_id: int
    day_of_week: int
    lesson_number: int
    room: Optional[str] = None
    week_type: str = "all"
    start_time: Optional[time] = None
    end_time: Optional[time] = None


class GradeBase(BaseModel):
    student_id: int
    subject_id: int
    grade_type: str
    value: float
    grade_date: Optional[date] = None
    comment: Optional[str] = None


class GradeCreate(GradeBase):
    pass


class GradeUpdate(BaseModel):
    value: Optional[float] = None
    grade_type: Optional[str] = None
    comment: Optional[str] = None


class GradeOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    teacher_id: int
    grade_type: Optional[str] = None
    value: Optional[float] = None
    grade_date: Optional[date] = None
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    subject: Optional[SubjectOut] = None
    student: Optional[StudentOut] = None

    class Config:
        from_attributes = True


class AttendanceBase(BaseModel):
    student_id: int
    schedule_slot_id: int
    lesson_date: date
    status: str
    comment: Optional[str] = None


class AttendanceBulkCreate(BaseModel):
    schedule_slot_id: int
    lesson_date: date
    records: List[AttendanceBase]


class AttendanceOut(BaseModel):
    id: int
    student_id: int
    schedule_slot_id: int
    lesson_date: Optional[date] = None
    status: Optional[str] = None
    comment: Optional[str] = None
    marked_by: Optional[int] = None
    marked_at: Optional[datetime] = None
    schedule_slot: Optional[ScheduleSlotOut] = None
    student: Optional[StudentOut] = None

    class Config:
        from_attributes = True


class AssignmentBase(BaseModel):
    tsg_id: int
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    due_date: Optional[datetime] = None
    max_score: int = 100


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentOut(BaseModel):
    id: int
    tsg_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    due_date: Optional[datetime] = None
    max_score: Optional[int] = None
    created_at: Optional[datetime] = None
    tsg: Optional[TSGOut] = None

    class Config:
        from_attributes = True


class SubmissionCreate(BaseModel):
    content: Optional[str] = None
    file_url: Optional[str] = None


class SubmissionCheck(BaseModel):
    score: int
    feedback: Optional[str] = None


class SubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    content: Optional[str] = None
    file_url: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[str] = None
    submitted_at: Optional[datetime] = None
    checked_at: Optional[datetime] = None
    status: Optional[str] = None
    student: Optional[StudentOut] = None

    class Config:
        from_attributes = True


class AnnouncementBase(BaseModel):
    title: str
    content: str
    target_role: str = "all"
    target_group_id: Optional[int] = None
    is_pinned: bool = False


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementOut(BaseModel):
    id: int
    author_id: int
    title: Optional[str] = None
    content: Optional[str] = None
    target_role: Optional[str] = None
    target_group_id: Optional[int] = None
    is_pinned: Optional[bool] = None
    created_at: Optional[datetime] = None
    author: Optional[UserOut] = None

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    receiver_id: int
    content: str


class ChatMessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: Optional[str] = None
    is_read: Optional[bool] = None
    sent_at: Optional[datetime] = None
    sender: Optional[UserOut] = None
    receiver: Optional[UserOut] = None

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    user: UserOut
    last_message: Optional[ChatMessageOut] = None
    unread_count: int = 0


class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: Optional[str] = None
    title: Optional[str] = None
    body: Optional[str] = None
    is_read: Optional[bool] = None
    link: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ParentStudentOut(BaseModel):
    id: int
    parent_id: int
    student_id: int
    relation: Optional[str] = None
    student: Optional[StudentOut] = None

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    avg_grade: Optional[float] = None
    absences_month: int = 0
    assignments_due: int = 0
    new_messages: int = 0


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    size: int
