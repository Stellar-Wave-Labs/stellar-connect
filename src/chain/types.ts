export interface BalanceInfo {
  amount: string;
  symbol: string;
  code?: string;
  issuer?: string;
  isNative: boolean;
}

export interface PaymentRecord {
  id: string;
  txHash: string;
  type: string;
  createdAt: string;
  from: string;
  to: string;
  amount: string;
  symbol: string;
}

export interface ChainProvider {
  connect(): Promise<{ address: string }>;
  disconnect(): Promise<void>;
  getAddress(): string | null;
  getBalances(address: string): Promise<BalanceInfo[]>;
  getNetworkLabel(): string;
  isConnected(): boolean;
  sendTransaction(to: string, amount: string, assetCode?: string, assetIssuer?: string): Promise<{ hash: string }>;
  getRecentPayments(address: string): Promise<PaymentRecord[]>;
  addTrustline(assetCode: string, assetIssuer: string): Promise<{ hash: string }>;
}
