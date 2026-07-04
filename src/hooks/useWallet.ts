import { useState, useEffect, useCallback } from 'react';
import { useWalletContext } from '../providers/WalletProvider';
import { watchAccount } from '@wagmi/core';
import { wagmiConfig } from '../config/wagmiConfig';

export function useWallet() {
  const { provider, activeChain, switchChain } = useWalletContext();
  
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
  }, [provider]);

  // Update local state when provider instance changes
  useEffect(() => {
    setAddress(provider.getAddress());
    setIsConnected(provider.isConnected());
    setNetworkLabel(provider.getNetworkLabel());
    fetchBalance();
  }, [provider, fetchBalance]);

  useEffect(() => {
    let unwatchAccount: (() => void) | undefined;
    
    // Wagmi's watchAccount is only relevant for the EvmProvider
    if (activeChain === 'evm') {
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
  }, [provider, activeChain, fetchBalance]);

  return {
    address,
    balance,
    networkLabel,
    isConnected,
    isFetching,
    activeChain,
    switchChain,
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
    sendTransaction: async (to: string, amount: string) => {
      const result = await provider.sendTransaction(to, amount);
      fetchBalance();
      return result;
    },
  };
}
