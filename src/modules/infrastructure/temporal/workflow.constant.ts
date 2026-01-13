export const WORKFLOW_CLIENT = Symbol('WORKFLOW_CLIENT');
export const WORKFLOW_WORKER = Symbol('WORKFLOW_WORKER');


export const WORKFLOWS = {
    USA_MONEY_ORDER: 'usaMoneyOrderWorkflow',
} as const;

export type WorkflowKey = keyof typeof WORKFLOWS;
export type WorkflowValue = typeof WORKFLOWS[keyof typeof WORKFLOWS]; // "usaMoneyOrderWorkflow"
