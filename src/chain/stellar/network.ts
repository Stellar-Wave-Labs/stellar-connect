export const STELLAR_NETWORK_PASSPHRASES = {
  MAINNET: 'Public Global Stellar Network ; September 2015',
  TESTNET: 'Test SDF Network ; September 2015',
} as const;

export type StellarNetwork = keyof typeof STELLAR_NETWORK_PASSPHRASES;

export function getNetworkLabel(passphrase: string): string {
  switch (passphrase) {
    case STELLAR_NETWORK_PASSPHRASES.MAINNET:
      return 'Stellar Mainnet';
    case STELLAR_NETWORK_PASSPHRASES.TESTNET:
      return 'Stellar Testnet';
    default:
      return 'Unknown Stellar Network';
  }
}

// Config driven network configuration
export const ACTIVE_STELLAR_NETWORK = (import.meta.env.VITE_STELLAR_NETWORK === 'mainnet' ? 'MAINNET' : 'TESTNET') as StellarNetwork;
export const ACTIVE_STELLAR_PASSPHRASE = STELLAR_NETWORK_PASSPHRASES[ACTIVE_STELLAR_NETWORK];
