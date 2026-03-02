import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String,
    Integer,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)


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
    student_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("students.id"), nullable=False)
    question_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("questions.id"), nullable=False)
    answer: Mapped[str] = mapped_column(String(1000), nullable=False)

    student: Mapped["Student"] = relationship(back_populates="answers")
    question: Mapped["Question"] = relationship(back_populates="answers")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str | None] = mapped_column(String(120), unique=True)
    password: Mapped[str | None] = mapped_column(String(120))

    exams_created: Mapped[list[Exam]] = relationship(
        back_populates="teacher",
        cascade="all, delete-orphan",
    )


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    marks: Mapped[int | None] = mapped_column(Integer)

    answers: Mapped[list[Answers]] = relationship(
        back_populates="student",
        cascade="all, delete-orphan",
    )
