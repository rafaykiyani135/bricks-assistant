export interface ComponentIR {
  name: string;
  file: string;
  type: 'page' | 'component' | 'layout';
  route?: string;
  labels: any[];
  actions: any[];
  formFields: any[];
  disabledStates: any[];
  apiCalls: any[];
  functions: any[];
  computed?: any[];
  dataFlow?: any[];
  uiStates?: any[];
  entities?: any[];
  rules?: any[];
}

export interface FrontendIR {
  pages: ComponentIR[];
  components: ComponentIR[];
}

export interface BackendIR {
  modules: any[];
  controllers: any[];
  services: any[];
  dtos: any[];
  relationships: any;
}

export interface IR {
  frontend?: FrontendIR;
  backend?: BackendIR;
}

export interface FrontendTransformedElement {
  name: string;
  type: string;
  route?: string;
  summaryDescriptionInLaymansTerms: string;
  detailedUserActions: string[];
  visibleElements: string[];
  conditionalStates: string[];
  dataProvenance?: string[];
  businessLogic?: string[];
}

export interface BackendTransformedElement {
  name: string;
  type: 'module' | 'controller' | 'service' | 'dto' | 'architecture';
  summary: string;
  technicalDetails: string[]; // endpoints, methods, or fields
  dependencies: string[]; // imports, injected services
  invokes?: string[];
  interface?: 'graphql' | 'rest';
  security?: {
    authRequired: boolean;
    guards: string[];
  };
  capabilities?: string[];
}

export type TransformedElement = FrontendTransformedElement | BackendTransformedElement;

export interface ChatbotFriendlyDoc {
  elements: TransformedElement[];
}
