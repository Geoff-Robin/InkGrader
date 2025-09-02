# Use official OpenVINO development image
FROM openvino/ubuntu22_dev:latest AS base

# Switch to root to install system packages
USER root

# Install dependencies (ensure python3-pip is available)
RUN apt-get update && apt-get install -y python3.11 python3.11-venv python3.11-dev && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1 && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

# Make sure pip points to Python3
RUN python3 -m pip install --upgrade pip setuptools wheel

# Switch back to non-root user (openvino)
USER openvino

WORKDIR /app

# Copy dependencies first
COPY requirements.txt .

# Install Python dependencies explicitly with python3
RUN python3 -m pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI
CMD ["python3", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
