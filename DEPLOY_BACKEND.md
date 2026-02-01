# Backend Deployment Guide

## ✅ What's Done
- ✅ Contract dependencies installed
- ✅ Private key configured

## 🚀 Deploy Smart Contract

### Step 1: Deploy to Base Sepolia (Testnet)

Run this command:

```bash
cd contracts
npm run deploy:sepolia
```

This will:
- Deploy the MoodBadge ERC721 contract
- Show you the contract address
- You'll need this address for the frontend

### Step 2: Update Frontend Config

After deployment, copy the contract address and add it to `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Paste the deployed address here
```

### Step 3: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

## 🧪 Test the Backend APIs

### Test Mood API

Open in browser or use curl:
```
http://localhost:3000/api/mood?address=0xYourWalletAddress
```

Should return:
```json
{
  "moodId": 0,
  "moodName": "Builder Mode",
  "scores": {...},
  "stats": {...},
  "reasons": [...],
  "weekIndex": 2785,
  "rarityId": 0
}
```

### Test Mint Authorization

The `/api/mint-auth` endpoint works automatically when you click "Mint Badge" button.

## 🔧 Backend Components

### 1. API Routes (`app/api/`)
- ✅ `/api/mood` - Analyzes wallet activity
- ✅ `/api/mint-auth` - Signs EIP712 for authorized mints

### 2. Smart Contract (`contracts/MoodBadge.sol`)
- ✅ ERC721 NFT contract
- ✅ Onchain SVG generation
- ✅ Weekly mint limit
- ✅ Signature verification

### 3. Mood Engine (`lib/mood-engine.ts`)
- ✅ Computes activity scores
- ✅ Determines mood (Builder, Degen, etc.)
- ✅ Calculates rarity

## 📊 How It Works

1. **User connects wallet** → Frontend
2. **Frontend calls `/api/mood`** → Backend fetches Base transactions
3. **Backend analyzes activity** → Returns mood data
4. **User clicks "Mint Badge"** → Frontend requests authorization
5. **Backend signs mint request** → `/api/mint-auth` returns signature
6. **Frontend sends transaction** → Smart contract verifies signature
7. **NFT minted** → User owns Mood Badge!

## 🔐 Security Notes

- Private key is only used in backend API routes (server-side)
- EIP712 signatures prevent unauthorized mints
- Weekly limit enforced onchain
- Contract owner is the wallet with your private key

## 🎯 Next Steps

1. **Deploy Contract:**
   ```bash
   cd contracts
   npm run deploy:sepolia
   ```

2. **Copy Contract Address** to `.env.local`

3. **Test Full Flow:**
   - Connect wallet
   - View mood
   - Mint badge (gas sponsored if paymaster configured)

4. **Optional: Get BaseScan API Key**
   - Visit https://basescan.org/apis
   - Create account
   - Get API key
   - Add to `.env.local`:
     ```env
     BASESCAN_API_KEY=your_api_key
     ```
   - Improves transaction fetching

## 🚨 Troubleshooting

**"Insufficient funds" error:**
- Make sure wallet has Base Sepolia ETH
- Get from faucet: https://faucet.quicknode.com/base/sepolia

**"Invalid signature" error:**
- Ensure contract was deployed with same private key
- Check contract address in `.env.local`

**"Already minted this week":**
- Users can only mint once per week
- Wait for next week or use different wallet

## 🎉 Production Deployment

When ready for mainnet:

1. Deploy to Base mainnet:
   ```bash
   npm run deploy:mainnet
   ```

2. Update `.env.local`:
   ```env
   NEXT_PUBLIC_NETWORK=mainnet
   NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Mainnet address
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard
