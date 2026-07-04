export interface BalanceInfo {
  amount: string;
  symbol: string;
  code?: string;
  issuer?: string;
  isNative: boolean;
}

export interface ChainProvider {
  connect(): Promise<{ address: string }>;
  disconnect(): Promise<void>;
  getAddress(): string | null;
  getBalances(address: string): Promise<BalanceInfo[]>;
  getNetworkLabel(): string;
  isConnected(): boolean;
  sendTransaction(to: string, amount: string, assetCode?: string, assetIssuer?: string): Promise<{ hash: string }>;
}
