FROM python:3.11-slim

WORKDIR /app

# Create a non-root user
RUN adduser --disabled-password --gecos "" appuser

RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x /app/wait-for-it.sh

# Change ownership and switch to non-root user
RUN chown -R appuser:appuser /app
USER appuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
