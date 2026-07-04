import type { ChainProvider } from '../types';
import { walletConnectService } from '../../services/walletConnectService';
import { wagmiConfig } from '../../config/wagmiConfig';
import { getAccount, getBalance, disconnect, getChainId } from '@wagmi/core';
import { formatEther } from 'viem';

export class EvmProvider implements ChainProvider {
  async connect(): Promise<{ address: string }> {
    // Uses the existing walletConnectService for the QR modal flow
    const provider = await walletConnectService.connectWithQrModal();
    const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
    const address = accounts[0];
    if (!address) {
      throw new Error('No accounts found after connection.');
    }
    return { address };
  }

  async disconnect(): Promise<void> {
    try {
      await walletConnectService.disconnect();
    } catch (e) {
      console.error('WalletConnect disconnect failed', e);
    }
    
    try {
      await disconnect(wagmiConfig);
    } catch (e) {
      // Ignore errors if wagmi is already disconnected
    }
  }

  getAddress(): string | null {
    // Try Wagmi first
    const account = getAccount(wagmiConfig);
    if (account.address) {
      return account.address;
    }
    return null;
  }

  async getBalance(address: string): Promise<{ amount: string; symbol: string }> {
    try {
      const balance = await getBalance(wagmiConfig, { address: address as `0x${string}` });
      return {
        amount: Number(formatEther(balance.value)).toFixed(4),
        symbol: balance.symbol,
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      return { amount: '0', symbol: 'ETH' };
    }
  }

  getNetworkLabel(): string {
    let chainId: number | undefined;
    try {
      chainId = getChainId(wagmiConfig);
    } catch {
      // ignore
    }

    if (chainId === 8453) return 'Base Mainnet';
    if (chainId === 84532) return 'Base Sepolia';
    if (chainId) return `Chain ${chainId}`;
    return 'Unknown Network';
  }

  isConnected(): boolean {
    const account = getAccount(wagmiConfig);
    return account.isConnected || !!this.getAddress();
  }
}
