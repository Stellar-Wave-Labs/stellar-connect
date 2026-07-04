export function formatAddress(addr: string | null): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function isValidAddress(addr: string | null): boolean {
  if (!addr) return false;
  // Stellar public keys start with G and are 56 characters long
  return /^G[A-Z2-7]{55}$/.test(addr);
}
