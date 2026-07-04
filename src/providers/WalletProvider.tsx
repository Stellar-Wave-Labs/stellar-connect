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

  // Sync branding (CSS classes, browser title, and favicon) to active chain
  useEffect(() => {
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (activeChain === 'stellar') {
      document.documentElement.classList.add('stellar-theme');
      document.title = 'StellarConnect';
      if (favicon) {
        favicon.href = '/stellar.png';
        favicon.type = 'image/png';
      }
    } else {
      document.documentElement.classList.remove('stellar-theme');
      document.title = 'BaseConnect';
      if (favicon) {
        favicon.href = '/base.png';
        favicon.type = 'image/png';
      }
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
