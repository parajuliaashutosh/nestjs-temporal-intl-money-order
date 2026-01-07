import {
  defineQuery,
  defineSignal,
  log,
  proxyActivities,
  setHandler
} from '@temporalio/workflow';
import type * as activities from '../activities';

// Define activity proxies with timeouts
const { 
  validateTransfer,
  debitWallet,
  creditWallet,
  notifyTransferComplete,
  rollbackDebit,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    initialInterval: '1s',
    maximumInterval: '10s',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

// Workflow input
export interface FundTransferInput {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  description?: string;
}

// Workflow state
export interface TransferState {
  status: 'pending' | 'debited' | 'completed' | 'failed' | 'cancelled';
  debitTransactionId?: string;
  creditTransactionId?: string;
  error?: string;
}

// Define signals
export const cancelSignal = defineSignal('cancel');

// Define queries
export const statusQuery = defineQuery<TransferState>('status');

/**
 * Fund Transfer Workflow
 * 
 * This workflow implements a saga pattern for transferring funds:
 * 1. Validate transfer
 * 2. Debit from source wallet
 * 3. Credit to destination wallet
 * 4. Notify users
 * 
 * If any step fails, it automatically rolls back previous steps.
 */
export async function fundTransferWorkflow(
  input: FundTransferInput,
): Promise<TransferState> {
  const state: TransferState = {
    status: 'pending',
  };

  let cancelled = false;

  // Handle cancel signal
  setHandler(cancelSignal, () => {
    log.info('Received cancel signal');
    cancelled = true;
  });

  // Handle status query
  setHandler(statusQuery, () => state);

  try {
    log.info('Starting fund transfer', { input });

    // Step 1: Validate transfer
    log.info('Validating transfer');
    await validateTransfer(input);

    // Check if cancelled
    if (cancelled) {
      state.status = 'cancelled';
      log.info('Transfer cancelled before debit');
      return state;
    }

    // Step 2: Debit from source wallet
    log.info('Debiting source wallet', { userId: input.fromUserId });
    state.debitTransactionId = await debitWallet({
      userId: input.fromUserId,
      amount: input.amount,
      currency: input.currency,
      description: input.description || `Transfer to user ${input.toUserId}`,
    });
    
    state.status = 'debited';
    log.info('Debit successful', { transactionId: state.debitTransactionId });

    // Check if cancelled after debit
    if (cancelled) {
      log.warn('Transfer cancelled after debit, rolling back');
      await rollbackDebit(state.debitTransactionId);
      state.status = 'cancelled';
      return state;
    }

    // Step 3: Credit to destination wallet
    log.info('Crediting destination wallet', { userId: input.toUserId });
    state.creditTransactionId = await creditWallet({
      userId: input.toUserId,
      amount: input.amount,
      currency: input.currency,
      description: input.description || `Transfer from user ${input.fromUserId}`,
    });

    log.info('Credit successful', { transactionId: state.creditTransactionId });

    // Step 4: Notify users
    log.info('Sending notifications');
    await notifyTransferComplete({
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
      amount: input.amount,
      currency: input.currency,
    });

    state.status = 'completed';
    log.info('Fund transfer completed successfully');

    return state;
  } catch (error) {
    log.error('Fund transfer failed', { error });
    state.status = 'failed';
    state.error = error.message;

    // Rollback if we debited
    if (state.debitTransactionId) {
      log.warn('Rolling back debit transaction', { 
        transactionId: state.debitTransactionId 
      });
      
      try {
        await rollbackDebit(state.debitTransactionId);
        log.info('Rollback successful');
      } catch (rollbackError) {
        log.error('Rollback failed', { error: rollbackError });
        // In production, you might want to trigger manual intervention
        state.error = `Transfer failed and rollback failed: ${rollbackError.message}`;
      }
    }

    throw error;
  }
}

export async function updateWalletWorkflow(
  userId: string,
  amount: number,
): Promise<void> {
  log.info('Starting wallet update workflow', { userId, amount });

  // Here you can add more complex logic if needed
  // For simplicity, we directly call the creditWallet activity

  await proxyActivities<typeof activities>({
    startToCloseTimeout: '30s',
  }).creditWallet({
    userId,
    amount,
    currency: 'USD', // Assuming USD for simplicity
    description: 'Complex wallet update via workflow',
  });

  log.info('Wallet update workflow completed', { userId, amount });
}