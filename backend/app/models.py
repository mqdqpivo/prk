import enum
from datetime import datetime, date, time
from sqlalchemy import (
    Column, Integer, String, Boolean, Text, Date, Time, Numeric,
    SmallInteger, ForeignKey, Enum, DateTime, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    parent = "parent"
    teacher = "teacher"
    admin = "admin"
    dean = "dean"


class EducationLevel(str, enum.Enum):
    bachelor = "bachelor"
    master = "master"
    specialist = "specialist"
    spo = "spo"


class WeekType(str, enum.Enum):
    all = "all"
    odd = "odd"
    even = "even"


class GradeType(str, enum.Enum):
    current = "current"
    midterm = "midterm"
    exam = "exam"
    assignment = "assignment"
    attendance_bonus = "attendance_bonus"


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"


class SubmissionStatus(str, enum.Enum):
    pending = "pending"
    submitted = "submitted"
    checked = "checked"
    late = "late"


class TargetRole(str, enum.Enum):
    all = "all"
    student = "student"
    parent = "parent"
    teacher = "teacher"


class NotificationType(str, enum.Enum):
    new_grade = "new_grade"
    absent = "absent"
    assignment_due = "assignment_due"
    announcement = "announcement"
    message = "message"
    assignment_checked = "assignment_checked"


class ParentRelation(str, enum.Enum):
    mother = "mother"
    father = "father"
    guardian = "guardian"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    middle_name = Column(String(100))
    phone = Column(String(20))
    avatar_url = Column(String(255))
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="user", uselist=False)
    teacher = relationship("Teacher", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    sent_messages = relationship("ChatMessage", foreign_keys="ChatMessage.sender_id", back_populates="sender")
    received_messages = relationship("ChatMessage", foreign_keys="ChatMessage.receiver_id", back_populates="receiver")


class Specialty(Base):
    __tablename__ = "specialties"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20))
    name = Column(String(255))
    profile = Column(String(255))
    level = Column(Enum(EducationLevel))
    short_code = Column(String(20))
    duration_years = Column(SmallInteger)

    groups = relationship("Group", back_populates="specialty")
    subjects = relationship("Subject", back_populates="specialty")


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50))
    specialty_id = Column(Integer, ForeignKey("specialties.id"))
    year_start = Column(SmallInteger)
    curator_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    specialty = relationship("Specialty", back_populates="groups")
    curator = relationship("User", foreign_keys=[curator_id])
    students = relationship("Student", back_populates="group")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    student_number = Column(String(20), unique=True)
    birth_date = Column(Date)
    enrollment_date = Column(Date)

    user = relationship("User", back_populates="student")
    group = relationship("Group", back_populates="students")
    grades = relationship("Grade", back_populates="student")
    attendance_records = relationship("Attendance", back_populates="student")
    submissions = relationship("AssignmentSubmission", back_populates="student")
    parent_links = relationship("ParentStudent", back_populates="student")


class ParentStudent(Base):
    __tablename__ = "parent_student"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("users.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    relation = Column(Enum(ParentRelation))

    parent = relationship("User", foreign_keys=[parent_id])
    student = relationship("Student", back_populates="parent_links")


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    position = Column(String(100))
    degree = Column(String(100))
    department = Column(String(255))

    user = relationship("User", back_populates="teacher")
    subject_groups = relationship("TeacherSubjectGroup", back_populates="teacher")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    short_name = Column(String(50))
    specialty_id = Column(Integer, ForeignKey("specialties.id"))
    semester = Column(SmallInteger)
    hours_total = Column(SmallInteger)
    hours_lectures = Column(SmallInteger)
    hours_practice = Column(SmallInteger)

    specialty = relationship("Specialty", back_populates="subjects")
    teacher_groups = relationship("TeacherSubjectGroup", back_populates="subject")


class TeacherSubjectGroup(Base):
    __tablename__ = "teacher_subject_group"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    academic_year = Column(String(10))
    semester = Column(SmallInteger)

    teacher = relationship("Teacher", back_populates="subject_groups")
    subject = relationship("Subject", back_populates="teacher_groups")
    group = relationship("Group")
    schedule_slots = relationship("ScheduleSlot", back_populates="tsg")
    assignments = relationship("Assignment", back_populates="tsg")


class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"

    id = Column(Integer, primary_key=True, index=True)
    tsg_id = Column(Integer, ForeignKey("teacher_subject_group.id"))
    day_of_week = Column(SmallInteger)
    lesson_number = Column(SmallInteger)
    room = Column(String(20))
    week_type = Column(Enum(WeekType), default=WeekType.all)
    start_time = Column(Time)
    end_time = Column(Time)

    tsg = relationship("TeacherSubjectGroup", back_populates="schedule_slots")
    attendance_records = relationship("Attendance", back_populates="schedule_slot")


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    grade_type = Column(Enum(GradeType))
    value = Column(Numeric(4, 2))
    grade_date = Column(Date)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="grades")
    subject = relationship("Subject")
    teacher = relationship("Teacher")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    schedule_slot_id = Column(Integer, ForeignKey("schedule_slots.id"))
    lesson_date = Column(Date)
    status = Column(Enum(AttendanceStatus))
    comment = Column(Text)
    marked_by = Column(Integer, ForeignKey("users.id"))
    marked_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="attendance_records")
    schedule_slot = relationship("ScheduleSlot", back_populates="attendance_records")
    marker = relationship("User", foreign_keys=[marked_by])


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    tsg_id = Column(Integer, ForeignKey("teacher_subject_group.id"))
    title = Column(String(255))
    description = Column(Text)
    file_url = Column(String(255))
    due_date = Column(DateTime)
    max_score = Column(SmallInteger, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)

    tsg = relationship("TeacherSubjectGroup", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("students.id"))
    content = Column(Text)
    file_url = Column(String(255))
    score = Column(SmallInteger)
    feedback = Column(Text)
    submitted_at = Column(DateTime)
    checked_at = Column(DateTime)
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.pending)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("Student", back_populates="submissions")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    content = Column(Text)
    target_role = Column(Enum(TargetRole))
    target_group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", foreign_keys=[author_id])
    target_group = relationship("Group", foreign_keys=[target_group_id])


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(Enum(NotificationType))
    title = Column(String(255))
    body = Column(Text)
    is_read = Column(Boolean, default=False)
    link = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
