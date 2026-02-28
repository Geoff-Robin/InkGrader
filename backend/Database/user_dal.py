from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from Database import User
from Database.config import async_session


class UserDAL:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(self, *, role: str, email=None, password=None, marks=None):
        user = User(
            role=role,
            email=email,
            password=password,
            marks=marks,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_user(self, user_id: int):
        return await self.session.get(User, user_id)

    async def update_user(
        self,
        user_id: int,
        *,
        role: str | None = None,
        email: str | None = None,
        password: str | None = None,
        marks: int | None = None,
    ):
        user = await self.session.get(User, user_id)
        if not user:
            return None

        # update role first (important for validators)
        if role is not None:
            user.role = role

        # teacher fields
        if email is not None:
            user.email = email
        if password is not None:
            user.password = password

        # student field
        if marks is not None:
            user.marks = marks

        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def delete_user(self, user_id: int):
        user = await self.session.get(User, user_id)
        if not user:
            return None

        await self.session.delete(user)
        await self.session.commit()
        return user


async def get_user_dal():
    async with async_session() as session:
        yield UserDAL(session)
