# Unified Backend - IR Generation & RAG Processing

Detailed documentation for the backend service that coordinates technical analysis (IR Generation), AI-driven simplification, and RAG-based querying using LanceDB and Groq.

## 📂 Project Structure

```text
backend/
├── scripts/
│   └── automate_workflow.ts        # 🚀 Master automation script (IR -> Transform -> Ingest)
├── src/
│   ├── index.ts                    # Main Express server entry point
│   ├── api/                        # Route Controllers (Request/Response handling)
│   │   ├── frontend-ir.controller.ts
│   │   ├── backend-ir.controller.ts
│   │   ├── transform.controller.ts
│   │   ├── ingest.controller.ts
│   │   └── query.controller.ts     # Intelligent query routing with Intent Classification
│   ├── ir-generation/              # AST Analysis & IR Generation Logic
│   │   ├── backend-processor.ts    # Node.js/TypeScript code analysis
│   │   ├── frontend-processor.ts   # Vue/Frontend code analysis
│   │   ├── extractors/            # Low-level AST node extractors
│   │   ├── analyzers/             # Higher-level logic analysis
│   │   └── builders/               # IR builders
│   └── rag-processing/             # AI & Vector DB Integration
│       ├── transform.ts            # Gemini-powered IR simplification
│       ├── ingest.ts               # LanceDB embedding and storage
│       ├── query.ts                # Groq-powered RAG and Intent Classification
│       └── types.ts                # Shared TypeScript interfaces
├── lancedb_data/                   # Local LanceDB vector storage
└── swagger.yaml                    # OpenAPI/Swagger API documentation
```

## 🛠️ Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env` file based on `.env.example`:
    ```makefile
    PORT=3001
    GOOGLE_API_KEY=your_gemini_api_key
    GROQ_API_KEY=your_groq_api_key
    ```

## 🚀 How to Run

### 1. Start the Backend Server
This must be running for the automation or queries to work.
```bash
npm run dev
```
*Server will start on `http://localhost:3001`*

### 2. Automate the Entire Workflow
We provide a master script that automatically detects your `client` and `server` folders, generates IRs, transforms them into AI-friendly formats, and ingests them into the Vector DB.

**Run this in a separate terminal:**
```bash
npx ts-node scripts/automate_workflow.ts
```

### 3. Query the Knowledge Base
You can now ask questions about your codebase. The system uses an **AI Intent Classifier** to automatically route your question to the correct documentation (Frontend vs Backend).

**Example Query:**
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I change the button color?"}'
```

## 📚 API Documentation
Comprehensive API documentation is available via Swagger UI when the server is running:
`http://localhost:3001/api-docs`

