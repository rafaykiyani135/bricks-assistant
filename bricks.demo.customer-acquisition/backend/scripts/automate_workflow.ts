
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const API_BASE_URL = 'http://localhost:3001/api';
const CLIENT_DIR = path.resolve(__dirname, '../../client');
const SERVER_DIR = path.resolve(__dirname, '../../server');

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
    console.log('✅ Directories detected.');

    try {
        // 2. Generate IRs
        console.log('\n--- Generating IRs ---');
        console.log('Generating Frontend IR...');
        const frontendIRRes = await axios.post(`${API_BASE_URL}/ir/frontend`, { directory: CLIENT_DIR });
        const frontendIR = frontendIRRes.data;
        console.log('✅ Frontend IR Generated.');

        console.log('Generating Backend IR...');
        const backendIRRes = await axios.post(`${API_BASE_URL}/ir/backend`, { directory: SERVER_DIR });
        const backendIR = backendIRRes.data;
        console.log('✅ Backend IR Generated.');

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
            tableName: 'frontend_knowledge_base_v1' // Explicitly targeting frontend KB
        });
        console.log('✅ Frontend Data Ingested.');

        // Ingest Backend
        console.log('Ingesting Backend data...');
        await axios.post(`${API_BASE_URL}/ingest`, {
            simplifiedIR: backendSimplified,
            tableName: 'backend_knowledge_base_v1' // Explicitly targeting backend KB
        });
        console.log('✅ Backend Data Ingested.');

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
