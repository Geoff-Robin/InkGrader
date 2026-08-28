import uuid
from typing import List

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from Database.models import GradingJob, GradingJobStatus
from Database.config import async_session


class GradingJobDAL:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def enqueue_batch(
        self, exam_id: uuid.UUID, student_ids: List[uuid.UUID], priority: int = 0
    ) -> List[GradingJob]:
        jobs = [
            GradingJob(exam_id=exam_id, student_id=student_id, priority=priority)
            for student_id in student_ids
        ]
        self.session.add_all(jobs)
        await self.session.commit()
        for job in jobs:
            await self.session.refresh(job)
        return jobs

    async def claim_batch(self, limit: int) -> List[GradingJob]:
        async with self.session.begin():
            result = await self.session.execute(
                select(GradingJob)
                .where(GradingJob.status == GradingJobStatus.QUEUED)
                .order_by(GradingJob.priority.desc(), GradingJob.created_at.asc())
                .limit(limit)
                .with_for_update(skip_locked=True)
            )
            jobs = list(result.scalars().all())
            for job in jobs:
                job.status = GradingJobStatus.PROCESSING
        for job in jobs:
            await self.session.refresh(job)
        return jobs

    async def mark_statuses(
        self, succeeded_ids: List[uuid.UUID], failed_ids: List[uuid.UUID]
    ) -> None:
        if succeeded_ids:
            await self.session.execute(
                update(GradingJob)
                .where(GradingJob.id.in_(succeeded_ids))
                .values(status=GradingJobStatus.SUCCEEDED)
            )
        if failed_ids:
            await self.session.execute(
                update(GradingJob)
                .where(GradingJob.id.in_(failed_ids))
                .values(status=GradingJobStatus.FAILED)
            )
        if succeeded_ids or failed_ids:
            await self.session.commit()


async def get_grading_job_dal():
    async with async_session() as session:
        return GradingJobDAL(session)
