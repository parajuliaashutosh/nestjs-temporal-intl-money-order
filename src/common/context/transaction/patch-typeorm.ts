// src/common/transaction/patch-typeorm.ts
import { EntityManager, Repository } from 'typeorm';
import { TransactionStorage } from './transaction.context';

// Extend Repository type to include our symbol
const managerSymbol = Symbol('originalManager');

interface RepositoryWithSymbol extends Repository<any> {
  [managerSymbol]?: EntityManager;
}

export function initializeTransactionalContext() {
  // Patch the manager property
  Object.defineProperty(Repository.prototype, 'manager', {
    get(this: RepositoryWithSymbol): EntityManager {
      // Check if there's a transactional manager in context
      const transactionalManager = TransactionStorage.getManager();
      if (transactionalManager) {
        return transactionalManager;
      }
      // Otherwise return the original manager
      return this[managerSymbol]!;
    },
    set(this: RepositoryWithSymbol, manager: EntityManager): void {
      // Store the original manager using our symbol
      this[managerSymbol] = manager;
    },
    configurable: true,
    enumerable: true,
  });
}