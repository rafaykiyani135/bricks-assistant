import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { generateFrontendIR } from './api/frontend-ir.controller';
import { generateBackendIR } from './api/backend-ir.controller';
import { transformFrontendIR } from './api/transform.controller';
import { ingestSimplifiedIR } from './api/ingest.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Swagger Documentation
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// IR Generation Endpoints
app.post('/api/ir/frontend', generateFrontendIR);
app.post('/api/ir/backend', generateBackendIR);

// Transformation Endpoint
app.post('/api/transform/frontend', transformFrontendIR);

// Ingestion Endpoint
app.post('/api/ingest', ingestSimplifiedIR);

app.listen(PORT, () => {
  console.log(`🚀 Unified Backend running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});
