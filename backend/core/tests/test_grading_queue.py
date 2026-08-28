import uuid
import pytest
from unittest.mock import patch, AsyncMock

from sqlalchemy import select

from Database.exam_dal import ExamDAL
from Database.student_dal import StudentDAL
from Database.grading_job_dal import GradingJobDAL
from Database.models import Exam, GradingJob, GradingJobStatus
from Database.config import async_session as prod_async_session
from Grading.queue import claim_and_process_batch


async def _make_exam(db_session, user_id: str) -> Exam:
    exam_dal = ExamDAL(db_session)
    exam = Exam(user_id=user_id, exam_name=f"Queue Test {user_id}")
    await exam_dal.create_exam(exam)
    return exam


async def _make_students(db_session, exam_id: uuid.UUID, count: int) -> list[uuid.UUID]:
    student_dal = StudentDAL(db_session)
    students = [
        await student_dal.create_student(exam_id=exam_id, marks=None) for _ in range(count)
    ]
    return [s.id for s in students]


@pytest.mark.asyncio
async def test_enqueue_batch_creates_one_row_per_student(db_session):
    exam = await _make_exam(db_session, "u1")
    student_ids = await _make_students(db_session, exam.id, 2)

    dal = GradingJobDAL(db_session)
    jobs = await dal.enqueue_batch(exam_id=exam.id, student_ids=student_ids, priority=3)

    assert len(jobs) == 2
    assert {job.student_id for job in jobs} == set(student_ids)
    for job in jobs:
        assert job.exam_id == exam.id
        assert job.priority == 3
        assert job.status == GradingJobStatus.QUEUED


@pytest.mark.asyncio
async def test_claim_batch_flips_status_and_respects_limit(db_session):
    exam = await _make_exam(db_session, "u2")
    student_ids = await _make_students(db_session, exam.id, 3)

    dal = GradingJobDAL(db_session)
    await dal.enqueue_batch(exam_id=exam.id, student_ids=student_ids)

    claimed = await dal.claim_batch(limit=2)

    assert len(claimed) == 2
    for job in claimed:
        assert job.status == GradingJobStatus.PROCESSING


@pytest.mark.asyncio
async def test_claim_batch_returns_empty_when_no_queued_rows(db_session):
    dal = GradingJobDAL(db_session)
    assert await dal.claim_batch(limit=5) == []


@pytest.mark.asyncio
async def test_skip_locked_excludes_row_held_by_another_transaction(db_session):
    exam = await _make_exam(db_session, "u3")
    student_ids = await _make_students(db_session, exam.id, 1)

    dal = GradingJobDAL(db_session)
    await dal.enqueue_batch(exam_id=exam.id, student_ids=student_ids)

    session_a = prod_async_session()
    session_b = prod_async_session()
    try:
        async with session_a.begin():
            result = await session_a.execute(
                select(GradingJob)
                .where(GradingJob.status == GradingJobStatus.QUEUED)
                .with_for_update(skip_locked=True)
                .limit(1)
            )
            locked_job = result.scalars().first()
            assert locked_job is not None

            second_claim = await GradingJobDAL(session_b).claim_batch(limit=5)
            assert second_claim == []
    finally:
        await session_a.close()
        await session_b.close()


@pytest.mark.asyncio
async def test_claim_and_process_batch_marks_mixed_outcomes(db_session):
    exam = await _make_exam(db_session, "u4")
    student_ids = await _make_students(db_session, exam.id, 3)

    dal = GradingJobDAL(db_session)
    await dal.enqueue_batch(exam_id=exam.id, student_ids=student_ids)

    async def fake_process_grading_job(info):
        return {sid: (i != 1) for i, sid in enumerate(info.student_ids)}

    mock = AsyncMock(side_effect=fake_process_grading_job)
    with patch("Grading.grading_task.process_grading_job", mock):
        processed = await claim_and_process_batch()

    assert processed == 3
    mock.assert_awaited_once()

    called_info = mock.call_args[0][0]
    assert set(called_info.student_ids) == set(student_ids)
    failed_student_id = called_info.student_ids[1]

    result = await db_session.execute(select(GradingJob).where(GradingJob.exam_id == exam.id))
    statuses = {job.student_id: job.status for job in result.scalars().all()}

    assert statuses[failed_student_id] == GradingJobStatus.FAILED
    for sid in student_ids:
        if sid != failed_student_id:
            assert statuses[sid] == GradingJobStatus.SUCCEEDED


@pytest.mark.asyncio
async def test_claim_and_process_batch_groups_by_exam(db_session):
    exam_a = await _make_exam(db_session, "u5a")
    exam_b = await _make_exam(db_session, "u5b")
    students_a = await _make_students(db_session, exam_a.id, 2)
    students_b = await _make_students(db_session, exam_b.id, 2)

    dal = GradingJobDAL(db_session)
    await dal.enqueue_batch(exam_id=exam_a.id, student_ids=students_a)
    await dal.enqueue_batch(exam_id=exam_b.id, student_ids=students_b)

    async def fake_process_grading_job(info):
        return {sid: True for sid in info.student_ids}

    mock = AsyncMock(side_effect=fake_process_grading_job)
    with patch("Grading.grading_task.process_grading_job", mock):
        processed = await claim_and_process_batch()

    assert processed == 4
    assert mock.await_count == 2

    called_exam_ids = {call.args[0].exam_id for call in mock.call_args_list}
    assert called_exam_ids == {exam_a.id, exam_b.id}
