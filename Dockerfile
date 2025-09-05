# Build stage for React app
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage with Python backend and static files
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    libglu1-mesa \
    ffmpeg \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend/ ./backend/
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist ./dist

# Set environment variables
ENV PORT=8000
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=backend/app_unified.py

# Create a robust startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "Starting MiRemover backend on port ${PORT:-8000}"' >> /app/start.sh && \
    echo 'cd /app/backend' >> /app/start.sh && \
    echo 'exec gunicorn --config gunicorn.conf.py app_unified:app' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 8000

CMD ["/app/start.sh"]