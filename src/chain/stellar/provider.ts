import type { ChainProvider } from '../types';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { Networks } from '@creit.tech/stellar-wallets-kit/types';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { RabetModule } from '@creit.tech/stellar-wallets-kit/modules/rabet';
import { ACTIVE_STELLAR_NETWORK, ACTIVE_STELLAR_PASSPHRASE, getNetworkLabel } from './network';
import { getXlmBalance } from './horizon';

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

  async getBalance(address: string): Promise<{ amount: string; symbol: string }> {
    const result = await getXlmBalance(address);
    return {
      amount: result.amount,
      symbol: result.symbol
    };
  }

  getNetworkLabel(): string {
    return getNetworkLabel(ACTIVE_STELLAR_PASSPHRASE);
  }

  isConnected(): boolean {
    return !!this.currentAddress;
  }
}
