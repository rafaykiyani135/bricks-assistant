import { Request, Response } from 'express';
import { queryKnowledgeBase, classifyIntent, queryHybridFrontendSpecs } from '../rag-processing/query';

export async function queryKB(req: Request, res: Response) {
    try {
        const { query, tableName, history } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query string is required' });
        }

        // Default to backend knowledge base if not specified, 
        // or we could make it default to frontend. 
        // Given the recent context, maybe backend is better, or let the user choose.
        // I'll default to 'frontend_knowledge_base_v1' as per the function default, 
        // but the user can override it.

        console.log(`Processing query: "${query}"`);

        let targetTable = tableName;

        // If no tableName is provided, use AI to classify intent
        if (!targetTable) {
            console.log('🤖 No table specified. Auto-detecting intent...');
            const intent = await classifyIntent(query);
            if (intent === 'FRONTEND') {
                targetTable = 'HYBRID_FRONTEND_SPECS';
            } else {
                targetTable = 'backend_knowledge_base_v1';
            }
            console.log(`🎯 Detected Intent: ${intent} -> Using strategy: ${targetTable}`);
        } else {
            console.log(`ℹ️ Using specified table: ${targetTable}`);
        }

        const result = targetTable === 'HYBRID_FRONTEND_SPECS'
            ? await queryHybridFrontendSpecs(query, history)
            : await queryKnowledgeBase(query, targetTable, history);

        res.json(result);
    } catch (error: any) {
        console.error('Error querying knowledge base:', error);
        res.status(500).json({ error: error.message });
    }
}
