import { GoogleGenerativeAI } from '@google/generative-ai';
import { IR, ChatbotFriendlyDoc, ComponentIR, BackendTransformedElement } from './types';
import * as dotenv from "dotenv";
import * as fs from 'fs';
import * as path from 'path';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// ============================================================================
// HELPERS
// ============================================================================

function ensureTransformedDir(): string {
  const dirPath = path.resolve(process.cwd(), 'transformed_IR');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

// ============================================================================
// FRONTEND TRANSFORMATION
// ============================================================================

export async function transformIRToSimplified(ir: IR): Promise<ChatbotFriendlyDoc> {
  if (!ir.frontend) {
    throw new Error('No frontend data found in IR');
  }

  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }

  const components: ComponentIR[] = [...ir.frontend.pages, ...ir.frontend.components];
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1, // Low temperature for consistent, factual output
      topP: 0.95,
      topK: 40,
    }
  });

  const prompt = `
You are an expert at transforming technical frontend code representations into user-friendly documentation.

CRITICAL RULES:
1. NEVER invent or hallucinate UI elements that don't exist in the source data
2. Use EXACT text from "labels" array - don't paraphrase button text
3. Only describe elements that are explicitly present in the data
4. Preserve technical accuracy while making it understandable

TASK:
Transform this Frontend IR data into a user-friendly format.

INPUT DATA STRUCTURE:
- "labels": Array of exact UI text (buttons, placeholders, titles)
- "actions": User interactions (clicks, submits) with their handlers
- "formFields": Input fields with names, types, and validation
- "disabledStates": Conditions when UI elements are disabled
- "componentsUsed": Technical UI components used
- "functions": Available functions and their purposes
- "computed": Calculated stats/variables with their dependencies (EXPLAIN WHERE NUMBERS COME FROM)
- "dataFlow": Tracing of API data into state variables
- "uiStates": Statuses like "loading", "editing", "modal open"
- "entities": Domain concepts (e.g., Customer, Interaction)
- "rules": Business conditions that affect UI behavior

OUTPUT SCHEMA (STRICT JSON):
{
  "elements": [
    {
      "name": "string (exact component name from input)",
      "type": "string (page or component)",
      "route": "string (route path, or N/A for components)",
      "file": "string (file path from input)",
      "summaryDescriptionInLaymansTerms": "string (clear 1-2 sentence summary)",
      "detailedUserActions": [
        "string (specific actions like 'Click the \\"Sign in with Google\\" button to authenticate')"
      ],
      "visibleElements": [
        "string (ONLY elements from labels/formFields/componentsUsed, with exact text in quotes)"
      ],
      "conditionalStates": [
        "string (dynamic behaviors from disabledStates, explain conditions clearly)"
      ],
      "dataProvenance": [
        "string (EXPLAIN ORIGIN: which API populates this, which 'computed' stats are used, and depend on what)"
      ],
      "businessLogic": [
        "string (EXPLAIN RULES: conditions like 'needs attention if...', validation rules, and logic for derived values)"
      ],
      "technicalImplementation": {
        "components": ["array of componentsUsed"],
        "functions": ["array of function names"],
        "composables": ["array of composablesUsed"],
        "formFields": [
          {
            "name": "field name",
            "type": "element type",
            "required": "boolean",
            "placeholder": "text if exists"
          }
        ],
        "labels": [
          {
            "text": "exact label text",
            "element": "element type"
          }
        ]
      }
    }
  ]
}

EXAMPLES OF CORRECT OUTPUT:

Example 1 - OAuth Login (NOT username/password):
{
  "name": "login",
  "type": "page",
  "route": "/auth/login",
  "file": "pages/auth/login.vue",
  "summaryDescriptionInLaymansTerms": "This page allows you to securely log into the application using your Google account.",
  "detailedUserActions": [
    "Click the \\"Sign in with Google\\" button to start the OAuth authentication process.",
    "You will be redirected to Google's login page.",
    "After successful authentication, you'll be brought back to the application."
  ],
  "visibleElements": [
    "\\"Sign in with Google\\" button (UButton component)"
  ],
  "conditionalStates": [
    "After successful login, you are automatically redirected to /auth/success page."
  ],
  "technicalImplementation": {
    "components": ["UButton"],
    "functions": ["login"],
    "composables": [],
    "formFields": [],
    "labels": [
      {"text": "Sign in with Google", "element": "UButton"}
    ]
  }
}

Example 2 - Form with Fields:
{
  "name": "RecordInteractionModal",
  "type": "component",
  "route": "N/A",
  "file": "components/RecordInteractionModal.vue",
  "summaryDescriptionInLaymansTerms": "This modal allows you to record details about an interaction with a customer contact.",
  "detailedUserActions": [
    "Fill in the \\"Date\\" field to specify when the interaction occurred.",
    "Select the interaction type from the dropdown menu.",
    "Enter details in the \\"Message\\" field (placeholder: \\"Enter interaction details...\\").",
    "Click the submit button to save the interaction."
  ],
  "visibleElements": [
    "\\"Date\\" input field (UInput)",
    "Type selection dropdown",
    "\\"Message\\" text area (UTextarea) with placeholder \\"Enter interaction details...\\"",
    "Submit button"
  ],
  "conditionalStates": [
    "All form fields are disabled while the interaction is being saved (isSubmitting).",
    "The submit button is disabled if the form is invalid (!meta.valid) or currently submitting."
  ],
  "dataProvenance": [
    "This component contributes to the 'Interaction' entity lifecycle.",
    "Upon success, it triggers a refresh of the customer's interaction history."
  ],
  "businessLogic": [
    "Requires a valid date and message to be submitted.",
    "The 'type' of interaction must be selected from the predefined list (Call, Email, Meeting)."
  ],
  "technicalImplementation": {
    "components": ["UModal", "UFormField", "UInput", "UTextarea"],
    "functions": ["onSubmit", "handleFormSubmit"],
    "composables": ["useNuxtApp", "useToast", "useForm", "useField"],
    "formFields": [
      {"name": "date", "type": "UInput", "required": false, "placeholder": ""},
      {"name": "type", "type": "select", "required": false, "placeholder": ""},
      {"name": "message", "type": "UTextarea", "required": false, "placeholder": "Enter interaction details..."}
    ],
    "labels": [
      {"text": "Date", "element": "UInput"},
      {"text": "Message", "element": "UTextarea"},
      {"text": "Record Interaction", "element": "UModal"}
    ]
  }
}

CRITICAL VALIDATION:
- If labels array is empty, DON'T invent button text
- If formFields is empty, DON'T describe input fields
- Use exact label text in quotes, don't paraphrase
- Match visible elements to actual components/labels in source data

SOURCE DATA:
${JSON.stringify(components, null, 2)}

Generate the JSON output now:
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Clean markdown code blocks if present
  let cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("LLM Response:", text);
    throw new Error('Failed to parse LLM response as JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]) as ChatbotFriendlyDoc;

  // Validate output
  validateFrontendOutput(parsed, components);
  console.log("Frontend's parsed", parsed)
  // Save simplified JSON
  const transformedDir = ensureTransformedDir();
  fs.writeFileSync(path.join(transformedDir, 'frontend-simplified.json'), JSON.stringify(parsed, null, 2));

  return parsed;
}

// Validation function to catch hallucinations
function validateFrontendOutput(output: ChatbotFriendlyDoc, originalComponents: ComponentIR[]) {
  const warnings: string[] = [];

  output.elements.forEach((element, idx) => {
    const original = originalComponents.find(c => c.name === element.name);

    if (!original) {
      warnings.push(`Element "${element.name}" not found in original IR`);
      return;
    }

    // Check if described elements match source data
    if ('visibleElements' in element && element.visibleElements) {
      const hasLabels = original.labels && original.labels.length > 0;
      const hasFormFields = original.formFields && original.formFields.length > 0;

      if (!hasLabels && !hasFormFields && element.visibleElements.length > 3) {
        warnings.push(`⚠️  "${element.name}": Describes many UI elements but source has no labels/formFields. Possible hallucination.`);
      }

      // Check for common hallucination patterns
      const visibleText = element.visibleElements.join(' ').toLowerCase();
      if (visibleText.includes('username') || visibleText.includes('password')) {
        const hasUsernameLabel = original.labels?.some(l =>
          l.text.toLowerCase().includes('username') || l.text.toLowerCase().includes('password')
        );
        if (!hasUsernameLabel) {
          warnings.push(`🚨 CRITICAL: "${element.name}": Mentions username/password but NOT in source labels. This is hallucination!`);
        }
      }
    }
  });

  if (warnings.length > 0) {
    console.warn('\n⚠️  VALIDATION WARNINGS:\n' + warnings.join('\n'));
  }
}

// ============================================================================
// BACKEND TRANSFORMATION
// ============================================================================

export async function transformBackendIRToSimplified(ir: IR): Promise<ChatbotFriendlyDoc> {
  if (!ir.backend) {
    throw new Error('No backend data found in IR');
  }

  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      topK: 40,
    }
  });

  const elements: BackendTransformedElement[] = [];

  // Process all backend components in parallel for better performance
  const [modules, controllers, services, dtos, relationships] = await Promise.all([
    processModules(model, ir.backend.modules),
    processControllers(model, ir.backend.controllers),
    processServices(model, ir.backend.services),
    processDTOs(model, ir.backend.dtos),
    processRelationships(model, ir.backend.relationships)
  ]);

  elements.push(...modules, ...controllers, ...services, ...dtos, ...relationships);

  const result = { elements };

  console.log("Frontend's parsed", result)
  // Save simplified JSON
  const transformedDir = ensureTransformedDir();
  fs.writeFileSync(path.join(transformedDir, 'backend-simplified.json'), JSON.stringify(result, null, 2));

  return result;
}

async function processModules(model: any, modules: any[]): Promise<BackendTransformedElement[]> {
  if (!modules || modules.length === 0) return [];

  const prompt = `
You are a NestJS backend expert explaining architecture to both developers and non-developers.

TASK: Analyze these NestJS modules and explain their purpose.

RULES:
- Be accurate and specific based on the actual imports/exports/providers
- Explain in clear, professional language
- Include technical details for developers
- Group related functionality

OUTPUT SCHEMA (STRICT JSON):
{
  "elements": [
    {
      "name": "ModuleName",
      "type": "module",
      "file": "file path",
      "summary": "Clear 2-3 sentence explanation of this module's responsibility and role in the application.",
      "technicalDetails": [
        "List of controllers (if any)",
        "List of providers/services (if any)"
      ],
      "dependencies": ["List of imported modules"],
      "capabilities": [
        "High-level capability 1",
        "High-level capability 2"
      ]
    }
  ]
}

EXAMPLE:
{
  "name": "AuthModule",
  "type": "module",
  "file": "auth/auth.module.ts",
  "summary": "This module handles all authentication and authorization logic for the application. It provides services for user authentication, potentially including third-party providers like Google, and interacts with employee data for user validation.",
  "technicalDetails": [
    "AuthController",
    "AuthService",
    "GoogleStrategy"
  ],
  "dependencies": ["EmployeesModule"],
  "capabilities": [
    "Manage user authentication (Google OAauth, JWT)",
    "Protect routes with guards",
    "Validate user sessions"
  ]
}

DATA:
${JSON.stringify(modules, null, 2)}

Generate JSON:
`;

  return await generateAndParse<BackendTransformedElement>(model, prompt);
}

async function processControllers(model: any, controllers: any[]): Promise<BackendTransformedElement[]> {
  if (!controllers || controllers.length === 0) return [];

  const prompt = `
You are a NestJS API documentation expert.

TASK: Document these controllers/resolvers (REST or GraphQL).

CRITICAL RULES:
- For REST: Include HTTP method + full path (e.g., "GET /auth/google/callback")
- For GraphQL: Include operation type (Query/Mutation/ResolveField) + operation name
- Preserve EXACT route paths from the data
- Note which routes have guards (authentication/authorization)
- Distinguish between public and protected endpoints

OUTPUT SCHEMA:
{
  "elements": [
    {
      "name": "ControllerName",
      "type": "controller" or "resolver",
      "interface": "graphql" | "rest",
      "file": "file path",
      "summary": "Clear explanation of this controller's responsibility.",
      "technicalDetails": [
        "HTTP_METHOD /full/path - Description",
        "or",
        "GraphQL_TYPE operationName - Description"
      ],
      "dependencies": ["List of injected services"],
      "invokes": ["Optional: Service methods called, e.g. 'AuthService.validate'"],
      "security": {
        "authRequired": boolean,
        "guards": ["List of guards, e.g. 'AuthGuard'"]
      },
      "capabilities": [
        "What this controller enables the user/system to do"
      ]
    }
  ]
}

EXAMPLE:
{
  "name": "AuthController",
  "type": "controller",
  "interface": "rest",
  "file": "auth/auth.controller.ts",
  "summary": "This controller manages user authentication flows, including Google OAuth integration, session management, and token refresh mechanisms.",
  "technicalDetails": [
    "GET /auth/google - Initiates the Google OAuth login process.",
    "GET /auth/google/callback - Handles the callback from Google OAuth.",
    "GET /auth/me - Retrieves the profile information.",
    "GET /auth/refresh - Refreshes the user's access token.",
    "POST /auth/logout - Logs out the user."
  ],
  "dependencies": ["AuthService"],
  "invokes": ["AuthService.validateUser", "AuthService.refreshToken"],
  "security": {
    "authRequired": true,
    "guards": ["AuthGuard(google)", "JwtAuthGuard"]
  },
  "capabilities": [
    "Authenticate users via Google OAuth",
    "Refresh access tokens",
    "Retrieve current user profile"
  ]
}

DATA:
${JSON.stringify(controllers, null, 2)}

Generate JSON:
`;

  return await generateAndParse<BackendTransformedElement>(model, prompt);
}

async function processServices(model: any, services: any[]): Promise<BackendTransformedElement[]> {
  if (!services || services.length === 0) return [];

  const prompt = `
You are a backend architecture expert explaining business logic.

TASK: Document these services and their methods.

RULES:
- Explain WHAT each service does (business purpose)
- List key methods with clear descriptions
- Mention important dependencies (repositories, other services)
- Note async operations where relevant

OUTPUT SCHEMA:
{
  "elements": [
    {
      "name": "ServiceName",
      "type": "service",
      "file": "file path",
      "summary": "Clear explanation of this service's business logic and responsibility.",
      "technicalDetails": [
        "methodName - What this method does and when it's used"
      ],
      "dependencies": ["Repositories or services this depends on"],
      "invokes": ["List of methods called from other services/repos, e.g. 'Repository<User>.save'"],
      "capabilities": [
        "Business capabilities provided by this service"
      ]
    }
  ]
}

EXAMPLE:
{
  "name": "ContactPointsService",
  "type": "service",
  "file": "contact-points/contact-points.service.ts",
  "summary": "This service manages all operations related to 'Contact Points', which represent individual points of contact for customers.",
  "technicalDetails": [
    "findByCustomerId - Retrieves all contact points associated with a specific customer ID.",
    "create - Creates a new contact point, performing checks to ensure its name and email are unique."
  ],
  "dependencies": ["Repository<ContactPoint>"],
  "invokes": ["Repository<ContactPoint>.find", "Repository<ContactPoint>.save"],
  "capabilities": [
    "Manage contact point lifecycle (CRUD)",
    "Enforce uniqueness on contact point name and email",
    "Batch retrieve contact points"
  ]
}

DATA:
${JSON.stringify(services, null, 2)}

Generate JSON:
`;

  return await generateAndParse<BackendTransformedElement>(model, prompt);
}

async function processDTOs(model: any, dtos: any[]): Promise<BackendTransformedElement[]> {
  if (!dtos || dtos.length === 0) return [];

  const prompt = `
You are an API documentation specialist.

TASK: Document these DTOs (Data Transfer Objects).

RULES:
- Explain what data this DTO represents
- List all fields with their types
- Note which fields are required vs optional
- Keep it clear and concise

OUTPUT SCHEMA:
{
  "elements": [
    {
      "name": "DTOName",
      "type": "dto",
      "file": "file path",
      "summary": "Explanation of what this data structure represents.",
      "technicalDetails": [
        "fieldName (type, required/optional): Description"
      ],
      "dependencies": [],
      "capabilities": [
        "What data transfer this enables, e.g. 'Data structure for creating a new user'"
      ]
    }
  ]
}

EXAMPLE:
{
  "name": "CreateContactPointInput",
  "type": "dto",
  "file": "contact-points/dto/create-contact-point.dto.ts",
  "summary": "Represents the data required to create a new contact point for a customer.",
  "technicalDetails": [
    "customerId (string, required): The unique identifier of the customer.",
    "name (string, required): The name of the contact point."
  ],
  "dependencies": [],
  "capabilities": [
    "Define schema for contact point creation",
    "Validate input fields for contact points"
  ]
}

DATA:
${JSON.stringify(dtos, null, 2)}

Generate JSON:
`;

  return await generateAndParse<BackendTransformedElement>(model, prompt);
}

async function processRelationships(model: any, relationships: any): Promise<BackendTransformedElement[]> {
  if (!relationships) return [];

  const prompt = `
You are a software architect.

TASK: Summarize the architectural relationships of the system based on the provided dependency graph data.

RULES:
- Identify key high-level flows (e.g. "AuthController depends on AuthService")
- Summarize module boundaries
- Highlight critical dependencies

OUTPUT SCHEMA:
{
  "elements": [
    {
      "name": "SystemArchitecture",
      "type": "architecture",
      "file": "N/A",
      "summary": "Overview of the system dependency graph.",
      "technicalDetails": [
        "Controller X -> Service Y",
        "Module A imports Module B"
      ],
      "dependencies": []
    }
  ]
}

DATA:
${JSON.stringify(relationships, null, 2)}

Generate JSON:
`;

  return await generateAndParse<BackendTransformedElement>(model, prompt);
}

async function generateAndParse<T>(model: any, prompt: string): Promise<T[]> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean markdown code blocks
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Failed to parse chunk. Raw response:", text);
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.elements || [];
  } catch (e) {
    console.error("Error generating/parsing chunk:", e);
    return [];
  }
}