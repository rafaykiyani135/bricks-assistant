import { Request, Response } from 'express';
import { ingestToLanceDB } from '../rag-processing/ingest';

export async function ingestSimplifiedIR(req: Request, res: Response) {
  try {
    let { simplifiedIR, tableName } = req.body;

    // Allow passing the IR directly without wrapping it in 'simplifiedIR'
    if (!simplifiedIR && req.body.elements) {
      simplifiedIR = req.body;
    }

    if (!simplifiedIR || !simplifiedIR.elements) {
      return res.status(400).json({ error: 'Simplified IR with elements array is required' });
    }

    // Pass tableName as-is (undefined is fine, simpler detection logic in service)
    console.log(`Ingesting ${simplifiedIR.elements.length} elements...`);

    // We capture the return value if I updated ingestToLanceDB to return the used table name, 
    // but looking at ingest.ts, it returns void.
    // However, for the response message to be accurate on which table was used, 
    // I really should have `ingestToLanceDB` return the table name.
    // BUT, to keep it simple and fix the bug now: 
    // I can replicate the detection logic here OR just say "ingested" without specifying table if undefined.
    // Better: let's trust the service.

    await ingestToLanceDB(simplifiedIR, tableName);

    res.json({
      success: true,
      message: `Successfully ingested ${simplifiedIR.elements.length} elements into LanceDB`,
      tableName: tableName || 'auto-detected',
    });
  } catch (error: any) {
    console.error('Error ingesting to vector DB:', error);
    res.status(500).json({ error: error.message });
  }
}
