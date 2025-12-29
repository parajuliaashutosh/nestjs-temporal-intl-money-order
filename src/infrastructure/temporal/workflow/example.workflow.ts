import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { sendEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function exampleWorkflow(email: string) {
  await sendEmail(email);
}
