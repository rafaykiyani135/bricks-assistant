/**
 * IR (Intermediate Representation) Type Definitions
 * Machine-readable, LLM-friendly schema for Full-Stack analysis
 */

// ============ Route & Controller Types (Backend) ============

export interface RouteParamIR {
    name: string;
    type: 'body' | 'param' | 'query' | 'headers' | 'unknown';
    paramType?: string; // e.g., 'string', 'CreateCustomerInput'
    decorator?: string; // e.g., '@Body', '@Param'
}

export interface RouteIR {
    method: string; // GET, POST, PUT, DELETE, Query, Mutation, etc.
    path: string;
    handler: string; // Method name
    params: RouteParamIR[];
    guards: string[];
    pipes: string[];
    interceptors: string[];
    calls: string[]; // e.g., ['AuthService.login', 'UserRepository.findOne']
    returnType?: string;
}

export interface ControllerIR {
    name: string;
    file: string;
    baseRoute: string | null;
    routes: RouteIR[];
    injectedServices: string[]; // Services in constructor
}

// ============ Service Types (Backend) ============

export interface MethodParamIR {
    name: string;
    type?: string;
}

export interface MethodIR {
    name: string;
    params: MethodParamIR[];
    calls: string[]; // e.g., ['Repository.find', 'OtherService.method']
    returnType?: string;
    isAsync: boolean;
}

export interface ServiceIR {
    name: string;
    file: string;
    methods: MethodIR[];
    injectedDependencies: string[]; // Constructor injections
}

// ============ Module Types (Backend) ============

export interface ModuleIR {
    name: string;
    file: string;
    controllers: string[];
    providers: string[];
    imports: string[];
    exports: string[];
}

// ============ DTO Types (Backend) ============

export interface DtoFieldIR {
    name: string;
    type?: string;
    isOptional: boolean;
    decorators: string[]; // e.g., ['IsString', 'IsEmail', 'MinLength']
}

export interface DtoIR {
    name: string;
    file: string;
    fields: DtoFieldIR[];
    extendsClass?: string;
}

// ============ Relationship Types ============

export interface ControllerServiceRelation {
    controller: string;
    service: string;
}

export interface ServiceServiceRelation {
    fromService: string;
    toService: string;
    method?: string;
}

export interface ModuleBindingRelation {
    module: string;
    controllers: string[];
    providers: string[];
}

export interface RelationshipsIR {
    controllerToService: ControllerServiceRelation[];
    serviceToService: ServiceServiceRelation[];
    moduleBindings: ModuleBindingRelation[];
}

// ============ Backend IR ============

export interface BackendIR {
    modules: ModuleIR[];
    controllers: ControllerIR[];
    services: ServiceIR[];
    dtos: DtoIR[];
    relationships: RelationshipsIR;
}

// ============ Frontend Types (Vue/Nuxt) ============

export interface PropIR {
    name: string;
    type?: string;
    required: boolean;
    default?: string;
}

export interface ApiCallIR {
    operationName: string; // e.g., 'CreateCustomer', 'GetCustomers'
    type: 'query' | 'mutation' | 'subscription' | 'fetch';
    hook?: string; // e.g., 'useQuery', 'useMutation'
    document?: string; // e.g., 'CreateCustomerDocument'
}

export interface ComponentFunctionIR {
    name: string;
    isAsync: boolean;
    calls: string[]; // Functions or composables called
}

// ============ UI Extraction Types ============

export interface UILabelIR {
    text: string;
    source: 'button' | 'placeholder' | 'title' | 'header' | 'label' | 'alert';
    element?: string; // e.g., 'UButton', 'UInput'
}

export interface UIActionIR {
    event: 'click' | 'submit' | 'change' | 'input';
    handler: string; // e.g., 'openCreateModal', 'onSubmit'
    element?: string; // e.g., 'UButton', 'form'
    label?: string; // Associated label if available
}

export interface FormFieldIR {
    name: string; // v-model binding name
    element: string; // e.g., 'UInput', 'UTextarea'
    placeholder?: string;
    required?: boolean;
    disabled?: string; // Disabled condition if any
}

export interface DisabledStateIR {
    element: string;
    condition: string; // e.g., 'isSubmitting', 'Object.keys(errors).length > 0'
}

export interface ComponentIR {
    name: string;
    file: string;
    type: 'page' | 'component' | 'layout';
    route?: string; // Only for pages (derived from file path)
    props: PropIR[];
    emits: string[];
    slots: string[];
    componentsUsed: string[]; // Other components imported/used
    composablesUsed: string[]; // e.g., ['useAuthStore', 'useRouter']
    apiCalls: ApiCallIR[];
    functions: ComponentFunctionIR[];
    // New UI extraction fields
    labels: UILabelIR[];
    actions: UIActionIR[];
    formFields: FormFieldIR[];
    disabledStates: DisabledStateIR[];
    constants?: { name: string; value: string }[];
}

export interface StoreStateIR {
    name: string;
    type?: string;
}

export interface StoreActionIR {
    name: string;
    isAsync: boolean;
    calls: string[];
}

export interface StoreIR {
    name: string; // e.g., 'auth' (from defineStore('auth', ...))
    file: string;
    exportName: string; // e.g., 'useAuthStore'
    state: StoreStateIR[];
    getters: string[];
    actions: StoreActionIR[];
}

export interface ComposableIR {
    name: string; // e.g., 'useAuth'
    file: string;
    returns: string[]; // What it exposes
    apiCalls: ApiCallIR[];
}

export interface FrontendRelationshipsIR {
    pageToComponent: { page: string; components: string[] }[];
    componentToStore: { component: string; stores: string[] }[];
    componentToApi: { component: string; operations: string[] }[];
}

export interface FrontendIR {
    pages: ComponentIR[];
    components: ComponentIR[];
    stores: StoreIR[];
    composables: ComposableIR[];
    relationships: FrontendRelationshipsIR;
}

// ============ Full Stack Relationship ============

export interface FullStackLinkIR {
    frontendComponent: string;
    apiOperation: string; // e.g., 'CreateCustomer'
    backendHandler: string; // e.g., 'CustomersResolver.createCustomer'
}

// ============ Root IR Type ============

export interface IR {
    metadata: {
        generatedAt: string;
        backendDirectory?: string;
        frontendDirectory?: string;
        version: string;
    };
    backend?: BackendIR;
    frontend?: FrontendIR;
    fullStackLinks: FullStackLinkIR[];
}

// ============ Parser Helpers ============

export interface ParsedFile {
    filePath: string;
    relativePath: string;
    content: string;
}

export interface ParsedVueFile extends ParsedFile {
    scriptContent: string; // Extracted <script> or <script setup>
    templateContent: string; // Extracted <template>
    isScriptSetup: boolean;
}

export interface ExtractionResult<T> {
    items: T[];
    filePath: string;
}
