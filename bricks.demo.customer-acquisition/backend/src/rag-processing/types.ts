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

export interface IR {
  frontend?: FrontendIR;
}

export interface TransformedElement {
  name: string;
  type: string;
  route?: string;
  summaryDescriptionInLaymansTerms: string;
  detailedUserActions: string[];
  visibleElements: string[];
  conditionalStates: string[];
}

export interface ChatbotFriendlyDoc {
  elements: TransformedElement[];
}
