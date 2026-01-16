import { Request, Response } from 'express';
import { ingestToLanceDB } from '../rag-processing/ingest';

export async function ingestSimplifiedIR(req: Request, res: Response) {
  try {
    const { simplifiedIR, tableName } = req.body;

    if (!simplifiedIR || !simplifiedIR.elements) {
      return res.status(400).json({ error: 'Simplified IR with elements array is required' });
    }

    const table = tableName || 'frontend_knowledge_base_v1';
    console.log(`Ingesting ${simplifiedIR.elements.length} elements into ${table}...`);

    await ingestToLanceDB(simplifiedIR, table);

    res.json({
      success: true,
      message: `Successfully ingested ${simplifiedIR.elements.length} elements into ${table}`,
      tableName: table,
    });
  } catch (error: any) {
    console.error('Error ingesting to vector DB:', error);
    res.status(500).json({ error: error.message });
  }
}
