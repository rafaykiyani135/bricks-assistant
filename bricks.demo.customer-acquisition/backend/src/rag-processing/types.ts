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
}

export interface BackendTransformedElement {
  name: string;
  type: 'module' | 'controller' | 'service' | 'dto';
  summary: string;
  technicalDetails: string[]; // endpoints, methods, or fields
  dependencies: string[]; // imports, injected services
}

export type TransformedElement = FrontendTransformedElement | BackendTransformedElement;

export interface ChatbotFriendlyDoc {
  elements: TransformedElement[];
}
