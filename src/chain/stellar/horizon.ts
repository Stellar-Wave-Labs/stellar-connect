import * as StellarSdk from '@stellar/stellar-sdk';
import { ACTIVE_STELLAR_NETWORK } from './network';

import type { BalanceInfo } from '../types';

// Get the appropriate Horizon URL based on the active network
const HORIZON_URL =
  ACTIVE_STELLAR_NETWORK === 'MAINNET'
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';

export const server = new StellarSdk.Horizon.Server(HORIZON_URL);

/**
 * Gets all balances (native XLM + trustlines/tokens) for an account.
 * If the account does not exist (is unfunded), returns a default XLM balance of 0.
 */
export async function getStellarBalances(address: string): Promise<{ balances: BalanceInfo[]; exists: boolean }> {
  try {
    const account = await server.loadAccount(address);
    const mapped: BalanceInfo[] = account.balances.map((b) => {
      if (b.asset_type === 'native') {
        return {
          amount: Number(b.balance).toFixed(4),
          symbol: 'XLM',
          isNative: true,
        };
      } else {
        return {
          amount: Number(b.balance).toFixed(4),
          symbol: b.asset_code || 'UNKNOWN',
          code: b.asset_code,
          issuer: b.asset_issuer,
          isNative: false,
        };
      }
    });

    return { balances: mapped, exists: true };
  } catch (error) {
    const err = error as { response?: { status?: number }; name?: string };
    // If account doesn't exist on-chain (unfunded), return 0 XLM without throwing
    if (err?.response?.status === 404 || err?.name === 'NotFoundError') {
      return {
        balances: [{ amount: '0', symbol: 'XLM', isNative: true }],
        exists: false,
      };
    }
    
    // For other errors (e.g. network issues), rethrow or handle accordingly
    console.error('Failed to load Stellar account:', error);
    throw error;
  }
}
