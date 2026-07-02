import { useState, useEffect, useCallback } from 'react';
import { EvmProvider } from '../chain/evm/provider';
import { watchAccount, watchBlockNumber } from '@wagmi/core';
import { wagmiConfig } from '../config/wagmiConfig';
import { ChainProvider } from '../chain/types';

// Singleton instance for now
const provider: ChainProvider = new EvmProvider();

export function useWallet() {
  const [address, setAddress] = useState<string | null>(provider.getAddress());
  const [isConnected, setIsConnected] = useState<boolean>(provider.isConnected());
  const [networkLabel, setNetworkLabel] = useState<string>(provider.getNetworkLabel());
  const [balance, setBalance] = useState<{ amount: string; symbol: string } | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchBalance = useCallback(async () => {
    const currentAddress = provider.getAddress();
    if (currentAddress) {
      setIsFetching(true);
      try {
        const bal = await provider.getBalance(currentAddress);
        setBalance(bal);
      } catch (e) {
        console.error(e);
      } finally {
        setIsFetching(false);
      }
    } else {
      setBalance(null);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchBalance();

    const unwatchAccount = watchAccount(wagmiConfig, {
      onChange() {
        setAddress(provider.getAddress());
        setIsConnected(provider.isConnected());
        setNetworkLabel(provider.getNetworkLabel());
        fetchBalance();
      },
    });

    // Refresh balance periodically (e.g. every 30s)
    const interval = setInterval(fetchBalance, 30_000);

    return () => {
      unwatchAccount();
      clearInterval(interval);
    };
  }, [fetchBalance]);

  return {
    address,
    balance,
    networkLabel,
    isConnected,
    isFetching,
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
      setBalance(null);
    },
  };
}
