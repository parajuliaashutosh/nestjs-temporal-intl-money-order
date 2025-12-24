/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { AppDataSource } from "../../provider/datasource.provider";

export function Transactional() {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const dataSource = AppDataSource.dataSource;
      if (!dataSource) throw new Error('DataSource not initialized');

      return dataSource.transaction(async (manager) => {
        return original.apply(this, [...args, manager]);
      });
    };

    return descriptor;
  };
}
