import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from Agents.tools import EMBEDDING_MODEL, rag_tool


@pytest.mark.asyncio
async def test_rag_tool_retrieves_chunks_for_current_exam():
    exam_id = uuid.uuid4()
    embedding_client = MagicMock()
    embedding_client.feature_extraction.return_value = [0.1, 0.2, 0.3]

    with (
        patch("Agents.tools.InferenceClient", return_value=embedding_client),
        patch(
            "Agents.tools.retrieve_similar_chunks",
            new_callable=AsyncMock,
            return_value=[
                SimpleNamespace(content="First relevant passage"),
                SimpleNamespace(content="Second relevant passage"),
            ],
        ) as retrieve,
    ):
        result = await rag_tool("grading query", exam_id, top_k=2)

    embedding_client.feature_extraction.assert_called_once_with(
        "grading query", model=EMBEDDING_MODEL
    )
    retrieve.assert_awaited_once_with([0.1, 0.2, 0.3], exam_id, top_k=2)
    assert result == "First relevant passage\n\nSecond relevant passage"
