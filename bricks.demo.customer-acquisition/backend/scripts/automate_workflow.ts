
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const API_BASE_URL = 'http://localhost:3001/api';
const CLIENT_DIR = path.resolve(__dirname, '../../client');
const SERVER_DIR = path.resolve(__dirname, '../../server');
const SPECS_DIR = path.resolve(__dirname, '../../spec');
const RAW_IR_DIR = path.resolve(__dirname, '../raw_IR');

function ensureRawDir() {
    if (!fs.existsSync(RAW_IR_DIR)) {
        fs.mkdirSync(RAW_IR_DIR, { recursive: true });
    }
}


async function runWorkflow() {
    console.log('🚀 Starting Automation Workflow...');

    // 1. Detect Directories
    if (!fs.existsSync(CLIENT_DIR)) {
        console.error(`❌ Client directory not found at: ${CLIENT_DIR}`);
        return;
    }
    if (!fs.existsSync(SERVER_DIR)) {
        console.error(`❌ Server directory not found at: ${SERVER_DIR}`);
        return;
    }
    if (!fs.existsSync(SPECS_DIR)) {
        console.error(`❌ Specs directory not found at: ${SPECS_DIR}`);
        return;
    }
    console.log('✅ Directories detected.');

    try {
        // 2. Generate IRs
        console.log('\n--- Generating IRs ---');
        console.log('Generating Frontend IR...');
        const frontendIRRes = await axios.post(`${API_BASE_URL}/ir/frontend`, { directory: CLIENT_DIR });
        const frontendIR = frontendIRRes.data;
        ensureRawDir();
        fs.writeFileSync(path.join(RAW_IR_DIR, 'frontend-raw.json'), JSON.stringify(frontendIR, null, 2));
        console.log('✅ Frontend IR Generated and Saved to raw_IR/frontend-raw.json.');

        console.log('Generating Backend IR...');
        const backendIRRes = await axios.post(`${API_BASE_URL}/ir/backend`, { directory: SERVER_DIR });
        const backendIR = backendIRRes.data;
        fs.writeFileSync(path.join(RAW_IR_DIR, 'backend-raw.json'), JSON.stringify(backendIR, null, 2));
        console.log('✅ Backend IR Generated and Saved to raw_IR/backend-raw.json.');

        // 3. Transform IRs
        console.log('\n--- Transforming IRs ---');
        console.log('Transforming Frontend IR...');
        const frontendSimplifiedRes = await axios.post(`${API_BASE_URL}/transform/frontend`, frontendIR);
        const frontendSimplified = frontendSimplifiedRes.data;
        console.log('✅ Frontend IR Transformed.');

        console.log('Transforming Backend IR...');
        const backendSimplifiedRes = await axios.post(`${API_BASE_URL}/transform/backend`, backendIR);
        const backendSimplified = backendSimplifiedRes.data;
        console.log('✅ Backend IR Transformed.');

        // 4. Ingest Transformed IRs
        console.log('\n--- Ingesting IRs ---');

        // Ingest Frontend
        console.log('Ingesting Frontend data...');
        await axios.post(`${API_BASE_URL}/ingest`, {
            simplifiedIR: frontendSimplified,
            tableName: 'frontend_knowledge_base_v1'
        });
        console.log('✅ Frontend Data Ingested.');

        // Ingest Backend
        console.log('Ingesting Backend data...');
        await axios.post(`${API_BASE_URL}/ingest`, {
            simplifiedIR: backendSimplified,
            tableName: 'backend_knowledge_base_v1'
        });
        console.log('✅ Backend Data Ingested.');

        // Ingest Specs
        console.log('Ingesting Specs data...');
        await axios.post(`${API_BASE_URL}/ingest/specs`, {
            directory: SPECS_DIR
        });
        console.log('✅ Specs Data Ingested.');

        console.log('\n🎉 Workflow Completed Successfully!');
        console.log('You can now use the Query Endpoint to ask questions.');

    } catch (error: any) {
        console.error('❌ Error during workflow execution:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

runWorkflow();
