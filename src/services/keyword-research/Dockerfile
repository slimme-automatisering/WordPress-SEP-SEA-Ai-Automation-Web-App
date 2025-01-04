FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory for NLTK
RUN mkdir -p /app/data/nltk

# Download NLTK data
RUN python -c "import nltk; nltk.download('punkt', download_dir='/app/data/nltk'); nltk.download('stopwords', download_dir='/app/data/nltk'); nltk.download('wordnet', download_dir='/app/data/nltk')"

# Set environment variable for NLTK data path
ENV NLTK_DATA=/app/data/nltk

# Expose ports for the application and metrics
EXPOSE 5000 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--threads", "2", "--timeout", "120", "server:app"]
