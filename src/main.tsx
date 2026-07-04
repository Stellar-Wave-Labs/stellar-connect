import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { Web3Provider } from './providers/Web3Provider';
import { WalletProvider } from './providers/WalletProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Web3Provider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </Web3Provider>
    </ThemeProvider>
  </StrictMode>
);
