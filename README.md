# 🧩 StellarConnect (formerly BaseConnect)

A modern, lightweight dApp that enables seamless wallet connection. Originally built for the Base blockchain, this application is currently undergoing a migration to the Stellar network.

Built with React, TypeScript, and beautiful animations.

![Stellar](https://img.shields.io/badge/Stellar-000000?style=for-the-badge&logo=stellar&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

🔗 **Wallet Connection**: Connect your wallet seamlessly.
💼 **Address Display**: Show connected wallet address in a clean, shortened format.
💰 **Balance Display**: Real-time balance updates.
🌐 **Network Info**: Display current network.
🔒 **Secure Disconnect**: Safe wallet disconnection.
🎨 **Smooth Animations**: Beautiful transitions powered by Framer Motion & GSAP.
📱 **Mobile Optimized**: Perfect for mobile wallet connections.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- A compatible crypto wallet

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd stellar-connect

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🛠️ Architecture (Migration in Progress)

The codebase has been refactored to abstract the underlying blockchain logic behind a generic `ChainProvider` interface. This allows the application to cleanly swap out the current EVM/Base provider with a new Stellar provider in the upcoming migration phases, without affecting the UI components.

### Core Framework
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool

### UI & Animations
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - React animation library
- **GSAP** - Professional-grade animations
- **Lottie React** - Complex vector animations

## 🎨 Animation Features

- **Wallet Connection**: Smooth loading states and success animations
- **Balance Display**: Number counting animations
- **Network Switching**: Color-coded transitions
- **Loading States**: Elegant skeleton screens
- **Micro-interactions**: Hover effects and button animations

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
