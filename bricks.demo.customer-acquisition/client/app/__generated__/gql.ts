/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation CreateContactPoint($customerId: ID!, $name: String!, $role: String, $email: String, $phone: String, $override: Boolean) {\n  createContactPoint(\n    input: {customerId: $customerId, name: $name, role: $role, email: $email, phone: $phone, override: $override}\n  ) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}": typeof types.CreateContactPointDocument,
    "mutation DeleteContactPoint($id: ID!) {\n  deleteContactPoint(id: $id) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}": typeof types.DeleteContactPointDocument,
    "mutation UpdateContactPoint($input: UpdateContactPointInput!) {\n  updateContactPoint(input: $input) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}": typeof types.UpdateContactPointDocument,
    "mutation CreateCustomer($input: CreateCustomerInput!) {\n  createCustomer(input: $input) {\n    id\n    name\n    website\n    industry\n  }\n}": typeof types.CreateCustomerDocument,
    "mutation DeleteCustomer($id: ID!) {\n  deleteCustomer(id: $id) {\n    id\n    name\n    website\n    industry\n  }\n}": typeof types.DeleteCustomerDocument,
    "query GetCustomerContactPoints($id: ID!) {\n  customer(id: $id) {\n    id\n    name\n    contactPoints {\n      id\n      name\n      role\n      email\n      phone\n      interactions {\n        id\n        date\n        type\n        message\n      }\n    }\n  }\n}": typeof types.GetCustomerContactPointsDocument,
    "query GetCustomers {\n  customers {\n    id\n    name\n    website\n    industry\n  }\n}": typeof types.GetCustomersDocument,
    "query GetDashBoardCustomer {\n  customers {\n    id\n    name\n    website\n    industry\n    lastInteraction {\n      id\n      date\n      message\n    }\n    interactionCount\n  }\n}": typeof types.GetDashBoardCustomerDocument,
    "mutation UpdateCustomer($input: UpdateCustomerInput!) {\n  updateCustomer(input: $input) {\n    id\n    name\n    website\n    industry\n  }\n}": typeof types.UpdateCustomerDocument,
    "query GetHello($message: String!) {\n  getHello(message: $message) {\n    id\n    message\n  }\n}": typeof types.GetHelloDocument,
    "mutation CreateInteraction($input: CreateInteractionSummaryInput!) {\n  createInteractionSummary(input: $input) {\n    id\n    date\n    type\n    message\n  }\n}": typeof types.CreateInteractionDocument,
};
const documents: Documents = {
    "mutation CreateContactPoint($customerId: ID!, $name: String!, $role: String, $email: String, $phone: String, $override: Boolean) {\n  createContactPoint(\n    input: {customerId: $customerId, name: $name, role: $role, email: $email, phone: $phone, override: $override}\n  ) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}": types.CreateContactPointDocument,
    "mutation DeleteContactPoint($id: ID!) {\n  deleteContactPoint(id: $id) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}": types.DeleteContactPointDocument,
    "mutation UpdateContactPoint($input: UpdateContactPointInput!) {\n  updateContactPoint(input: $input) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}": types.UpdateContactPointDocument,
    "mutation CreateCustomer($input: CreateCustomerInput!) {\n  createCustomer(input: $input) {\n    id\n    name\n    website\n    industry\n  }\n}": types.CreateCustomerDocument,
    "mutation DeleteCustomer($id: ID!) {\n  deleteCustomer(id: $id) {\n    id\n    name\n    website\n    industry\n  }\n}": types.DeleteCustomerDocument,
    "query GetCustomerContactPoints($id: ID!) {\n  customer(id: $id) {\n    id\n    name\n    contactPoints {\n      id\n      name\n      role\n      email\n      phone\n      interactions {\n        id\n        date\n        type\n        message\n      }\n    }\n  }\n}": types.GetCustomerContactPointsDocument,
    "query GetCustomers {\n  customers {\n    id\n    name\n    website\n    industry\n  }\n}": types.GetCustomersDocument,
    "query GetDashBoardCustomer {\n  customers {\n    id\n    name\n    website\n    industry\n    lastInteraction {\n      id\n      date\n      message\n    }\n    interactionCount\n  }\n}": types.GetDashBoardCustomerDocument,
    "mutation UpdateCustomer($input: UpdateCustomerInput!) {\n  updateCustomer(input: $input) {\n    id\n    name\n    website\n    industry\n  }\n}": types.UpdateCustomerDocument,
    "query GetHello($message: String!) {\n  getHello(message: $message) {\n    id\n    message\n  }\n}": types.GetHelloDocument,
    "mutation CreateInteraction($input: CreateInteractionSummaryInput!) {\n  createInteractionSummary(input: $input) {\n    id\n    date\n    type\n    message\n  }\n}": types.CreateInteractionDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateContactPoint($customerId: ID!, $name: String!, $role: String, $email: String, $phone: String, $override: Boolean) {\n  createContactPoint(\n    input: {customerId: $customerId, name: $name, role: $role, email: $email, phone: $phone, override: $override}\n  ) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}"): (typeof documents)["mutation CreateContactPoint($customerId: ID!, $name: String!, $role: String, $email: String, $phone: String, $override: Boolean) {\n  createContactPoint(\n    input: {customerId: $customerId, name: $name, role: $role, email: $email, phone: $phone, override: $override}\n  ) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteContactPoint($id: ID!) {\n  deleteContactPoint(id: $id) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}"): (typeof documents)["mutation DeleteContactPoint($id: ID!) {\n  deleteContactPoint(id: $id) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateContactPoint($input: UpdateContactPointInput!) {\n  updateContactPoint(input: $input) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}"): (typeof documents)["mutation UpdateContactPoint($input: UpdateContactPointInput!) {\n  updateContactPoint(input: $input) {\n    id\n    name\n    role\n    email\n    phone\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateCustomer($input: CreateCustomerInput!) {\n  createCustomer(input: $input) {\n    id\n    name\n    website\n    industry\n  }\n}"): (typeof documents)["mutation CreateCustomer($input: CreateCustomerInput!) {\n  createCustomer(input: $input) {\n    id\n    name\n    website\n    industry\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteCustomer($id: ID!) {\n  deleteCustomer(id: $id) {\n    id\n    name\n    website\n    industry\n  }\n}"): (typeof documents)["mutation DeleteCustomer($id: ID!) {\n  deleteCustomer(id: $id) {\n    id\n    name\n    website\n    industry\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetCustomerContactPoints($id: ID!) {\n  customer(id: $id) {\n    id\n    name\n    contactPoints {\n      id\n      name\n      role\n      email\n      phone\n      interactions {\n        id\n        date\n        type\n        message\n      }\n    }\n  }\n}"): (typeof documents)["query GetCustomerContactPoints($id: ID!) {\n  customer(id: $id) {\n    id\n    name\n    contactPoints {\n      id\n      name\n      role\n      email\n      phone\n      interactions {\n        id\n        date\n        type\n        message\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetCustomers {\n  customers {\n    id\n    name\n    website\n    industry\n  }\n}"): (typeof documents)["query GetCustomers {\n  customers {\n    id\n    name\n    website\n    industry\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetDashBoardCustomer {\n  customers {\n    id\n    name\n    website\n    industry\n    lastInteraction {\n      id\n      date\n      message\n    }\n    interactionCount\n  }\n}"): (typeof documents)["query GetDashBoardCustomer {\n  customers {\n    id\n    name\n    website\n    industry\n    lastInteraction {\n      id\n      date\n      message\n    }\n    interactionCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateCustomer($input: UpdateCustomerInput!) {\n  updateCustomer(input: $input) {\n    id\n    name\n    website\n    industry\n  }\n}"): (typeof documents)["mutation UpdateCustomer($input: UpdateCustomerInput!) {\n  updateCustomer(input: $input) {\n    id\n    name\n    website\n    industry\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetHello($message: String!) {\n  getHello(message: $message) {\n    id\n    message\n  }\n}"): (typeof documents)["query GetHello($message: String!) {\n  getHello(message: $message) {\n    id\n    message\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateInteraction($input: CreateInteractionSummaryInput!) {\n  createInteractionSummary(input: $input) {\n    id\n    date\n    type\n    message\n  }\n}"): (typeof documents)["mutation CreateInteraction($input: CreateInteractionSummaryInput!) {\n  createInteractionSummary(input: $input) {\n    id\n    date\n    type\n    message\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;