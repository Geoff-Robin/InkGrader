FROM ubuntu:latest

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

WORKDIR /app

COPY . .

# Install Python dependencies with uv
RUN uv sync --frozen

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI
CMD ["uv", "run", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
