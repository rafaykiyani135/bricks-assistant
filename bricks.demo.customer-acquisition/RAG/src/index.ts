
import * as lancedb from "@lancedb/lancedb";
import * as path from "path";
import * as fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import * as dotenv from "dotenv";
import { transformIRToLaymans } from "./transform";
import { ingestToLanceDB } from "./ingest";

dotenv.config();

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class GeminiEmbeddingFunction {
    async generate(texts: string[]): Promise<number[][]> {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embeddings: number[][] = [];
        for (const text of texts) {
            const result = await model.embedContent(text);
            embeddings.push(result.embedding.values);
        }
        return embeddings;
    }
}

const embedder = new GeminiEmbeddingFunction();

async function queryKB(query: string, tableName: string = "frontend_knowledge_base_v1") {
    const dbDir = path.resolve(__dirname, "../lancedb_data");
    const db = await lancedb.connect(dbDir);
    const table = await db.openTable(tableName);

    console.log(`Querying: "${query}"`);
    const queryEmbedding = (await embedder.generate([query]))[0];

    const results = await table.vectorSearch(queryEmbedding)
        .limit(3)
        .toArray();


    console.log("\n--- Retrieval Results ---");
    const retrievedContexts: string[] = [];

    if (results.length > 0) {
        results.forEach((doc: any, i: number) => {
            console.log(`\nResult ${i + 1}:`);
            console.log(`Name: ${doc.name} (${doc.type})`);
            console.log(`${doc.text}`);
            console.log("-----------------------------------");
            retrievedContexts.push(doc.text); // Collect context
        });

        console.log("\nGenerating answer with Groq (llama-3.3-70b-versatile)...");
        await generateAnswer(query, retrievedContexts);

    } else {
        console.log("No results found.");
    }
}

async function generateAnswer(query: string, contexts: string[]) {
    const contextBlock = contexts.join("\n\n---\n\n");
    const prompt = `
    You are a helpful assistant for a frontend development team.
    Use the following context snippets from the project's documentation to answer the user's question.
    If the context doesn't contain the answer, say "I don't have enough information in the provided context."

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

        console.log("\n=== Groq Answer ===");
        console.log(chatCompletion.choices[0]?.message?.content || "No answer generated.");
        console.log("===================");
    } catch (error) {
        console.error("Error generating answer with Groq:", error);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === "ingest") {
        const irPath = path.resolve(__dirname, "../../IR-converter/output/ir.json");
        console.log("Transforming IR to Layman's terms...");
        const transformed = await transformIRToLaymans(irPath);

        // Save simplified JSON
        const outputDir = path.resolve(__dirname, "../../ir-simplified");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, "sample-simplified.json");
        fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));
        console.log(`Saved simplified JSON to ${outputPath}`);

        console.log("Ingesting into LanceDB...");
        await ingestToLanceDB(transformed);
    } else if (command === "query") {
        const query = args.slice(1).join(" ");
        if (!query) {
            console.log("Please provide a query: npm start query \"How do I...\"");
            return;
        }
        await queryKB(query);
    } else {
        console.log("Usage:");
        console.log("  npm start ingest          - Transform and store IR data");
        console.log("  npm start query <text>    - Query the knowledge base");
    }
}

main().catch(console.error);
