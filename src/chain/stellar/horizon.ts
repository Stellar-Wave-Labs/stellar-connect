import * as StellarSdk from '@stellar/stellar-sdk';
import { ACTIVE_STELLAR_NETWORK } from './network';

// Get the appropriate Horizon URL based on the active network
const HORIZON_URL =
  ACTIVE_STELLAR_NETWORK === 'MAINNET'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);

/**
 * Gets the native XLM balance for an account.
 * If the account does not exist (is unfunded), returns 0 rather than throwing an error.
 */
export async function getXlmBalance(address: string): Promise<{ amount: string; symbol: string; exists: boolean }> {
  try {
    const account = await server.loadAccount(address);
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
    
    if (nativeBalance) {
      return {
        amount: Number(nativeBalance.balance).toFixed(4),
        symbol: 'XLM',
        exists: true,
      };
    }
    
    // Account exists but somehow no native balance entry (extremely rare in Stellar)
    return { amount: '0', symbol: 'XLM', exists: true };
  } catch (error: any) {
    // If account doesn't exist on-chain (unfunded), return 0 without throwing
    if (error?.response?.status === 404 || error?.name === 'NotFoundError') {
      return {
        amount: '0',
        symbol: 'XLM',
        exists: false,
      };
    }
    
    // For other errors (e.g. network issues), rethrow or handle accordingly
    console.error('Failed to load Stellar account:', error);
    throw error;
  }
}
