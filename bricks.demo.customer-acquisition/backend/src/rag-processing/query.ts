import * as lancedb from '@lancedb/lancedb';
import * as path from 'path';
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class GeminiEmbeddingFunction {
    async generate(texts: string[]): Promise<number[][]> {
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const embeddings: number[][] = [];
        for (const text of texts) {
            const result = await model.embedContent(text);
            embeddings.push(result.embedding.values);
        }
        return embeddings;
    }
}

const embedder = new GeminiEmbeddingFunction();

export interface QueryResult {
    answer: string;
    context: any[];
}

export async function queryKnowledgeBase(query: string, tableName: string = 'frontend_knowledge_base_v1'): Promise<QueryResult> {
    const dbDir = path.resolve(__dirname, '../../lancedb_data');
    if (!fs.existsSync(dbDir)) {
        throw new Error(`Database directory not found at ${dbDir}. Please run ingestion first.`);
    }

    const db = await lancedb.connect(dbDir);
    const existingTables = await db.tableNames();

    if (!existingTables.includes(tableName)) {
        throw new Error(`Table "${tableName}" not found. Available tables: ${existingTables.join(', ')}`);
    }

    const table = await db.openTable(tableName);

    const queryEmbedding = (await embedder.generate([query]))[0];

    const results = await table.vectorSearch(queryEmbedding)
        .limit(5)
        .toArray();

    if (results.length === 0) {
        return {
            answer: "I couldn't find any relevant information in the knowledge base.",
            context: []
        };
    }

    const retrievedContexts = results.map((r: any) => r.text);
    const answer = await generateAnswer(query, retrievedContexts);

    return {
        answer,
        context: results.map((r: any) => ({
            name: r.name,
            type: r.type,
            text: r.text,
            distance: r._distance
        }))
    };
}

async function generateAnswer(query: string, contexts: string[]): Promise<string> {
    const contextBlock = contexts.join("\n\n---\n\n");
    const prompt = `
  You are a helpful assistant for a development team.
  Use the following context snippets from the project's documentation/codebase to answer the user's question.
  
  If the context doesn't contain the answer, say "I don't have enough information in the provided context." but try your best to infer from what is there.
  
  CONTEXT:
  ${contextBlock}
  
  USER QUESTION:
  ${query}
  
  ANSWER:
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 1024,
        });

        return chatCompletion.choices[0]?.message?.content || "No answer generated.";
    } catch (error) {
        console.error("Error generating answer with Groq:", error);
        return "Sorry, I encountered an error generating the answer.";
    }
}
