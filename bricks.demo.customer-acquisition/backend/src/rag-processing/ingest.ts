import * as lancedb from '@lancedb/lancedb';
import * as path from 'path';
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatbotFriendlyDoc } from './types';
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

export async function ingestToLanceDB(
  doc: ChatbotFriendlyDoc,
  tableName?: string // Table name is now optional
) {
  // Auto-detect default table name based on content
  let targetTable = tableName;
  if (!targetTable) {
    if (doc.elements.some(e => 'technicalDetails' in e)) {
      targetTable = 'backend_knowledge_base_v1';
    } else {
      targetTable = 'frontend_knowledge_base_v1';
    }
  }
  const dbDir = path.resolve(__dirname, '../../lancedb_data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = await lancedb.connect(dbDir);

  const data = [];
  console.log('Generating embeddings...');

  for (const element of doc.elements) {
    let textChunk = '';

    if ('technicalDetails' in element) {
      // Backend Element
      textChunk = `
Name: ${element.name}
Type: ${element.type}
Summary: ${element.summary}
Details: ${(element.technicalDetails || []).join(', ')}
Dependencies: ${(element.dependencies || []).join(', ')}
`.trim();
    } else {
      // Frontend Element
      // We cast to any or use the known Frontend interface properties
      const fe = element as any;
      textChunk = `
Name: ${fe.name}
Type: ${fe.type}
Route: ${fe.route || 'N/A'}
Summary: ${fe.summaryDescriptionInLaymansTerms}
Actions: ${fe.detailedUserActions.join(', ')}
Elements: ${fe.visibleElements.join(', ')}
States: ${fe.conditionalStates.join(', ')}
`.trim();
    }

    const embedding = (await embedder.generate([textChunk]))[0];
    console.log('text chunk: ', textChunk);

    let route = '';
    if ('route' in element) {
      route = (element as any).route || '';
    }

    data.push({
      name: element.name,
      type: element.type,
      route: route,
      text: textChunk,
      vector: embedding,
      original: JSON.stringify(element),
    });
  }

  console.log(`Ingesting ${data.length} records into table: ${targetTable}`);

  const existingTableNames = await db.tableNames();
  if (existingTableNames.includes(targetTable!)) {
    console.log(`Table ${targetTable} already exists. Dropping and recreating...`);
    await db.dropTable(targetTable!);
  }

  await db.createTable(targetTable!, data);
  console.log(`Successfully ingested into LanceDB table: ${targetTable}`);
}
