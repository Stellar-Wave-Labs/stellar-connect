const IS_STELLAR = import.meta.env.VITE_CHAIN === 'stellar';

export function formatAddress(addr: string | null): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function isValidAddress(addr: string | null): boolean {
  if (!addr) return false;
  if (IS_STELLAR) {
    // Stellar public keys start with G and are 56 characters long
    return /^G[A-Z2-7]{55}$/.test(addr);
  } else {
    // EVM addresses start with 0x and are 42 characters long
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  }
}
