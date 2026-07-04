import type { ChainProvider, BalanceInfo, PaymentRecord } from '../types';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { Networks } from '@creit.tech/stellar-wallets-kit/types';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { RabetModule } from '@creit.tech/stellar-wallets-kit/modules/rabet';
import { ACTIVE_STELLAR_NETWORK, ACTIVE_STELLAR_PASSPHRASE, getNetworkLabel } from './network';
import { getStellarBalances, getRecentPayments, server } from './horizon';
import * as StellarSdk from '@stellar/stellar-sdk';

export class StellarProvider implements ChainProvider {
  private currentAddress: string | null = null;

  constructor() {
    StellarWalletsKit.init({
      network: ACTIVE_STELLAR_NETWORK === 'MAINNET' ? Networks.PUBLIC : Networks.TESTNET,
      selectedWalletId: 'freighter',
      modules: [
        new FreighterModule(),
        new xBullModule(),
        new RabetModule(),
      ],
    });
  }

  async connect(): Promise<{ address: string }> {
    const { address } = await StellarWalletsKit.authModal();
    this.currentAddress = address;
    return { address };
  }

  async disconnect(): Promise<void> {
    try {
      await StellarWalletsKit.disconnect();
    } catch (e) {
      console.warn('Failed to disconnect kit natively, falling back to state clearing', e);
    }
    this.currentAddress = null;
  }

  getAddress(): string | null {
    return this.currentAddress;
  }

  async getBalances(address: string): Promise<BalanceInfo[]> {
    const result = await getStellarBalances(address);
    return result.balances;
  }

  getNetworkLabel(): string {
    return getNetworkLabel(ACTIVE_STELLAR_PASSPHRASE);
  }

  isConnected(): boolean {
    return !!this.currentAddress;
  }

  async sendTransaction(
    to: string,
    amount: string,
    assetCode?: string,
    assetIssuer?: string
  ): Promise<{ hash: string }> {
    const sender = this.getAddress();
    if (!sender) throw new Error('Wallet not connected.');

    // Load account state from Horizon
    const sourceAccount = await server.loadAccount(sender);

    // Determine target asset type (Native vs Custom Credit)
    const asset = assetCode && assetIssuer
      ? new StellarSdk.Asset(assetCode, assetIssuer)
      : StellarSdk.Asset.native();

    // Build the transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: ACTIVE_STELLAR_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: to,
        asset: asset,
        amount: amount,
      }))
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();

    const xdr = transaction.toXDR();

    // Request wallet to sign the transaction
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase: ACTIVE_STELLAR_PASSPHRASE,
      address: sender,
    });

    // Reconstruct and submit to Horizon
    const txToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, ACTIVE_STELLAR_PASSPHRASE);
    const response = await server.submitTransaction(txToSubmit);

    return { hash: response.hash };
  }

  async getRecentPayments(address: string): Promise<PaymentRecord[]> {
    return getRecentPayments(address);
  }

  async addTrustline(assetCode: string, assetIssuer: string): Promise<{ hash: string }> {
    const sender = this.getAddress();
    if (!sender) throw new Error('Wallet not connected.');

    // Load account state from Horizon
    const sourceAccount = await server.loadAccount(sender);
    const asset = new StellarSdk.Asset(assetCode, assetIssuer);

    // Build the changeTrust transaction
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: ACTIVE_STELLAR_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: asset,
      }))
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();

    const xdr = transaction.toXDR();

    // Request wallet to sign the transaction
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase: ACTIVE_STELLAR_PASSPHRASE,
      address: sender,
    });

    // Reconstruct and submit to Horizon
    const txToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, ACTIVE_STELLAR_PASSPHRASE);
    const response = await server.submitTransaction(txToSubmit);

    return { hash: response.hash };
  }
}
