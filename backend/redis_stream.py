from redis import asyncio as aioredis
import os


class StreamManager:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", 6379))
        self.redis_username = os.getenv("REDIS_USERNAME", "default")
        self.redis_password = os.getenv("REDIS_PASSWORD", "default")
        self.redis = None

    async def connect(self):
        self.redis = aioredis.Redis(
            host=self.redis_url,
            username=self.redis_username,
            port=self.redis_port,
            password=self.redis_password,
            decode_responses=True,
        )
        await self.redis.ping()

    async def add_message(self, stream: str, message: dict):
        """
        Add a message to a Redis stream.
        """
        if self.redis:
            message_id = await self.redis.xadd(stream, message)
            return message_id

    async def create_consumer_group(self, stream: str, group: str, mkstream: bool = True):
        """
        Create a consumer group (ignore if it already exists).
        """
        try:
            await self.redis.xgroup_create(stream, group, id="$", mkstream=mkstream)
        except aioredis.ResponseError as e:
            if "BUSYGROUP" in str(e):
                pass  # Group already exists

    async def read_messages(self, stream: str, group: str, consumer: str, count: int = 1, block: int = 5000):
        """
        Read messages from a stream via a consumer group.
        """
        if self.redis:
            messages = await self.redis.xreadgroup(
                groupname=group,
                consumername=consumer,
                streams={stream: ">"},
                count=count,
                block=block,
            )
            return messages

    async def ack_message(self, stream: str, group: str, message_id: str):
        """
        Acknowledge message processing.
        """
        if self.redis:
            await self.redis.xack(stream, group, message_id)

    async def get_last_message(self, stream: str):
        """
        Get the most recent message from a stream.
        """
        if self.redis:
            msgs = await self.redis.xrevrange(stream, count=1)
            if msgs:
                msg_id, fields = msgs[0]
                return {"id": msg_id, **fields}
        return None


    async def close(self):
        if self.redis:
            await self.redis.close()
