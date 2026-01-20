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

export async function classifyIntent(query: string): Promise<'FRONTEND' | 'BACKEND'> {
    const prompt = `
You are an intent classifier for a software documentation assistant.

Your job is to decide whether a user's question requires information from:
- FRONTEND documentation (UI, screens, buttons, user flows, interactions)
- BACKEND documentation (APIs, services, controllers, database, business logic)

Classification rules:
- Choose FRONTEND if the answer depends on how a user interacts with the UI.
- Choose BACKEND if the answer depends on server-side logic, APIs, or data handling.
- Choose FRONTEND if the question mentions steps a user performs in the app.
- Choose BACKEND if the question mentions requests, responses, validation, or persistence.
- If the question involves multiple areas, choose the one that is most essential to answer the question.

Output format:
Return ONLY one word: FRONTEND, BACKEND.
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
        return 'BACKEND';

    } catch (error) {
        console.error("Error classifying intent:", error);
        return 'BACKEND'; // Default safely
    }
}

export async function queryKnowledgeBase(query: string, tableName: string = 'frontend_knowledge_base_v1', history: string[] = [], language: string = 'English'): Promise<QueryResult> {
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
    const answer = await generateAnswer(query, retrievedContexts, history, language);

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

/**
 * Hybrid search across Frontend and Specs tables
 */
export async function queryHybridFrontendSpecs(query: string, history: string[] = [], language: string = 'English'): Promise<QueryResult> {
    const dbDir = path.resolve(__dirname, '../../lancedb_data');
    if (!fs.existsSync(dbDir)) {
        throw new Error(`Database directory not found at ${dbDir}. Please run ingestion first.`);
    }

    const db = await lancedb.connect(dbDir);
    const existingTables = await db.tableNames();

    // Tables to search
    const tablesToSearch = ['frontend_knowledge_base_v1', 'specs_knowledge_base_v1']
        .filter(t => existingTables.includes(t));

    if (tablesToSearch.length === 0) {
        throw new Error('No relevant tables (frontend or specs) found for hybrid search.');
    }

    const queryEmbedding = (await embedder.generate([query]))[0];

    // Search all tables in parallel
    const searchTasks = tablesToSearch.map(async (tableName) => {
        const table = await db.openTable(tableName);
        const results = await table.vectorSearch(queryEmbedding).limit(5).toArray();
        return results.map((r: any) => ({ ...r, tableName }));
    });

    const allResults = (await Promise.all(searchTasks)).flat();

    // Sort by distance and take top 5
    const topResults = allResults
        .sort((a, b) => (a._distance || 0) - (b._distance || 0))
        .slice(0, 5);

    if (topResults.length === 0) {
        return {
            answer: "I couldn't find any relevant frontend or specification information.",
            context: []
        };
    }

    const retrievedContexts = topResults.map((r: any) => r.text);
    const answer = await generateAnswer(query, retrievedContexts, history, language);

    return {
        answer,
        context: topResults.map((r: any) => ({
            name: r.name,
            type: r.type,
            text: r.text,
            distance: r._distance,
            sourceTable: r.tableName
        }))
    };
}

async function generateAnswer(query: string, contexts: string[], history: string[] = [], language: string = 'English'): Promise<string> {
    const contextBlock = contexts.join("\n\n---\n\n");
    const historyBlock = history.length > 0 
        ? `\nPREVIOUS CONVERSATION HISTORY:\n${history.join('\n')}\n` 
        : "";

    const prompt = `
  You are a professional Project Consultant. Your goal is to answer questions about the software in a clear and helpful way that a business owner or non-technical user would immediately understand.

  CRITICAL RULES:
  1. **Strict Context Adherence**: DO NOT hallucinate, improvise, or suggest any features, actions, workarounds, or logic not explicitly described in the CONTEXT. If it is not in the CONTEXT, it does not exist for the purpose of your answer.
  2. **Zero Improvisation**: Do not "make stuff up" to be helpful. If a user asks for a workflow or feature not explicitly defined in the CONTEXT, you must state that the feature is not available. Never offer "possible solutions" or "tricky workarounds" unless they are explicitly documented.
  3. **Explicit Refusal**: If a query involves a capability not supported by the code/documentation in the CONTEXT, respond: "The system does not currently support this feature." Do not suggest alternatives or "workarounds" that are not explicitly present in the data.
  4. **Detailed Walkthroughs (User-Facing Names)**: Provide step-by-step guides ONLY using the visible labels or descriptive names of buttons, fields, and screens as they appear in the CONTEXT (e.g., "the 'Save' button", "the 'Add Job' button"). NEVER use technical component names like "UButton", "UTable", "UInput", or "V-model".
  5. **No Technical Jargon**: Do not mention "APIs", "Components", "Frontend/Backend", "JSON", or UI framework prefixes like "U-". Use business-friendly terms like "Service", "Screen", or "Feature".
  6. **Business-Centric**: Group information into high-level business capabilities instead of technical file structures.

  7. **TARGET LANGUAGE**: Respond ONLY in **${language}**. This is a mandatory requirement.

  CONTEXT:
  ${contextBlock}

  ${historyBlock}
  
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
