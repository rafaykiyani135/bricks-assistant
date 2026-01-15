
export interface UILabelIR {
    text: string;
    source: 'button' | 'placeholder' | 'title' | 'header' | 'label' | 'alert';
    element?: string;
}

export interface UIActionIR {
    event: 'click' | 'submit' | 'change' | 'input';
    handler: string;
    element?: string;
    label?: string;
}

export interface FormFieldIR {
    name: string;
    element: string;
    placeholder?: string;
    required?: boolean;
    disabled?: string;
}

export interface DisabledStateIR {
    element: string;
    condition: string;
}

export interface ApiCallIR {
    operationName: string;
    type: 'query' | 'mutation' | 'subscription' | 'fetch';
}

export interface ComponentIR {
    name: string;
    file: string;
    type: 'page' | 'component' | 'layout';
    route?: string;
    labels: UILabelIR[];
    actions: UIActionIR[];
    formFields: FormFieldIR[];
    disabledStates: DisabledStateIR[];
    apiCalls: ApiCallIR[];
}

export interface FrontendIR {
    pages: ComponentIR[];
    components: ComponentIR[];
}

export interface IR {
    frontend?: FrontendIR;
}

// --- Chatbot-Friendly Interfaces ---

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
