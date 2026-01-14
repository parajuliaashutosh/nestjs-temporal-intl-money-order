import { SupportedCountry } from "@/src/common/enum/supported-country.enum";
import { AppException } from "@/src/common/exception/app.exception";

export const WORKFLOW_CLIENT = Symbol('WORKFLOW_CLIENT');
export const WORKFLOW_WORKER = Symbol('WORKFLOW_WORKER');


export const WORKFLOWS = {
    USA_MONEY_ORDER: 'usaMoneyOrderWorkflow',
    AUS_MONEY_ORDER: 'ausMoneyOrderWorkflow',
} as const;

export type WorkflowKey = keyof typeof WORKFLOWS;
export type WorkflowValue = typeof WORKFLOWS[keyof typeof WORKFLOWS];

export const workflowBYCountry = (country: SupportedCountry) => {
    switch (country) {
        case SupportedCountry.USA:
            return WORKFLOWS.USA_MONEY_ORDER;
        case SupportedCountry.AUS:
            return WORKFLOWS.AUS_MONEY_ORDER;
        default:
            throw AppException.badRequest('Unsupported country for workflow');
    }
}