/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { TransactionStorage } from '../../context/transaction/transaction.context';
import { AppDataSource } from '../../provider/datasource.provider';

export function Transactional() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const dataSource = AppDataSource.dataSource;
      if (!dataSource) throw new Error('DataSource not initialized');

      // Check if already in a transaction
      if (TransactionStorage.getManager()) {
        return original.apply(this, args);
      }

      // Start new transaction
      return dataSource.transaction(async (manager) => {
        return TransactionStorage.run(manager, () => {
          return original.apply(this, args);
        });
      });
    };

    return descriptor;
  };
}
