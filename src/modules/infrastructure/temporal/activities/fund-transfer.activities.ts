import { Context } from '@temporalio/activity';

/**
 * Activity inputs
 */
export interface ValidateTransferInput {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
}

export interface WalletOperationInput {
  userId: string;
  amount: number;
  currency: string;
  description: string;
}

export interface NotifyTransferInput {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
}

/**
 * Activity: Validate Transfer
 * Validates that the transfer can be performed
 */
export async function validateTransfer(
  input: ValidateTransferInput,
): Promise<void> {
  const logger = Context.current().log;
  logger.info('Validating transfer', { input });

  // TODO: Implement actual validation logic
  // - Check if users exist
  // - Check if fromUser has sufficient balance
  // - Check if currency is supported
  // - Check transfer limits
  // - Check if accounts are active

  if (input.fromUserId === input.toUserId) {
    throw new Error('Cannot transfer to the same user');
  }

  if (input.amount <= 0) {
    throw new Error('Transfer amount must be positive');
  }

  // Simulate validation
  await sleep(100);

  logger.info('Transfer validation successful');
}

/**
 * Activity: Debit Wallet
 * Deducts amount from source wallet
 */
export async function debitWallet(
  input: WalletOperationInput,
): Promise<string> {
  const logger = Context.current().log;
  logger.info('Debiting wallet', { input });

  // TODO: Implement actual debit logic
  // - Use your WalletService to debit the wallet
  // - Create transaction record
  // - Update balance atomically
  // - Return transaction ID

  // Simulate database operation
  await sleep(200);

  const transactionId = `TXN-DEBIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.info('Wallet debited successfully', { transactionId });
  
  return transactionId;
}

/**
 * Activity: Credit Wallet
 * Adds amount to destination wallet
 */
export async function creditWallet(
  input: WalletOperationInput,
): Promise<string> {
  const logger = Context.current().log;
  logger.info('Crediting wallet', { input });

  // TODO: Implement actual credit logic
  // - Use your WalletService to credit the wallet
  // - Create transaction record
  // - Update balance atomically
  // - Return transaction ID

  // Simulate database operation
  await sleep(200);

  const transactionId = `TXN-CREDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  logger.info('Wallet credited successfully', { transactionId });
  
  return transactionId;
}

/**
 * Activity: Notify Transfer Complete
 * Sends notifications to both parties
 */
export async function notifyTransferComplete(
  input: NotifyTransferInput,
): Promise<void> {
  const logger = Context.current().log;
  logger.info('Sending transfer notifications', { input });

  // TODO: Implement actual notification logic
  // - Send email/SMS/push notification to sender
  // - Send email/SMS/push notification to receiver
  // - Log notification events

  // Simulate notification sending
  await sleep(150);

  logger.info('Notifications sent successfully');
}

/**
 * Activity: Rollback Debit
 * Reverses a debit transaction (compensating transaction)
 */
export async function rollbackDebit(transactionId: string): Promise<void> {
  const logger = Context.current().log;
  logger.warn('Rolling back debit transaction', { transactionId });

  // TODO: Implement actual rollback logic
  // - Find the original debit transaction
  // - Create a compensating credit transaction
  // - Update balance
  // - Mark original transaction as rolled back

  // Simulate rollback operation
  await sleep(200);

  logger.info('Debit rolled back successfully', { transactionId });
}

/**
 * Helper function to simulate async operations
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}