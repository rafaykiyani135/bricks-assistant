
import * as lancedb from "@lancedb/lancedb";
import * as path from "path";
import * as fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { ChatbotFriendlyDoc } from "./types";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

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

export async function ingestToLanceDB(doc: ChatbotFriendlyDoc, tableName: string = "frontend_knowledge_base_v1") {
    const dbDir = path.resolve(__dirname, "../lancedb_data");
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir);
    }

    const db = await lancedb.connect(dbDir);

    // Flatten elements for storage
    const data = [];
    console.log("Generating embeddings...");

    for (const element of doc.elements) {
        const textChunk = `
            Name: ${element.name}
            Type: ${element.type}
            Route: ${element.route || "N/A"}
            Summary: ${element.summaryDescriptionInLaymansTerms}
            Actions: ${element.detailedUserActions.join(", ")}
            Elements: ${element.visibleElements.join(", ")}
            States: ${element.conditionalStates.join(", ")}
        `.trim();

        // Using the embedder to generate vector
        const embedding = (await embedder.generate([textChunk]))[0];

        data.push({
            name: element.name,
            type: element.type,
            route: element.route || "",
            text: textChunk,
            vector: embedding,
            original: JSON.stringify(element)
        });
    }

    try {
        console.log(`Ingesting ${data.length} records into table: ${tableName}`);
        // Overwrite mode is not direct in all versions, but typically we can drop or create with overwrite
        // checking if table exists
        const existingTableNames = await db.tableNames();
        if (existingTableNames.includes(tableName)) {
            await db.dropTable(tableName);
        }

        await db.createTable(tableName, data);
        console.log(`Successfully ingested into LanceDB table: ${tableName}`);
    } catch (e) {
        console.error("Error creating/writing to LanceDB table:", e);
        throw e;
    }
}
