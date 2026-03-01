import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String,
    Integer,
    DateTime,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    validates,
)
from sqlalchemy.orm.interfaces import NO_VALUE


class Base(DeclarativeBase):
    pass


class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    teacher_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    exam_name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    teacher: Mapped["User"] = relationship(back_populates="exams_created")
    questions: Mapped[list["Question"]] = relationship(
        back_populates="exam",
        cascade="all, delete-orphan",
    )


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    exam_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("exams.id"), nullable=False)
    text: Mapped[str] = mapped_column(String(500), nullable=False)

    exam: Mapped["Exam"] = relationship(back_populates="questions")
    answers: Mapped[list["Answers"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
    )


class Answers(Base):
    __tablename__ = "answers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id"), nullable=False)
    answer: Mapped[str] = mapped_column(String(1000), nullable=False)

    student: Mapped["User"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship(back_populates="answers")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str | None] = mapped_column(String(120), unique=True)
    password: Mapped[str | None] = mapped_column(String(120))
    marks: Mapped[int | None] = mapped_column(Integer)

    __table_args__ = (
        CheckConstraint(
            "(role = 'teacher' AND email IS NOT NULL AND password IS NOT NULL) OR "
            "(role != 'teacher' AND email IS NULL AND password IS NULL)",
            name="ck_teacher_auth_only",
        ),
        CheckConstraint(
            "(role = 'student' AND marks IS NOT NULL) OR "
            "(role != 'student' AND marks IS NULL)",
            name="ck_student_marks_only",
        ),
    )

    exams_created: Mapped[list[Exam]] = relationship(
        back_populates="teacher",
        cascade="all, delete-orphan",
    )

    answers: Mapped[list[Answers]] = relationship(
        back_populates="student",
        cascade="all, delete-orphan",
    )

    @validates("email", "password")
    def validate_teacher_auth(self, key, value):
        if self.__dict__.get("role", NO_VALUE) != "teacher" and value is not None:
            raise ValueError("Only teachers can have email/password")
        return value

    @validates("marks")
    def validate_student_marks(self, key, value):
        if self.__dict__.get("role", NO_VALUE) != "student" and value is not None:
            raise ValueError("Only students can have marks")
        return value
