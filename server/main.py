from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from huggingface_hub import InferenceClient
import chromadb
import re
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

client = InferenceClient(provider="hf-inference", api_key=os.environ["HF_TOKEN"])
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="docs")

def chunk_markdown(content: str, filename: str):
    if "UserStories" in filename or "UseCase" in filename:
        pattern = r'###\s+(?!#)(.+?)(?=\n###\s+(?!#)|\Z)'
        matches = re.finditer(pattern, content, re.DOTALL)
        chunks = [f"### {m.group(1).strip()}" for m in matches]
        return chunks
    else:
        pattern = r'##\s+(?!#)(.+?)(?=\n##\s+(?!#)|\Z)'
        matches = re.finditer(pattern, content, re.DOTALL)
        chunks = [f"## {m.group(1).strip()}" for m in matches]
        return chunks

@app.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.md'):
        raise HTTPException(400, "Only .md files allowed")
    
    content = (await file.read()).decode('utf-8')
    chunks = chunk_markdown(content, file.filename)
    
    embeddings = [client.feature_extraction(chunk, model="BAAI/bge-small-en-v1.5") for chunk in chunks]
    ids = [f"{file.filename}_{i}" for i in range(len(chunks))]
    metadatas = [{"source": file.filename, "chunk_id": i} for i in range(len(chunks))]
    
    collection.add(embeddings=embeddings, documents=chunks, ids=ids, metadatas=metadatas)
    
    return {"status": "success", "chunks_added": len(chunks), "preview": chunks[0][:200] if chunks else None}

class QueryRequest(BaseModel):
    query: str

@app.post("/query")
async def query_documents(request: QueryRequest):
    query_embedding = client.feature_extraction(request.query, model="BAAI/bge-small-en-v1.5")
    results = collection.query(query_embeddings=[query_embedding], n_results=3)
    
    return {
        "chunks": results["documents"][0],
        "metadatas": results["metadatas"][0],
        "distances": results["distances"][0]
    }
