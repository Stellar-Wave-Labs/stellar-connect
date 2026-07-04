import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Button, Card, Grid, Text, Snippet, Tag } from '@geist-ui/core';
import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Network,
  Coins,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActionButton = Button as React.ComponentType<any>;

const WalletInfo: React.FC = () => {
  const {
    address,
    balance,
    networkLabel,
    isConnected,
    isFetching,
    refreshBalance,
    activeChain,
    sendTransaction,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Form State
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
    );
  }, []);

  // Reset form status when chain changes
  useEffect(() => {
    setRecipient('');
    setAmount('');
    setTxHash(null);
    setTxError(null);
  }, [activeChain]);

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
    const explorerUrl =
      activeChain === 'stellar'
        ? `https://stellar.expert/explorer/testnet/account/${address}`
        : `https://sepolia.basescan.org/address/${address}`;
    window.open(explorerUrl, '_blank');
  };

  const handleSend = async () => {
    if (!recipient || !amount) return;

    const { isValidAddress } = await import('../utils/address');
    if (!isValidAddress(recipient)) {
      setTxError(`Invalid destination address for the ${activeChain === 'stellar' ? 'Stellar' : 'Base (EVM)'} network.`);
      return;
    }

    setSending(true);
    setTxError(null);
    setTxHash(null);

    try {
      const result = await sendTransaction(recipient, amount);
      setTxHash(result.hash);
      setRecipient('');
      setAmount('');
    } catch (e) {
      console.error(e);
      setTxError(e instanceof Error ? e.message : 'Transaction failed.');
    } finally {
      setSending(false);
    }
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
              <div className="w-full bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 h-full">
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

            <Grid xs={24} md={12}>
              <div className="w-full bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 h-full">
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

            {/* Send Assets Form Card */}
            <Grid xs={24} md={12}>
              <div className="w-full bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <Text small type="secondary" className="flex items-center gap-2 mb-3">
                  <Send className="w-4 h-4" />
                  Send Assets
                </Text>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Recipient Address</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => {
                        setRecipient(e.target.value);
                        setTxError(null);
                        setTxHash(null);
                      }}
                      placeholder={activeChain === 'stellar' ? 'G...' : '0x...'}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-base-blue text-sm font-mono text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Amount</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setTxError(null);
                          setTxHash(null);
                        }}
                        placeholder="0.0"
                        className="flex-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-base-blue text-sm text-text-primary"
                      />
                      {balance && (
                        <button
                          type="button"
                          onClick={() => setAmount(balance.amount)}
                          className="px-3 py-2 bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 rounded-xl text-xs font-semibold transition-colors text-text-primary"
                        >
                          Max
                        </button>
                      )}
                    </div>
                  </div>

                  {txError && (
                    <div className="text-xs text-error font-medium bg-error/10 border border-error/20 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{txError}</span>
                    </div>
                  )}

                  {txHash && (
                    <div className="text-xs text-success font-medium bg-success/10 border border-success/20 p-3 rounded-xl flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Transaction successful!</span>
                      </div>
                      <a
                        href={
                          activeChain === 'stellar'
                            ? `https://stellar.expert/explorer/testnet/tx/${txHash}`
                            : `https://sepolia.basescan.org/tx/${txHash}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-base-blue underline font-mono break-all mt-1 inline-flex items-center gap-1"
                      >
                        View on Explorer <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  <ActionButton
                    auto
                    className="w-full"
                    type="secondary"
                    loading={sending}
                    disabled={!recipient || !amount || sending}
                    onClick={handleSend}
                  >
                    Send Transaction
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
