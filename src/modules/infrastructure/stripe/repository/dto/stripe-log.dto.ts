export interface CreateStripeLogDTO {
  direction: StripeLogDirection;
  operationType: StripeOperationType;
  status: StripeLogStatus;
  stripeId?: string;
  userId?: string;
  amount?: number;
  currency?: string;
  idempotencyKey?: string;
  requestPayload?: Record<string, any>;
  responsePayload?: Record<string, any>;
  errorMessage?: string;
  errorCode?: string;
  errorType?: string;
  httpStatusCode?: number;
  processingTimeMs?: number;
  webhookSignature?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

/**
 * Direction of Stripe communication
 */
export enum StripeLogDirection {
  /** Outgoing request to Stripe API (upstream) */
  UPSTREAM = 'UPSTREAM',
  /** Incoming webhook from Stripe (downstream) */
  DOWNSTREAM = 'DOWNSTREAM',
}

/**
 * Type of Stripe operation
 */
export enum StripeOperationType {
  // Upstream operations
  PAYMENT_INTENT_CREATE = 'PAYMENT_INTENT_CREATE',
  PAYMENT_INTENT_RETRIEVE = 'PAYMENT_INTENT_RETRIEVE',
  PAYMENT_INTENT_CANCEL = 'PAYMENT_INTENT_CANCEL',
  REFUND_CREATE = 'REFUND_CREATE',

  // Downstream webhook events
  WEBHOOK_PAYMENT_INTENT_SUCCEEDED = 'WEBHOOK_PAYMENT_INTENT_SUCCEEDED',
  WEBHOOK_PAYMENT_INTENT_FAILED = 'WEBHOOK_PAYMENT_INTENT_FAILED',
  WEBHOOK_PAYMENT_INTENT_CANCELED = 'WEBHOOK_PAYMENT_INTENT_CANCELED',
  WEBHOOK_CHARGE_SUCCEEDED = 'WEBHOOK_CHARGE_SUCCEEDED',
  WEBHOOK_CHARGE_FAILED = 'WEBHOOK_CHARGE_FAILED',
  WEBHOOK_REFUND_CREATED = 'WEBHOOK_REFUND_CREATED',
  WEBHOOK_UNKNOWN = 'WEBHOOK_UNKNOWN',
}

/**
 * Status of the Stripe operation
 */
export enum StripeLogStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}
