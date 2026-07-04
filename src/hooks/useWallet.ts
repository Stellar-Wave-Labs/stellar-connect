import { useState, useEffect, useCallback } from 'react';
import { useWalletContext } from '../providers/WalletProvider';
import type { BalanceInfo, PaymentRecord } from '../chain/types';

export function useWallet() {
  const { provider, activeChain } = useWalletContext();
  
  const [address, setAddress] = useState<string | null>(provider.getAddress());
  const [isConnected, setIsConnected] = useState<boolean>(provider.isConnected());
  const [networkLabel, setNetworkLabel] = useState<string>(provider.getNetworkLabel());
  const [balances, setBalances] = useState<BalanceInfo[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [fetchingPayments, setFetchingPayments] = useState(false);

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

  const fetchPayments = useCallback(async () => {
    const currentAddress = provider.getAddress();
    if (currentAddress) {
      setFetchingPayments(true);
      try {
        const history = await provider.getRecentPayments(currentAddress);
        setPayments(history);
      } catch (e) {
        console.error(e);
      } finally {
        setFetchingPayments(false);
      }
    } else {
      setPayments([]);
    }
  }, [provider]);

  // Update local state when provider instance changes
  useEffect(() => {
    setAddress(provider.getAddress());
    setIsConnected(provider.isConnected());
    setNetworkLabel(provider.getNetworkLabel());
    fetchBalance();
    fetchPayments();
  }, [provider, fetchBalance, fetchPayments]);

  useEffect(() => {
    // Refresh balance and payments periodically (e.g. every 30s)
    const interval = setInterval(() => {
      fetchBalance();
      fetchPayments();
    }, 30_000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchBalance, fetchPayments]);

  return {
    address,
    balances,
    payments,
    networkLabel,
    isConnected,
    isFetching,
    fetchingPayments,
    activeChain,
    refreshBalance: fetchBalance,
    refreshPayments: fetchPayments,
    connect: async () => {
      await provider.connect();
      setAddress(provider.getAddress());
      setIsConnected(provider.isConnected());
      setNetworkLabel(provider.getNetworkLabel());
      fetchBalance();
      fetchPayments();
    },
    disconnect: async () => {
      await provider.disconnect();
      setAddress(null);
      setIsConnected(false);
      setBalances([]);
      setPayments([]);
    },
    sendTransaction: async (to: string, amount: string, assetCode?: string, assetIssuer?: string) => {
      const result = await provider.sendTransaction(to, amount, assetCode, assetIssuer);
      fetchBalance();
      fetchPayments();
      return result;
    },
    addTrustline: async (assetCode: string, assetIssuer: string) => {
      const result = await provider.addTrustline(assetCode, assetIssuer);
      fetchBalance();
      fetchPayments();
      return result;
    },
  };
}
