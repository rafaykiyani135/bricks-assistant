import { GoogleGenerativeAI } from '@google/generative-ai';
import { IR, ChatbotFriendlyDoc, ComponentIR } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function transformIRToSimplified(ir: IR): Promise<ChatbotFriendlyDoc> {
  if (!ir.frontend) {
    throw new Error('No frontend data found in IR');
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const components: ComponentIR[] = [...ir.frontend.pages, ...ir.frontend.components];
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
You are an expert at explaining technical frontend architectures to non-technical users.
I will provide you with a JSON array of technical component descriptions from a "Frontend Intermediate Representation".

Your task:
1. Analyze each component (pages, reusable blocks, etc.).
2. Extract key elements: routes, visible labels, user actions (clicks, submits), forms, and conditional states (e.g., button disabled when loading).
3. Rephrase everything into clear, simple "layman's terms".
4. Output the result ONLY as a JSON object following this schema:
{
  "elements": [
    {
      "name": "string (component name)",
      "type": "string (page or component)",
      "route": "string (if applicable)",
      "summaryDescriptionInLaymansTerms": "string (clear summary of what this does for a user)",
      "detailedUserActions": ["string list of things a user can do, e.g., 'Click the Login button to submit credentials'"],
      "visibleElements": ["string list of what's on screen, e.g., 'Username input field', 'Login button'"],
      "conditionalStates": ["string list of dynamic behaviors, e.g., 'Submit button turns off while the system is processing'"]
    }
  ]
}

DATA:
${JSON.stringify(components)}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse LLM response as JSON');
  }

  return JSON.parse(jsonMatch[0]) as ChatbotFriendlyDoc;
}
