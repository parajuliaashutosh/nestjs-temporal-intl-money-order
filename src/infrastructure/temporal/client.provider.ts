import { Provider } from '@nestjs/common';
import { Connection } from '@temporalio/client';

export const TemporalClientProvider: Provider = {
  provide: 'TEMPORAL_CLIENT',
  useFactory: async () => {
    const connection = new Connection();
    return connection.workflowClient;
  },
};
