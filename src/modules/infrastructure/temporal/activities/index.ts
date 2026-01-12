// activities/index.ts
export * from './usa-money-order.activities';
// export async function screenReceiver(moneyOrderId: string): Promise<boolean> {
//   console.log('========================================');
//   console.log('🔍 ACTIVITY: screenReceiver');
//   console.log('   Money Order ID:', moneyOrderId);
//   console.log('========================================');
  
//   await new Promise((resolve) => setTimeout(resolve, 1000));
  
//   const passed = Math.random() > 0.1;
//   console.log(`✅ Result: ${passed ? 'PASSED' : 'FAILED'}`);
  
//   return passed;
// }