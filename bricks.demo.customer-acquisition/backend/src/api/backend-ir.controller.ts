import { Request, Response } from 'express';
import { processBackend } from '../ir-generation/backend-processor';

export async function generateBackendIR(req: Request, res: Response) {
  try {
    const { directory } = req.body;

    if (!directory) {
      return res.status(400).json({ error: 'directory path is required' });
    }

    console.log(`Generating Backend IR for: ${directory}`);
    const backendIR = processBackend(directory);

    const result = {
      metadata: {
        generatedAt: new Date().toISOString(),
        directory,
        version: '2.0.0',
      },
      backend: backendIR,
    };

    res.json(result);
  } catch (error: any) {
    console.error('Error generating backend IR:', error);
    res.status(500).json({ error: error.message });
  }
}
