import pytest
import uuid
import json
from unittest.mock import patch, MagicMock, AsyncMock
from pydantic import ValidationError

from Agents.grading_agent import GradingAgent, GradingAgentOutput
from Agents.prompts import GRADING_AGENT_PROMPT

@pytest.fixture
def mock_groq():
    with patch("Agents.grading_agent.AsyncGroq") as mock:
        yield mock

@pytest.fixture(autouse=True)
def mock_rag():
    with patch(
        "Agents.grading_agent.rag_tool",
        new_callable=AsyncMock,
        return_value="The reference answer is 4.",
    ) as mock:
        yield mock

@pytest.mark.asyncio
async def test_grading_agent_success(mock_groq, mock_rag):
    # Setup mock
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_message = MagicMock()

    expected_output = {"question_id": 1, "marks": 4}
    mock_message.content = json.dumps(expected_output)
    mock_response.choices = [MagicMock(message=mock_message)]
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
    mock_groq.return_value = mock_client

    # Execute
    exam_id = uuid.uuid4()
    agent = GradingAgent(api_key="fake_key", exam_id=exam_id)

    query = "Question: 2+2? Answer: 4"
    result = await agent.grade(query=query, max_marks=5)

    # Verify
    assert result is not None
    assert result.question_id == 1
    assert result.marks == 4

    # Check that Groq was called correctly
    mock_client.chat.completions.create.assert_called_once()
    call_kwargs = mock_client.chat.completions.create.call_args.kwargs
    assert call_kwargs["model"] == "openai/gpt-oss-120b"
    assert call_kwargs["messages"][0]["content"] == GRADING_AGENT_PROMPT.format(max_marks=5)
    assert query in call_kwargs["messages"][1]["content"]
    assert "The reference answer is 4." in call_kwargs["messages"][1]["content"]
    mock_rag.assert_awaited_once_with(query, exam_id)

@pytest.mark.asyncio
async def test_grading_agent_continues_when_rag_fails(mock_groq, mock_rag):
    mock_rag.side_effect = RuntimeError("embedding service unavailable")

    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_message = MagicMock(content=json.dumps({"question_id": 1, "marks": 3}))
    mock_response.choices = [MagicMock(message=mock_message)]
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
    mock_groq.return_value = mock_client

    agent = GradingAgent(api_key="fake_key", exam_id=uuid.uuid4())
    result = await agent.grade(query="Question and answer", max_marks=5)

    assert result is not None
    assert result.marks == 3
    call_kwargs = mock_client.chat.completions.create.call_args.kwargs
    assert call_kwargs["messages"][1]["content"] == "Question and answer"

@pytest.mark.asyncio
async def test_grading_agent_invalid_json(mock_groq):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_message = MagicMock()

    mock_message.content = "{ invalid json"
    mock_response.choices = [MagicMock(message=mock_message)]
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
    mock_groq.return_value = mock_client

    exam_id = uuid.uuid4()
    agent = GradingAgent(api_key="fake_key", exam_id=exam_id)

    result = await agent.grade(query="Test", max_marks=10)
    assert result is None

@pytest.mark.asyncio
async def test_grading_agent_validation_error(mock_groq):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_message = MagicMock()

    # Missing required 'marks' field
    mock_message.content = json.dumps({"question_id": 1})
    mock_response.choices = [MagicMock(message=mock_message)]
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
    mock_groq.return_value = mock_client

    exam_id = uuid.uuid4()
    agent = GradingAgent(api_key="fake_key", exam_id=exam_id)

    result = await agent.grade(query="Test", max_marks=5)
    assert result is None
