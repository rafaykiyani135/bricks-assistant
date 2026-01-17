import * as lancedb from '@lancedb/lancedb';
import * as path from 'path';
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

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

function chunkMarkdown(content: string, filename: string): string[] {
  if (filename.includes('UserStories') || filename.includes('UseCase')) {
    const pattern = /###\s+(?!#)(.+?)(?=\n###\s+(?!#)|\n*$)/gs;
    const matches = Array.from(content.matchAll(pattern));
    return matches.map(m => `### ${m[1].trim()}`);
  } else {
    const pattern = /##\s+(?!#)(.+?)(?=\n##\s+(?!#)|\n*$)/gs;
    const matches = Array.from(content.matchAll(pattern));
    return matches.map(m => `## ${m[1].trim()}`);
  }
}

export async function ingestSpecsToLanceDB(specsDirectory: string) {
  if (!fs.existsSync(specsDirectory)) {
    throw new Error(`Specs directory not found: ${specsDirectory}`);
  }

  const mdFiles = fs.readdirSync(specsDirectory).filter(f => f.endsWith('.md'));
  if (mdFiles.length === 0) {
    throw new Error('No .md files found in specs directory');
  }

  const dbDir = path.resolve(__dirname, '../../lancedb_data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = await lancedb.connect(dbDir);
  const tableName = 'specs_knowledge_base_v1';
  const data = [];

  console.log(`Processing ${mdFiles.length} markdown files...`);

  for (const file of mdFiles) {
    const filePath = path.join(specsDirectory, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = chunkMarkdown(content, file);

    console.log(`Chunking ${file}: ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = (await embedder.generate([chunk]))[0];

      data.push({
        source: file,
        chunk_id: i,
        text: chunk,
        vector: embedding,
      });
    }
  }

  console.log(`Ingesting ${data.length} spec chunks into table: ${tableName}`);

  const existingTableNames = await db.tableNames();
  if (existingTableNames.includes(tableName)) {
    console.log(`Table ${tableName} already exists. Dropping and recreating...`);
    await db.dropTable(tableName);
  }

  await db.createTable(tableName, data);
  console.log(`Successfully ingested specs into LanceDB table: ${tableName}`);

  return { chunksAdded: data.length, filesProcessed: mdFiles.length };
}
