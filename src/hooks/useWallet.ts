import { useState, useEffect, useCallback } from 'react';
import { useWalletContext } from '../providers/WalletProvider';
import type { BalanceInfo } from '../chain/types';

export function useWallet() {
  const { provider, activeChain } = useWalletContext();
  
  const [address, setAddress] = useState<string | null>(provider.getAddress());
  const [isConnected, setIsConnected] = useState<boolean>(provider.isConnected());
  const [networkLabel, setNetworkLabel] = useState<string>(provider.getNetworkLabel());
  const [balances, setBalances] = useState<BalanceInfo[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const fetchBalance = useCallback(async () => {
    const currentAddress = provider.getAddress();
    if (currentAddress) {
      setIsFetching(true);
      try {
        const bal = await provider.getBalances(currentAddress);
        setBalances(bal);
      } catch (e) {
        console.error(e);
      } finally {
        setIsFetching(false);
      }
    } else {
      setBalances([]);
    }
  }, [provider]);

  // Update local state when provider instance changes
  useEffect(() => {
    setAddress(provider.getAddress());
    setIsConnected(provider.isConnected());
    setNetworkLabel(provider.getNetworkLabel());
    fetchBalance();
  }, [provider, fetchBalance]);

  useEffect(() => {
    // Refresh balance periodically (e.g. every 30s)
    const interval = setInterval(fetchBalance, 30_000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchBalance]);

  return {
    address,
    balances,
    networkLabel,
    isConnected,
    isFetching,
    activeChain,
    refreshBalance: fetchBalance,
    connect: async () => {
      await provider.connect();
      setAddress(provider.getAddress());
      setIsConnected(provider.isConnected());
      setNetworkLabel(provider.getNetworkLabel());
      fetchBalance();
    },
    disconnect: async () => {
      await provider.disconnect();
      setAddress(null);
      setIsConnected(false);
      setBalances([]);
    },
    sendTransaction: async (to: string, amount: string, assetCode?: string, assetIssuer?: string) => {
      const result = await provider.sendTransaction(to, amount, assetCode, assetIssuer);
      fetchBalance();
      return result;
    },
  };
}
