# Wallet Mood Ring V2 - Base Mini App

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF)](https://base.org)

A Base Mini App that reads a connected wallet's recent Base activity, assigns a mood label plus 3 reasons, then lets the user mint a weekly Mood Badge NFT with gas sponsored mint.

**Created by [@Snehal707](https://github.com/Snehal707)** | [Twitter/X: @Snehalrekt](https://x.com/Snehalrekt)

## Features

- 🔗 Wallet connection via Base MiniKit
- 📊 Analyzes last 7 days of Base activity
- 🎭 Computes mood: Builder Mode, Degen Mode, Collector Mode, Bridge Tourist, Quiet Mode
- 🎨 Beautiful share-friendly result cards
- 🪙 Mint weekly Mood Badge NFT (gas sponsored)
- ✅ Backend signature authorization for mints
- 📱 Works in Base App and Farcaster clients

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Web3**: Base MiniKit, Wagmi, Viem
- **Backend**: Next.js API Routes
- **Smart Contract**: Solidity (ERC721) on Base
- **Gas Sponsorship**: Base Account Paymasters

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Base Sepolia testnet ETH (for testing)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x... # For signing mint authorizations
NEXT_PUBLIC_PAYMASTER_URL=https://...
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

Deploy to Vercel:

```bash
vercel
```

Make sure to set environment variables in Vercel dashboard.

## Project Structure

```
wallet-mood-ring/
├── app/
│   ├── page.tsx          # Home page
│   ├── result/
│   │   └── page.tsx       # Result page with mood display
│   ├── api/
│   │   ├── mood/
│   │   │   └── route.ts   # Mood computation API
│   │   └── mint-auth/
│   │       └── route.ts   # Mint authorization API
│   └── layout.tsx
├── contracts/
│   └── MoodBadge.sol     # ERC721 contract
├── lib/
│   ├── wagmi.ts          # Wagmi config
│   ├── mood-engine.ts    # Mood computation logic
│   └── paymaster.ts      # Paymaster utilities
└── public/
    └── .well-known/
        └── farcaster.json # Farcaster manifest
```

## Smart Contract

- **Network:** Base Mainnet
- **Contract Address:** `0x613AaBFB890632AE2939FA6aEb065a692D4D7A32`
- **View on BaseScan:** [MoodBadge Contract](https://basescan.org/address/0x613AaBFB890632AE2939FA6aEb065a692D4D7A32)

## Author

**Snehal707**
- GitHub: [@Snehal707](https://github.com/Snehal707)
- Twitter/X: [@Snehalrekt](https://x.com/Snehalrekt)
- Telegram: [@Snehal_7](https://t.me/Snehal_7)

## License

MIT License - Copyright (c) 2026 Snehal707

See [LICENSE](LICENSE) for details.
