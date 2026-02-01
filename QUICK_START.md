# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies

```bash
cd wallet-mood-ring
npm install
```

### 2. Set Up Environment

Create `.env.local` with minimum required variables:

```env
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # You'll get this after deploying
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
PRIVATE_KEY=0x... # For signing mints
```

**Get WalletConnect Project ID:**
1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy the Project ID

### 3. Deploy Contract (Optional for Testing)

If you want to test minting:

```bash
cd contracts
npm install
npm run deploy:sepolia
```

Copy the contract address to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## ✅ What Works Without Contract

- ✅ Wallet connection
- ✅ Transaction fetching (if BaseScan API key provided)
- ✅ Mood computation
- ✅ Result display
- ✅ Share functionality

## 🔧 What Needs Contract

- ❌ Minting NFTs (requires deployed contract)
- ❌ Full end-to-end flow

## 📝 Next Steps

1. **For Testing Without Contract:**
   - Just connect wallet and see mood results
   - Share functionality works

2. **For Full Testing:**
   - Deploy contract to Base Sepolia
   - Add contract address to `.env.local`
   - Test minting

3. **For Production:**
   - Follow `DEPLOYMENT.md`
   - Set up paymaster for gas sponsorship
   - Configure Farcaster manifest

## 🐛 Troubleshooting

**"Invalid address" error:**
- Make sure wallet is connected
- Check address format

**"Failed to fetch mood":**
- Add BaseScan API key to `.env.local` for better results
- Or transactions might be empty (new wallet)

**Contract not found:**
- Make sure `NEXT_PUBLIC_CONTRACT_ADDRESS` is set
- Verify contract is deployed on correct network
