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

export async function classifyIntent(query: string): Promise<'FRONTEND' | 'BACKEND' | 'SPECS'> {
    const prompt = `
You are an intent classifier for a software documentation assistant.

Your job is to decide whether a user's question requires information from:
- FRONTEND documentation (UI, screens, buttons, user flows, interactions)
- BACKEND documentation (APIs, services, controllers, database, business logic)
- SPECS documentation (requirements, specifications, user stories, use cases, business rules)

Classification rules:
- Choose FRONTEND if the answer depends on how a user interacts with the UI.
- Choose BACKEND if the answer depends on server-side logic, APIs, or data handling.
- Choose SPECS if the question is about requirements, specifications, features, user stories, or business rules.
- Choose FRONTEND if the question mentions steps a user performs in the app.
- Choose BACKEND if the question mentions requests, responses, validation, or persistence.
- If the question involves multiple areas, choose the one that is most essential to answer the question.

Output format:
Return ONLY one word: FRONTEND, BACKEND, or SPECS.
Do not explain your reasoning.

USER QUESTION: "${query}"
`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            max_tokens: 10,
        });

        const intent = chatCompletion.choices[0]?.message?.content?.trim().toUpperCase() || 'BACKEND';

        // Safety check to ensure we only return valid intents
        if (intent.includes('FRONTEND')) return 'FRONTEND';
        if (intent.includes('SPECS')) return 'SPECS';
        return 'BACKEND';

    } catch (error) {
        console.error("Error classifying intent:", error);
        return 'BACKEND'; // Default safely
    }
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
