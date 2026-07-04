import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Text } from '@geist-ui/core';
import { AlertCircle, Power } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { formatAddress } from '../utils/address';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActionButton = Button as React.ComponentType<any>;

const Hero: React.FC = () => {
  const { address, isConnected, networkLabel, connect, disconnect } = useWallet();
  const [wcLoading, setWcLoading] = useState(false);
  const [wcError, setWcError] = useState<string | null>(null);

  const handleWalletConnect = async () => {
    setWcLoading(true);
    setWcError(null);
    try {
      await connect();
    } catch (err) {
      setWcError(
        err instanceof Error ? err.message : 'Failed to connect. Please try again.'
      );
    } finally {
      setWcLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <motion.div
      className="text-center py-8 sm:py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8 max-w-2xl mx-auto px-4">
        {/* Hero Icon — Stellar logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-neutral-800 rounded-2xl mb-6 mx-auto overflow-hidden p-3 shadow-lg border border-neutral-200 dark:border-neutral-700">
          <motion.img
            src="/stellar.png"
            alt="Stellar"
            className="w-14 h-14 object-contain"
            initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 280 }}
          />
        </div>

        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">
            StellarConnect
          </h1>
          <p className="text-lg sm:text-xl text-[#a0b4d0]">
            Connect your wallet to the Stellar network. View XLM balances and explore the Stellar ecosystem.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isConnected ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-2xl mx-auto px-2">
              <Card shadow width="100%">
                <Card.Content className="px-4 sm:px-6">
                  <div className="flex flex-col gap-6 max-w-xl mx-auto">
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    >
                      <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-lg p-3">
                        <img src="/stellar.png" alt="Stellar" className="w-10 h-10 object-contain" />
                      </div>
                    </motion.div>
                    <div>
                      <Text h3 className="mb-1">🎉 Wallet Connected</Text>
                      <Text small type="secondary">{networkLabel}</Text>
                    </div>
                    <div className="bg-white/50 dark:bg-neutral-800/50 rounded-xl p-4 text-left">
                      <Text small type="secondary">Wallet Address</Text>
                      <Text className="font-mono text-base-blue break-all">{formatAddress(address)}</Text>
                    </div>
                    <div className="grid gap-3">
                      <ActionButton
                        auto
                        scale={1}
                        icon={<Power className="w-4 h-4" />}
                        onClick={handleDisconnect}
                      >
                        Disconnect Wallet
                      </ActionButton>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-2xl mx-auto px-2">
              <Card shadow width="100%">
                <Card.Content className="px-4 sm:px-6">
                  <div className="flex flex-col gap-6 max-w-xl mx-auto">
                    <div className="flex items-center gap-4 justify-center">
                      <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center p-3">
                        <img src="/stellar.png" alt="Stellar" className="w-10 h-10 object-contain" />
                      </div>
                      <div className="text-left">
                        <Text h3 className="mb-0">Connect your wallet</Text>
                        <Text small type="secondary">
                          Securely authenticate with Stellar in seconds.
                        </Text>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <ActionButton
                        auto
                        scale={1}
                        className="w-full"
                        onClick={handleWalletConnect}
                        loading={wcLoading}
                      >
                        Connect Wallet
                      </ActionButton>
                    </div>
                    <Text small type="secondary">
                      💡 Works with Freighter, xBull, Rabet and more.
                    </Text>
                    {wcError && (
                      <div className="bg-error/10 border border-error/20 rounded-xl p-3 flex items-center gap-2 text-error">
                        <AlertCircle className="w-4 h-4" />
                        <Text small type="error">
                          {wcError}
                        </Text>
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Hero;
