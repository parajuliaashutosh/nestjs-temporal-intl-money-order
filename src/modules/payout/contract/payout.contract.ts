export interface PayoutContract {
  startPayout(
    moneyOrderId: string,
  ): Promise<{ success: boolean; data: Record<string, any> }>;
  payout(request: Record<string, any>): Promise<Record<string, any>>;
}
