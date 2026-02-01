# Deploy Contract Now

## Step 1: Add Your Private Key

Open `contracts/.env` and add your private key after `PRIVATE_KEY=0x`

It should look like:
```
PRIVATE_KEY=0x1234567890abcdef... (your full private key)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

## Step 2: Make Sure You Have Base Sepolia ETH

Get test ETH from:
- https://faucet.quicknode.com/base/sepolia
- Or https://www.alchemy.com/faucets/base-sepolia

You need about 0.01 ETH for deployment.

## Step 3: Deploy Contract

Run this command from the contracts folder:

```bash
npm run deploy:sepolia
```

Or from the main folder:

```bash
cd contracts
npm run deploy:sepolia
```

## Step 4: Copy Contract Address

After deployment, you'll see something like:
```
MoodBadge deployed to: 0x1234567890abcdef1234567890abcdef12345678
```

Copy that address!

## Step 5: Update Frontend

Open the main `.env.local` file and add:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

## Step 6: Restart Dev Server

Stop the current server (Ctrl+C) and restart:
```bash
npm run dev
```

## ✅ Test It!

1. Connect your wallet
2. View your mood
3. Click "Mint Badge"
4. The NFT should mint successfully!

## 🎉 Success Indicators

- Contract deployed ✅
- Address in `.env.local` ✅
- Dev server running ✅
- Wallet connected ✅
- Mint button works ✅
