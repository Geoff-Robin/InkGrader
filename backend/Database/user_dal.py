import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from Database.models import User
from Database.config import async_session


class UserDAL:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(self, *, email=None, password=None):
        user = User(
            email=email,
            password=password,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_user(self, user_id: uuid.UUID):
        return await self.session.get(User, user_id)

    async def update_user(
        self,
        user_id: uuid.UUID,
        *,
        email: str | None = None,
        password: str | None = None,
    ):
        user = await self.session.get(User, user_id)
        if not user:
            return None

        if email is not None:
            user.email = email
        if password is not None:
            user.password = password

        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def delete_user(self, user_id: uuid.UUID):
        user = await self.session.get(User, user_id)
        if not user:
            return None

        await self.session.delete(user)
        await self.session.commit()
        return user


async def get_user_dal():
    async with async_session() as session:
        yield UserDAL(session)
