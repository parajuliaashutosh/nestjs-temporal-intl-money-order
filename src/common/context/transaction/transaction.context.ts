import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';

class TransactionStorage {
  private static storage = new AsyncLocalStorage<EntityManager>();

  static getManager(): EntityManager | undefined {
    return this.storage.getStore();
  }

  static setManager(manager: EntityManager): void {
    this.storage.enterWith(manager);
  }

  static run<T>(manager: EntityManager, callback: () => Promise<T>): Promise<T> {
    return this.storage.run(manager, callback);
  }
}

export { TransactionStorage };
