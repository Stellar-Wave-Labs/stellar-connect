import { ChainProvider } from '../types';
import { StellarWalletsKit, WalletNetwork, FreighterModule, xBullModule, AlbedoModule, RabetModule } from '@creit.tech/stellar-wallets-kit';
import { ACTIVE_STELLAR_NETWORK, ACTIVE_STELLAR_PASSPHRASE, getNetworkLabel } from './network';
import { getXlmBalance } from './horizon';

export class StellarProvider implements ChainProvider {
  private kit: StellarWalletsKit;
  private currentAddress: string | null = null;

  constructor() {
    this.kit = new StellarWalletsKit({
      network: ACTIVE_STELLAR_NETWORK === 'MAINNET' ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET,
      modules: [
        new FreighterModule(),
        new xBullModule(),
        new AlbedoModule(),
        new RabetModule(),
      ],
    });
  }

  async connect(): Promise<{ address: string }> {
    return new Promise((resolve, reject) => {
      this.kit.openModal({
        onWalletSelected: async (option) => {
          try {
            this.kit.setWallet(option.id);
            const address = await this.kit.getAddress();
            this.currentAddress = address;
            resolve({ address });
          } catch (e) {
            reject(e);
          }
        },
        onClosed: (error) => {
          if (error) reject(error);
          else reject(new Error('Wallet selection was closed.'));
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    // stellar-wallets-kit manages connection primarily through instance state.
    // We disconnect by clearing our local address reference and calling kit disconnect if available.
    try {
      if ('disconnect' in this.kit && typeof this.kit.disconnect === 'function') {
         await (this.kit as any).disconnect();
      }
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
