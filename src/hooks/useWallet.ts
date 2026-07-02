import { useState, useEffect, useCallback } from 'react';
import { EvmProvider } from '../chain/evm/provider';
import { StellarProvider } from '../chain/stellar/provider';
import { watchAccount } from '@wagmi/core';
import { wagmiConfig } from '../config/wagmiConfig';
import { ChainProvider } from '../chain/types';

const IS_STELLAR = import.meta.env.VITE_CHAIN === 'stellar';

// Singleton instance dynamically selected
const provider: ChainProvider = IS_STELLAR ? new StellarProvider() : new EvmProvider();

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

    let unwatchAccount: (() => void) | undefined;
    
    // Wagmi's watchAccount is only relevant for the EvmProvider
    if (!IS_STELLAR) {
      unwatchAccount = watchAccount(wagmiConfig, {
        onChange() {
          setAddress(provider.getAddress());
          setIsConnected(provider.isConnected());
          setNetworkLabel(provider.getNetworkLabel());
          fetchBalance();
        },
      });
    }

    // Refresh balance periodically (e.g. every 30s)
    const interval = setInterval(fetchBalance, 30_000);

    return () => {
      if (unwatchAccount) unwatchAccount();
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
