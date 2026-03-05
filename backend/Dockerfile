FROM python:3.12-slim

# Install uv from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Enable bytecode compilation for faster startups
ENV UV_COMPILE_BYTECODE=1
# Use copy instead of hard links to avoid cross-device link issues
ENV UV_LINK_MODE=copy

# Copy only the dependency files first for layer caching
COPY pyproject.toml uv.lock ./

# Install only the dependencies (without the project itself and dev dependencies)
RUN uv sync --frozen --no-install-project --no-dev

# Copy the rest of the application
COPY . .

# Install the project
RUN uv sync --frozen --no-dev

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI using the standard CLI
CMD ["uv", "run", "fastapi", "run", "app.py", "--host", "0.0.0.0", "--port", "8000"]
