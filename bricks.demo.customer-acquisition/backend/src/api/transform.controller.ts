import { Request, Response } from 'express';
import { transformIRToSimplified, transformBackendIRToSimplified } from '../rag-processing/transform';

export async function transformBackendIR(req: Request, res: Response) {
  try {
    let ir = req.body;
    if (ir.backend === undefined && ir.ir) ir = ir.ir; // unwrap if needed

    if (!ir.backend) {
      return res.status(400).json({ error: 'Backend IR with "backend" property is required' });
    }

    console.log('Transforming Backend IR to simplified hybrid format...');
    const simplified = await transformBackendIRToSimplified(ir);
    res.json(simplified);
  } catch (error: any) {
    console.error('Error transforming Backend IR:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function transformFrontendIR(req: Request, res: Response) {
  try {
    let ir = req.body;

    // If body has 'ir' property, unwrap it (backward compatibility)
    if (ir.ir) {
      ir = ir.ir;
    }

    if (!ir.frontend) {
      return res.status(400).json({ error: 'Frontend IR with "frontend" property is required' });
    }

    console.log('Transforming Frontend IR to simplified format...');
    const simplified = await transformIRToSimplified(ir);

    res.json(simplified);
  } catch (error: any) {
    console.error('Error transforming IR:', error);
    res.status(500).json({ error: error.message });
  }
}
