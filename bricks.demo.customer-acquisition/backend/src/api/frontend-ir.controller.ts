import { Request, Response } from 'express';
import { processFrontend } from '../ir-generation/frontend-processor';

export async function generateFrontendIR(req: Request, res: Response) {
  try {
    const { directory } = req.body;

    if (!directory) {
      return res.status(400).json({ error: 'directory path is required' });
    }

    console.log(`Generating Frontend IR for: ${directory}`);
    const frontendIR = processFrontend(directory);

    const result = {
      metadata: {
        generatedAt: new Date().toISOString(),
        directory,
        version: '2.0.0',
      },
      frontend: frontendIR,
    };

    res.json(result);
  } catch (error: any) {
    console.error('Error generating frontend IR:', error);
    res.status(500).json({ error: error.message });
  }
}
