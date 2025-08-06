# FastAPI Backend

A FastAPI backend service with OpenAI GPT integration.

## Features

- FastAPI framework with automatic API documentation
- OpenAI GPT integration for chat functionality
- CORS enabled for frontend communication
- Health check endpoints
- Docker containerized

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/status` - API status and configuration
- `POST /chat` - Chat with OpenAI GPT

## Development

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

3. Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Docker Development

The backend runs automatically when using docker-compose from the root directory.

## API Documentation

When running, visit:
- `http://localhost:8000/docs` - Swagger UI
- `http://localhost:8000/redoc` - ReDoc
