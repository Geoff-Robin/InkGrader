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
COPY gateway ./gateway

# Install only the gateway member — no core, no groq/sqlalchemy/psycopg/etc.
RUN uv sync --frozen --package inkgrader-gateway --no-dev

EXPOSE 8001

CMD ["uv", "run", "--package", "inkgrader-gateway", "fastapi", "run", "gateway/gateway.py", "--host", "0.0.0.0", "--port", "8001"]
