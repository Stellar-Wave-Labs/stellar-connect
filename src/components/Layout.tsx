import React from 'react';
import { CssBaseline, GeistProvider } from '@geist-ui/core';
import ThemeToggle from './ThemeToggle';
import AnimatedBackground from './AnimatedBackground';
import FloatingParticles from './FloatingParticles';
import AnimatedBubbles from './AnimatedBubbles';
import InteractiveBubbles from './InteractiveBubbles';
import BubbleTrail from './BubbleTrail';
import NetworkSwitcher from './NetworkSwitcher';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../hooks/useWallet';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const { activeChain } = useWallet();

  const isStellar = activeChain === 'stellar';

  return (
    <GeistProvider themeType={isDarkMode ? 'dark' : 'light'}>
      <CssBaseline />
      <div
        className="min-h-screen transition-all duration-700 relative overflow-hidden"
        style={{
          background: isStellar
            ? isDarkMode
              ? 'linear-gradient(135deg, #000005 0%, #080B1A 50%, #0D0F2B 100%)'
              : 'linear-gradient(135deg, #000000 0%, #0A0F2E 40%, #0D1B4B 100%)'
            : isDarkMode
            ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)'
            : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        }}
      >
        <AnimatedBackground />
        <FloatingParticles />
        <AnimatedBubbles />
        <InteractiveBubbles />
        <BubbleTrail />
        <NetworkSwitcher />
        <ThemeToggle />
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl relative z-10">
          <div className="space-y-6 sm:space-y-8">
            {children}
          </div>
        </div>
      </div>
    </GeistProvider>
  );
};

export default Layout;

