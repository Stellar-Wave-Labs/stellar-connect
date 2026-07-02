import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Button, Card, Grid, Spacer, Text, Snippet, Tag } from '@geist-ui/core';
import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Network,
  Coins,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

const ActionButton = Button as React.ComponentType<any>;

const WalletInfo: React.FC = () => {
  const { address, balance, networkLabel, isConnected, isFetching, refreshBalance } = useWallet();
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
    );
  }, []);

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const openExplorer = () => {
    if (!address) return;
    // Explorer URL could be abstracted by the provider in the future,
    // for now we just link to a generic explorer or the address directly if we know it.
    // Defaulting to Base mainnet basescan for the demo
    const explorerUrl = `https://basescan.org/address/${address}`;
    window.open(explorerUrl, '_blank');
  };

  const balanceDisplay = balance ? `${balance.amount} ${balance.symbol}` : '--';
  const loadingSkeleton = isFetching && !balance;

  if (loadingSkeleton) {
    return (
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3" />
          <div className="h-3 bg-neutral-200 rounded w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map((item) => (
              <div key={item} className="h-24 bg-neutral-100 rounded-xl" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isConnected || !address) {
    return (
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <Wallet className="w-10 h-10 text-base-blue" />
          <div className="text-left">
            <Text h4 className="mb-0">
              Connect your wallet to continue
            </Text>
            <Text small type="secondary">
              Your address, network, and balances will appear here.
            </Text>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card shadow width="100%">
        <Card.Content>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-base-blue to-base-dark-blue rounded-full flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <Text h3 className="mb-0">
                Wallet Overview
              </Text>
              <Text small type="secondary">
                Everything you need to know about your session.
              </Text>
            </div>
          </div>

          <Grid.Container gap={2}>
            <Grid xs={24} md={12}>
              <div className="w-full bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <Text small type="secondary" className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4" />
                  Wallet Address
                </Text>
            <Snippet symbol="" width="100%" className="mb-3" text={address ?? ''}>
                  {address}
                </Snippet>
                <div className="flex gap-2">
                  <ActionButton
                    auto
                    scale={0.8}
                    onClick={copyAddress}
                    icon={copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </ActionButton>
                  <ActionButton
                    auto
                    scale={0.8}
                    icon={<ExternalLink size={16} />}
                    onClick={openExplorer}
                  >
                    Explorer
                  </ActionButton>
                </div>
              </div>
            </Grid>

            <Grid xs={24} md={12}>
              <div className="w-full bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <Text small type="secondary" className="flex items-center gap-2 mb-1">
                  <Network className="w-4 h-4" />
                  Network
                </Text>
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-semibold mb-1">{networkLabel}</Text>
                    <Tag type="success" invert>
                      Connected
                    </Tag>
                  </div>
                </div>
              </div>
            </Grid>

            <Grid xs={24}>
              <div className="w-full bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <Text small type="secondary" className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4" />
                  Balance
                </Text>
                <div className="flex items-center justify-between">
                  <div>
                    <Text h3 className="mb-0">
                      {balanceDisplay}
                    </Text>
                    <Text small type="secondary">
                      Updated automatically every 30 seconds
                    </Text>
                  </div>
                  <ActionButton
                    auto
                    scale={0.8}
                    icon={<RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />}
                    loading={isFetching}
                    onClick={refreshBalance}
                    type="secondary"
                  >
                    Refresh
                  </ActionButton>
                </div>
              </div>
            </Grid>
          </Grid.Container>
        </Card.Content>
      </Card>
    </motion.div>
  );
};

export default WalletInfo;
