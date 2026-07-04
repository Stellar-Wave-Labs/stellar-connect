export interface ChainProvider {
  connect(): Promise<{ address: string }>;
  disconnect(): Promise<void>;
  getAddress(): string | null;
  getBalance(address: string): Promise<{ amount: string; symbol: string }>;
  getNetworkLabel(): string;
  isConnected(): boolean;
  sendTransaction(to: string, amount: string): Promise<{ hash: string }>;
}
