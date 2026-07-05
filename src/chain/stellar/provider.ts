import type { ChainProvider, BalanceInfo, PaymentRecord } from '../types';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { Networks } from '@creit.tech/stellar-wallets-kit/types';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { RabetModule } from '@creit.tech/stellar-wallets-kit/modules/rabet';
import { ACTIVE_STELLAR_NETWORK, ACTIVE_STELLAR_PASSPHRASE, getNetworkLabel } from './network';
import { getStellarBalances, getRecentPayments, fundWithFriendbot, rpcServer, server } from './horizon';
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

  async fundAccount(address: string): Promise<boolean> {
    return fundWithFriendbot(address);
  }

  async getContractValue(contractId: string): Promise<number> {
    const contract = new StellarSdk.Contract(contractId);
    
    // Temporary keypair for simulated call authentication (doesn't hit ledger)
    const tempSource = StellarSdk.Keypair.random();
    const sourceAccount = new StellarSdk.Account(tempSource.publicKey(), '0');

    // Attempt 'get_value'
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: ACTIVE_STELLAR_PASSPHRASE,
    })
      .addOperation(contract.call('get_value'))
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();

    const simulation = await rpcServer.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation)) {
      const resultVal = simulation.result?.retval;
      if (resultVal) {
        return StellarSdk.scValToNative(resultVal);
      }
    }
    
    // Attempt fallback 'get'
    const fallbackTx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: ACTIVE_STELLAR_PASSPHRASE,
    })
      .addOperation(contract.call('get'))
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();
      
    const fallbackSim = await rpcServer.simulateTransaction(fallbackTx);
    if (StellarSdk.rpc.Api.isSimulationSuccess(fallbackSim)) {
      const resultVal = fallbackSim.result?.retval;
      if (resultVal) {
        return StellarSdk.scValToNative(resultVal);
      }
    }

    throw new Error('Simulation failed. Could not read value from counter contract.');
  }

  async incrementContractValue(contractId: string): Promise<{ hash: string }> {
    const sender = this.getAddress();
    if (!sender) throw new Error('Wallet not connected.');

    const sourceAccount = await server.loadAccount(sender);
    const contract = new StellarSdk.Contract(contractId);

    // 1. Build initial call transaction
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: ACTIVE_STELLAR_PASSPHRASE,
    })
      .addOperation(contract.call('increment'))
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();

    // 2. Prepare transaction (simulates and assembles automatically)
    const preparedTx = await rpcServer.prepareTransaction(tx);

    const xdr = preparedTx.toXDR();

    // 3. Request wallet to sign the transaction
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase: ACTIVE_STELLAR_PASSPHRASE,
      address: sender,
    });

    // 4. Submit signed transaction to RPC server
    const txToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, ACTIVE_STELLAR_PASSPHRASE);
    const sendResponse = await rpcServer.sendTransaction(txToSubmit);
    
    if (sendResponse.status === 'ERROR') {
      throw new Error(`RPC submission error: ${JSON.stringify(sendResponse.errorResult)}`);
    }

    const txHash = sendResponse.hash;

    // 5. Poll transaction status until complete
    let status: string = sendResponse.status;
    let attempts = 0;
    while (status === 'PENDING' && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const getTxResponse = await rpcServer.getTransaction(txHash);
      status = getTxResponse.status as string;
      if (status === 'SUCCESS') {
        return { hash: txHash };
      }
      if (status === 'FAILED') {
        throw new Error('Transaction execution failed.');
      }
      attempts++;
    }

    if (status === 'PENDING') {
      throw new Error('Transaction execution timed out.');
    }

    return { hash: txHash };
  }
}
