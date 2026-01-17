# Unified Backend - Code Intelligence & RAG System

This backend service is the "brain" of the assistant. It transforms raw source code into an interactive, AI-powered knowledge base. By combining static code analysis with Large Language Models (LLMs), it allows developers and stakeholders to ask questions about a complex codebase in plain English.

---

## � The Intelligent Workflow

The system follows a 5-phase pipeline to move from "Files on Disk" to "Instant Answers".

### 1. Folder Detection & IR Generation
*   **Layman's Explanation**: The system looks for your `client` (Frontend) and `server` (Backend) folders. It then "reads" the code, not just as text, but by understanding its structure (who calls whom, where the data flows).
*   **Technical Detail**: 
    - The `ir-generation` module uses **Tree-sitter** for high-fidelity AST (Abstract Syntax Tree) parsing.
    - It extracts critical metadata like API endpoints, component hierarchies, database schemas, and function dependencies.
    - Result: A high-level **Intermediate Representation (IR)** JSON that captures the "DNA" of the project.

### 2. AI Transformation (The "Simplifier")
*   **Layman's Explanation**: Technical code definitions are often too complex for a chatbot to explain clearly. This phase uses AI to translate dense code into "human-friendly" summaries.
*   **Technical Detail**:
    - The IR is sent to **Google Gemini 1.5 Flash**. 
    - The AI analyzes the technical specs and generates `layout-friendly` summaries, explains the purpose of modules in layman's terms, and identifies core user flows.
    - Result: A **Simplified IR** optimized for natural language retrieval.

### 3. Ingest to LanceDB (Memory Storage)
*   **Layman's Explanation**: To find answers quickly, the system "memorizes" the simplified code summaries by converting them into mathematical vectors (numbers) and storing them in a searchable database.
*   **Technical Detail**:
    - Text chunks are passed through **Google's text-embedding-004** model.
    - The resulting 768-dimensional vectors are stored in **LanceDB**, a high-performance serverless vector database located in `lancedb_data/`.

### 4. Intent Classification (The "Traffic Controller")
*   **Layman's Explanation**: When you ask a question, the system first decides if you're asking about the "Look and Feel" (Frontend) or the "System Logic" (Backend). This ensures it searches the right "notebook" for the answer.
*   **Technical Detail**:
    - A specialized **Groq-powered LLM (Llama 3.3)** acts as a classifier.
    - It evaluates your query against a custom system prompt to determine if the target is the `frontend` or `backend` knowledge base.

### 5. Intelligent Query (RAG)
*   **Layman's Explanation**: Finally, the system retrieves the most relevant "memories" from storage and uses them as a reference to write a factual, helpful answer to your question.
*   **Technical Detail**:
    - This implements **Retrieval-Augmented Generation (RAG)**.
    - It performs a vector similarity search in the detected LanceDB table.
    - The top results are fed into a final Groq LLM prompt to generate the response.

---

## 📂 Project Structure

```text
backend/
├── scripts/
│   └── automate_workflow.ts        # 🚀 Orchestrates Phase 1 -> Phase 3
├── src/
│   ├── index.ts                    # Entry point & API Routing
│   ├── api/                        # Request Handlers (Controllers)
│   ├── ir-generation/              # Phase 1: Static Analysis (Tree-sitter)
│   └── rag-processing/             # Phase 2-5: AI & Vector Logic (Gemini/Groq/LanceDB)
├── lancedb_data/                   # Local Vector Database Files
└── swagger.yaml                    # API Specs (accessible via /api-docs)
```

## 🛠️ Getting Started

1.  **Install**: `npm install`
2.  **Environment**: Configure `.env` with your `GOOGLE_API_KEY` and `GROQ_API_KEY`.
3.  **Run Server**: `npm run dev` (Starts on port 3001)

## ⚡ Running the Pipeline

To process your entire project at once, run the automation script:
```bash
npx ts-node scripts/automate_workflow.ts
```

Once complete, you can send POST requests to `/api/query` and the AI will automatically route your questions to the correct context!


