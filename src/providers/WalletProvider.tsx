import React, { createContext, useContext, useRef, useEffect } from 'react';
import type { ChainProvider } from '../chain/types';
import { StellarProvider } from '../chain/stellar/provider';

type ChainType = 'stellar';

interface WalletContextValue {
  provider: ChainProvider;
  activeChain: ChainType;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const stellarProvider = useRef(new StellarProvider());

  // Sync branding (CSS classes, browser title, and favicon) to active chain (Stellar)
  useEffect(() => {
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    document.documentElement.classList.add('stellar-theme');
    document.title = 'StellarConnect';
    if (favicon) {
      favicon.href = '/stellar.png';
      favicon.type = 'image/png';
    }
  }, []);

  return (
    <WalletContext.Provider value={{ provider: stellarProvider.current, activeChain: 'stellar' }}>
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
