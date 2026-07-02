# Phase 0: EVM to Stellar Migration Audit

## Inventory of EVM/WalletConnect References

| File Path | What it does | What it'll need to be replaced by in Phase 1 |
| --- | --- | --- |
| `src/components/Hero.tsx` | UI for connecting wallet. Imports `useAccount`, `useChainId`, `useConnect`, `useDisconnect` from `wagmi`. Also imports `walletConnectService` directly. Hardcodes 'Base Mainnet' strings and chain IDs. | Replace all `wagmi` and `walletConnectService` imports with the new `useWallet()` hook. The connect/disconnect logic will call `connect()` and `disconnect()` from the hook, and display `networkLabel`. |
| `src/components/WalletInfo.tsx` | UI for displaying wallet details (address, balance, network, recent txs). Imports `useAccount`, `useBalance`, `useChainId`, `useGasPrice` from `wagmi`. Imports `formatEther`, `formatGwei` from `viem`. Hardcodes Base chain IDs, Basescan RPC URLs. | Replace `wagmi` hooks and `viem` formatters with `useWallet()` hook which will expose `{ address, balance, networkLabel, isConnected }`. |
| `src/config/wagmiConfig.ts` | Defines EVM chains (Base, Base Sepolia), Alchemy RPC transports, and injected connectors (Coinbase, injected, WalletConnect). | Logic will be encapsulated within or managed by the new `EvmProvider` which implements `ChainProvider`. Components will no longer import this. |
| `src/providers/Web3Provider.tsx` | Wraps the application in Wagmi's `WagmiConfig` and React Query's `QueryClientProvider`. | Will stay to provide EVM capabilities, but will likely sit alongside or under a new `WalletContext` that exposes the `ChainProvider` interface. |
| `src/services/walletConnectService.ts` | Interfaces directly with `@walletconnect/core`, `@walletconnect/ethereum-provider`, `@walletconnect/web3wallet`. | Will be moved into or wrapped by `src/chain/evm/provider.ts` (`EvmProvider`), making WalletConnect an implementation detail of the EVM chain provider. |

## Assumptions Confirmation

- **State management is local React state/context (not Redux/Zustand)**: **CONFIRMED**. The app uses local React `useState`/`useEffect` along with React Context (provided by Wagmi and QueryClient). There is no global state manager like Redux or Zustand.
- **There are no smart contract calls yet — this is read-only**: **CONFIRMED**. The application only fetches account status, balance, gas price, and recent transactions via the Basescan API. There are no `writeContract` or transaction sending functionalities.
- **VITE_ALCHEMY_API_KEY is optional with a public RPC fallback**: **CONFIRMED**. In `src/config/wagmiConfig.ts`, the app checks for `import.meta.env.VITE_ALCHEMY_API_KEY` but falls back to public RPC URLs (e.g., `https://mainnet.base.org`).
