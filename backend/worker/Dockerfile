FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./
COPY core ./core
COPY worker ./worker

# Install only the worker member (+ inkgrader-core) — no fastapi in this image
RUN uv sync --frozen --package inkgrader-worker --no-dev

CMD ["uv", "run", "--package", "inkgrader-worker", "python", "worker/worker.py"]
