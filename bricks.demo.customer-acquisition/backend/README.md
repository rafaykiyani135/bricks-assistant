# Unified Backend - IR Generation & RAG Processing

A unified backend service that handles:
1. Frontend & Backend IR generation
2. IR transformation to simplified format
3. Vector DB ingestion for RAG

## Setup

```bash
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
```

## Run

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Server will start on `http://localhost:3001`

**Swagger Documentation**: `http://localhost:3001/api-docs`

## API Endpoints

### 1. Generate Frontend IR
**POST** `/api/ir/frontend`

Request:
```json
{
  "directory": "C:/path/to/frontend/src"
}
```

Response:
```json
{
  "metadata": {
    "generatedAt": "2024-01-16T...",
    "directory": "...",
    "version": "2.0.0"
  },
  "frontend": {
    "pages": [...],
    "components": [...]
  }
}
```

### 2. Generate Backend IR
**POST** `/api/ir/backend`

Request:
```json
{
  "directory": "C:/path/to/backend/src"
}
```

Response:
```json
{
  "metadata": {...},
  "backend": {
    "controllers": [...],
    "services": [...],
    "modules": [...],
    "dtos": [...]
  }
}
```

### 3. Transform Frontend IR
**POST** `/api/transform/frontend`

Request:
```json
{
  "ir": {
    "frontend": {
      "pages": [...],
      "components": [...]
    }
  }
}
```

Response:
```json
{
  "elements": [
    {
      "name": "LoginPage",
      "type": "page",
      "route": "/login",
      "summaryDescriptionInLaymansTerms": "...",
      "detailedUserActions": [...],
      "visibleElements": [...],
      "conditionalStates": [...]
    }
  ]
}
```

### 4. Ingest Simplified IR
**POST** `/api/ingest`

Request:
```json
{
  "simplifiedIR": {
    "elements": [...]
  },
  "tableName": "frontend_knowledge_base_v1"
}
```

Response:
```json
{
  "success": true,
  "message": "Successfully ingested 10 elements into frontend_knowledge_base_v1",
  "tableName": "frontend_knowledge_base_v1"
}
```

## Architecture

```
backend/
├── src/
│   ├── index.ts                    # Express server
│   ├── api/                        # Controllers
│   │   ├── frontend-ir.controller.ts
│   │   ├── backend-ir.controller.ts
│   │   ├── transform.controller.ts
│   │   └── ingest.controller.ts
│   ├── ir-generation/              # IR generation logic
│   │   ├── backend-processor.ts
│   │   ├── frontend-processor.ts
│   │   ├── extractors/
│   │   ├── analyzers/
│   │   └── builders/
│   └── rag-processing/             # RAG logic
│       ├── transform.ts
│       ├── ingest.ts
│       └── types.ts
└── lancedb_data/                   # Vector DB storage
```
