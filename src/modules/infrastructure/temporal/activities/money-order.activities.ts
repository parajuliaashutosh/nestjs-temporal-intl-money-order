// activities/money-order.activities.ts

export async function screenReceiver(moneyOrderId: string): Promise<boolean> {
  console.log('🔍 Screening:', moneyOrderId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const passed = Math.random() > 0.1;
  console.log('Result:', passed);
  return passed;
}