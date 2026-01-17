import { Request, Response } from 'express';
import { ingestSpecsToLanceDB } from '../rag-processing/specs-ingest';

export async function ingestSpecs(req: Request, res: Response) {
  try {
    const { directory } = req.body;

    if (!directory) {
      return res.status(400).json({ error: 'directory path is required' });
    }

    console.log(`Ingesting specs from: ${directory}`);
    const result = await ingestSpecsToLanceDB(directory);

    res.json({
      success: true,
      message: `Successfully ingested ${result.chunksAdded} chunks from ${result.filesProcessed} files`,
      ...result,
    });
  } catch (error: any) {
    console.error('Error ingesting specs:', error);
    res.status(500).json({ error: error.message });
  }
}
