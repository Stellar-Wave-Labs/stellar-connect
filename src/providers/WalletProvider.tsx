import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ChainProvider } from '../chain/types';
import { EvmProvider } from '../chain/evm/provider';
import { StellarProvider } from '../chain/stellar/provider';

type ChainType = 'evm' | 'stellar';

interface WalletContextValue {
  provider: ChainProvider;
  activeChain: ChainType;
  switchChain: (chain: ChainType) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChain, setActiveChain] = useState<ChainType>(
    (import.meta.env.VITE_CHAIN as ChainType) === 'evm' ? 'evm' : 'stellar'
  );
  
  // Keep instances alive so we don't re-initialize SDKs constantly
  const evmProvider = useRef(new EvmProvider());
  const stellarProvider = useRef(new StellarProvider());

  const provider = activeChain === 'stellar' ? stellarProvider.current : evmProvider.current;

  const switchChain = async (chain: ChainType) => {
    if (chain === activeChain) return;
    
    // Disconnect the active provider before switching
    try {
      await provider.disconnect();
    } catch (e) {
      console.warn('Error disconnecting previous provider:', e);
    }
    
    setActiveChain(chain);
  };

  // Sync Stellar branding to <html> element via CSS class
  useEffect(() => {
    if (activeChain === 'stellar') {
      document.documentElement.classList.add('stellar-theme');
    } else {
      document.documentElement.classList.remove('stellar-theme');
    }
  }, [activeChain]);

  return (
    <WalletContext.Provider value={{ provider, activeChain, switchChain }}>
      {children}
    </WalletContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
