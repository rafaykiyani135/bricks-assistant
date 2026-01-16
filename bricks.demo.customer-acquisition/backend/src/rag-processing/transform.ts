import { GoogleGenerativeAI } from '@google/generative-ai';
import { IR, ChatbotFriendlyDoc, ComponentIR, BackendTransformedElement } from './types';
import * as dotenv from "dotenv";
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function transformIRToSimplified(ir: IR): Promise<ChatbotFriendlyDoc> {
  if (!ir.frontend) {
    throw new Error('No frontend data found in IR');
  }

  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
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

export async function transformBackendIRToSimplified(ir: IR): Promise<ChatbotFriendlyDoc> {
  if (!ir.backend) {
    throw new Error('No backend data found in IR');
  }

  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const elements: BackendTransformedElement[] = [];

  // 1. Process Modules
  if (ir.backend.modules && ir.backend.modules.length > 0) {
    const modulesPrompt = `
      You are an expert backend architect.
      Analyze these NestJS Modules.
      For each module, explain its high-level purpose based on its imports, exports, and providers.
      Group dependencies (providers/controllers) into a list.
      
      Output JSON strictly:
      {
        "elements": [
          {
            "name": "ModuleName",
            "type": "module",
            "summary": "Clear layman explanation of what this module handles.",
            "technicalDetails": ["List of controllers and providers"],
            "dependencies": ["List of imported modules"]
          }
        ]
      }
      
      DATA: ${JSON.stringify(ir.backend.modules)}
    `;
    elements.push(...(await generateAndParse<BackendTransformedElement>(model, modulesPrompt)));
  }

  // 2. Process Controllers
  if (ir.backend.controllers && ir.backend.controllers.length > 0) {
    const controllersPrompt = `
      You are an expert backend developer.
      Analyze these NestJS Controllers.
      For each controller, explain its role and what endpoints it provides.
      Summarize the routes into a "technicalDetails" list (e.g., "GET /auth/login - Handles user login").
      
      Output JSON strictly:
      {
        "elements": [
          {
            "name": "ControllerName",
            "type": "controller",
            "summary": "Clear layman explanation of this controller's role.",
            "technicalDetails": ["List of endpoints method + path + description"],
            "dependencies": ["List of injected services"]
          }
        ]
      }
      
      DATA: ${JSON.stringify(ir.backend.controllers)}
    `;
    elements.push(...(await generateAndParse<BackendTransformedElement>(model, controllersPrompt)));
  }

  // 3. Process Services
  if (ir.backend.services && ir.backend.services.length > 0) {
    const servicesPrompt = `
      You are an expert backend developer.
      Analyze these NestJS Services.
      For each service, explain its business logic.
      Summarize the methods into a "technicalDetails" list (e.g., "validateUser - Checks credentials against DB").
      
      Output JSON strictly:
      {
        "elements": [
          {
            "name": "ServiceName",
            "type": "service",
            "summary": "Clear layman explanation of the business logic.",
            "technicalDetails": ["List of methods and what they do"],
            "dependencies": ["List of injected repositories/services"]
          }
        ]
      }
      
      DATA: ${JSON.stringify(ir.backend.services)}
    `;
    elements.push(...(await generateAndParse<BackendTransformedElement>(model, servicesPrompt)));
  }

  // 4. Process DTOs
  if (ir.backend.dtos && ir.backend.dtos.length > 0) {
    const dtosPrompt = `
      You are an API documentation expert.
      Analyze these DTOs (Data Transfer Objects).
      Explain what data structure they represent.
      List the key fields.
      
      Output JSON strictly:
      {
        "elements": [
          {
            "name": "DTOName",
            "type": "dto",
            "summary": "Explanation of what this data object represents.",
            "technicalDetails": ["List of important fields and types"],
            "dependencies": []
          }
        ]
      }
      
      DATA: ${JSON.stringify(ir.backend.dtos)}
    `;
    elements.push(...(await generateAndParse<BackendTransformedElement>(model, dtosPrompt)));
  }

  return { elements };
}

async function generateAndParse<T>(model: any, prompt: string): Promise<T[]> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.elements || [];
  } catch (e) {
    console.error("Error generating/parsing chunk:", e);
    return [];
  }
}
