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
    balances,
    payments,
    networkLabel,
    isConnected,
    isFetching,
    fetchingPayments,
    refreshBalance,
    refreshPayments,
    sendTransaction,
    addTrustline,
    fundAccount,
    getContractValue,
    incrementContractValue,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Form State - Send Transaction
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // Form State - Trustline
  const [trustAssetCode, setTrustAssetCode] = useState('');
  const [trustIssuer, setTrustIssuer] = useState('');
  const [trustLoading, setTrustLoading] = useState(false);
  const [trustSuccessHash, setTrustSuccessHash] = useState<string | null>(null);
  const [trustError, setTrustError] = useState<string | null>(null);

  // Friendbot Funding State
  const [funding, setFunding] = useState(false);

  // Form State - Soroban Contract
  const [contractId, setContractId] = useState('CA3D5AJLEKNN24YSK2FTC5WDZHG67HK2Z27CXG5I434YPB27TQDAQCX7');
  const [contractValue, setContractValue] = useState<number | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractTxHash, setContractTxHash] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);
  const [contractStatusText, setContractStatusText] = useState<string | null>(null);

  const activeBalance = balances[selectedAssetIndex] || null;

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
    );
  }, []);

  // Reset form status when address or network changes
  useEffect(() => {
    setRecipient('');
    setAmount('');
    setTxHash(null);
    setTxError(null);
    setSelectedAssetIndex(0);
    setTrustAssetCode('');
    setTrustIssuer('');
    setTrustSuccessHash(null);
    setTrustError(null);
    setContractValue(null);
    setContractTxHash(null);
    setContractError(null);
    setContractStatusText(null);
  }, [address]);

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
    const explorerUrl = `https://stellar.expert/explorer/testnet/account/${address}`;
    window.open(explorerUrl, '_blank');
  };

  const handleSend = async () => {
    if (!recipient || !amount || !activeBalance) return;

    const { isValidAddress } = await import('../utils/address');
    if (!isValidAddress(recipient)) {
      setTxError('Invalid destination address for the Stellar network.');
      return;
    }

    setSending(true);
    setTxError(null);
    setTxHash(null);

    try {
      const result = await sendTransaction(
        recipient,
        amount,
        activeBalance.isNative ? undefined : activeBalance.code,
        activeBalance.isNative ? undefined : activeBalance.issuer
      );
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

  const handleEstablishTrust = async () => {
    if (!trustAssetCode || !trustIssuer) return;

    const { isValidAddress } = await import('../utils/address');
    if (!isValidAddress(trustIssuer)) {
      setTrustError('Invalid issuer address.');
      return;
    }

    setTrustLoading(true);
    setTrustError(null);
    setTrustSuccessHash(null);

    try {
      const result = await addTrustline(trustAssetCode, trustIssuer);
      setTrustSuccessHash(result.hash);
      setTrustAssetCode('');
      setTrustIssuer('');
    } catch (e) {
      console.error(e);
      setTrustError(e instanceof Error ? e.message : 'Failed to establish trustline.');
    } finally {
      setTrustLoading(false);
    }
  };

  const handleFriendbotFund = async () => {
    setFunding(true);
    try {
      await fundAccount();
    } catch (e) {
      console.error(e);
    } finally {
      setFunding(false);
    }
  };

  const handleFetchContractValue = async () => {
    if (!contractId) return;
    setContractLoading(true);
    setContractError(null);
    setContractTxHash(null);
    setContractStatusText('Simulating read call...');
    try {
      const val = await getContractValue(contractId);
      setContractValue(val);
    } catch (e) {
      console.error(e);
      setContractError(e instanceof Error ? e.message : 'Failed to read contract value.');
    } finally {
      setContractLoading(false);
      setContractStatusText(null);
    }
  };

  const handleIncrementContract = async () => {
    if (!contractId) return;
    setContractLoading(true);
    setContractError(null);
    setContractTxHash(null);
    try {
      setContractStatusText('Simulating transaction footprint...');
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      setContractStatusText('Awaiting wallet signature...');
      const result = await incrementContractValue(contractId);
      
      setContractStatusText('Submitting and polling ledger...');
      setContractTxHash(result.hash);
      
      // Auto-fetch new value
      const val = await getContractValue(contractId);
      setContractValue(val);
    } catch (e) {
      console.error(e);
      setContractError(e instanceof Error ? e.message : 'Contract transaction failed.');
    } finally {
      setContractLoading(false);
      setContractStatusText(null);
    }
  };

  const loadingSkeleton = isFetching && balances.length === 0;

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
                <div className="flex items-center justify-between mb-2">
                  <Text small type="secondary" className="flex items-center gap-2 mb-0">
                    <Coins className="w-4 h-4" />
                    Balances
                  </Text>
                  <div className="flex gap-2">
                    <ActionButton
                      auto
                      scale={0.7}
                      onClick={handleFriendbotFund}
                      loading={funding}
                      type="success"
                      title="Fund this wallet with 10k Testnet XLM"
                    >
                      Friendbot
                    </ActionButton>
                    <ActionButton
                      auto
                      scale={0.7}
                      icon={<RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />}
                      loading={isFetching}
                      onClick={refreshBalance}
                      type="secondary"
                    >
                      Refresh
                    </ActionButton>
                  </div>
                </div>

                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {balances.length === 0 ? (
                    <Text small type="secondary">No balances loaded</Text>
                  ) : (
                    balances.map((bal, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-neutral-800 p-2 rounded-xl border border-neutral-100 dark:border-neutral-700">
                        <div className="min-w-0 flex-1 pr-2">
                          <Text className="font-bold mb-0 text-sm">{bal.amount} {bal.symbol}</Text>
                          {!bal.isNative && bal.issuer && (
                            <Text className="text-[10px] text-text-secondary font-mono truncate block" title={bal.issuer}>
                              Issuer: {bal.issuer}
                            </Text>
                          )}
                        </div>
                        {bal.isNative ? (
                          <Tag type="secondary" scale={0.5} invert className="shrink-0">Native</Tag>
                        ) : (
                          <Tag type="warning" scale={0.5} invert className="shrink-0">Token</Tag>
                        )}
                      </div>
                    ))
                  )}
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
                  {/* Asset Select Dropdown */}
                  {balances.length > 1 && (
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Select Asset</label>
                      <select
                        value={selectedAssetIndex}
                        onChange={(e) => {
                          setSelectedAssetIndex(Number(e.target.value));
                          setTxError(null);
                          setTxHash(null);
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-base-blue text-sm text-text-primary focus:border-transparent"
                      >
                        {balances.map((bal, idx) => (
                          <option key={idx} value={idx}>
                            {bal.symbol} (Bal: {bal.amount})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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
                      placeholder="G..."
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
                      {activeBalance && (
                        <button
                          type="button"
                          onClick={() => setAmount(activeBalance.amount)}
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
                        href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
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

            {/* Add Trustline Form Card */}
            <Grid xs={24} md={12}>
              <div className="w-full bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 h-full flex flex-col justify-between">
                <div>
                  <Text small type="secondary" className="flex items-center gap-2 mb-3">
                    <Coins className="w-4 h-4" />
                    Add Custom Token (Trustline)
                  </Text>

                  {/* Preset Quick Select Buttons */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setTrustAssetCode('USDC');
                        setTrustIssuer('GBBD47IF6LWK7P7TCIHO2XHG75NZ54O4QA6P7CA45543FA57VTSZNDGS');
                        setTrustError(null);
                        setTrustSuccessHash(null);
                      }}
                      className="px-2.5 py-1 bg-base-blue/10 hover:bg-base-blue/20 text-base-blue text-xs font-semibold rounded-lg transition-colors border-0 cursor-pointer"
                    >
                      + USDC (Testnet)
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Asset Code</label>
                      <input
                        type="text"
                        value={trustAssetCode}
                        onChange={(e) => {
                          setTrustAssetCode(e.target.value.toUpperCase());
                          setTrustError(null);
                          setTrustSuccessHash(null);
                        }}
                        placeholder="USDC"
                        maxLength={12}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-base-blue text-sm font-semibold text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Issuer Address</label>
                      <input
                        type="text"
                        value={trustIssuer}
                        onChange={(e) => {
                          setTrustIssuer(e.target.value);
                          setTrustError(null);
                          setTrustSuccessHash(null);
                        }}
                        placeholder="G..."
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-base-blue text-sm font-mono text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {trustError && (
                    <div className="text-xs text-error font-medium bg-error/10 border border-error/20 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{trustError}</span>
                    </div>
                  )}

                  {trustSuccessHash && (
                    <div className="text-xs text-success font-medium bg-success/10 border border-success/20 p-3 rounded-xl flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Trustline established!</span>
                      </div>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${trustSuccessHash}`}
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
                    loading={trustLoading}
                    disabled={!trustAssetCode || !trustIssuer || trustLoading}
                    onClick={handleEstablishTrust}
                  >
                    Establish Trustline
                  </ActionButton>
                </div>
              </div>
            </Grid>

            {/* Soroban Smart Contract Counter Card */}
            <Grid xs={24} md={12}>
              <div className="w-full bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 h-full flex flex-col justify-between">
                <div>
                  <Text small type="secondary" className="flex items-center gap-2 mb-3">
                    <Send className="w-4 h-4" />
                    Soroban WASM Smart Contract Counter
                  </Text>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Counter Contract ID</label>
                      <input
                        type="text"
                        value={contractId}
                        onChange={(e) => {
                          setContractId(e.target.value);
                          setContractError(null);
                          setContractTxHash(null);
                        }}
                        placeholder="C..."
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-base-blue text-sm font-mono text-text-primary"
                      />
                    </div>

                    {contractValue !== null && (
                      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl text-center">
                        <Text small type="secondary" className="mb-0 block">Current Counter Value</Text>
                        <Text h2 className="mb-0 mt-1 font-bold text-base-blue">{contractValue}</Text>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {contractStatusText && (
                    <div className="text-xs text-text-accent font-semibold bg-base-blue/5 border border-base-blue/15 p-3 rounded-xl flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
                      <span>{contractStatusText}</span>
                    </div>
                  )}

                  {contractError && (
                    <div className="text-xs text-error font-medium bg-error/10 border border-error/20 p-3 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{contractError}</span>
                    </div>
                  )}

                  {contractTxHash && (
                    <div className="text-xs text-success font-medium bg-success/10 border border-success/20 p-3 rounded-xl flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>Increment Successful!</span>
                      </div>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${contractTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-base-blue underline font-mono break-all mt-1 inline-flex items-center gap-1"
                      >
                        View on Explorer <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <ActionButton
                      auto
                      className="flex-1"
                      onClick={handleFetchContractValue}
                      disabled={!contractId || contractLoading}
                    >
                      Fetch Value
                    </ActionButton>
                    <ActionButton
                      auto
                      className="flex-1"
                      type="secondary"
                      loading={contractLoading && !contractStatusText?.includes('read')}
                      onClick={handleIncrementContract}
                      disabled={!contractId || contractLoading}
                    >
                      Increment
                    </ActionButton>
                  </div>
                </div>
              </div>
            </Grid>
          </Grid.Container>
        </Card.Content>
      </Card>

      {/* Recent Payments Section */}
      <div className="mt-6 text-left">
        <Card shadow width="100%">
          <Card.Content>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-base-blue to-base-dark-blue rounded-full flex items-center justify-center shadow-lg">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Text h4 className="mb-0">Recent Payments</Text>
                  <Text small type="secondary">Your last 10 on-chain operations</Text>
                </div>
              </div>
              <ActionButton
                auto
                scale={0.7}
                icon={<RefreshCw size={12} className={fetchingPayments ? 'animate-spin' : ''} />}
                loading={fetchingPayments}
                onClick={refreshPayments}
                type="secondary"
              >
                Refresh
              </ActionButton>
            </div>

            {fetchingPayments && payments.length === 0 ? (
              <div className="py-8 text-center">
                <Text small type="secondary" className="animate-pulse">Loading transaction history...</Text>
              </div>
            ) : payments.length === 0 ? (
              <div className="py-8 text-center bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
                <Coins className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-50" />
                <Text small type="secondary">No payment history found for this account.</Text>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="py-3 px-4 font-semibold text-text-secondary text-xs uppercase">Type</th>
                      <th className="py-3 px-4 font-semibold text-text-secondary text-xs uppercase">From / To</th>
                      <th className="py-3 px-4 font-semibold text-text-secondary text-xs uppercase">Amount</th>
                      <th className="py-3 px-4 font-semibold text-text-secondary text-xs uppercase text-right">Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const isIncoming = p.to === address;
                      const displayAddr = isIncoming ? p.from : p.to;
                      const typeLabel = p.type === 'create_account'
                        ? 'Create Account'
                        : isIncoming ? 'Received' : 'Sent';

                      return (
                        <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                p.type === 'create_account' ? 'bg-amber-400' : isIncoming ? 'bg-emerald-400' : 'bg-rose-400'
                              }`} />
                              <span className="font-medium text-text-primary text-xs sm:text-sm">{typeLabel}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-text-secondary">
                            <span title={displayAddr}>
                              {displayAddr ? `${displayAddr.slice(0, 6)}...${displayAddr.slice(-6)}` : 'System'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            <span className={isIncoming ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                              {isIncoming ? '+' : '-'}{p.amount} {p.symbol}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${p.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-base-blue hover:underline text-xs"
                            >
                              Explorer <ExternalLink size={12} />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </motion.div>
  );
};

export default WalletInfo;
