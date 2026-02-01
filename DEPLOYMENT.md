# Deployment Guide

## Prerequisites

1. Node.js 18+
2. A Base Sepolia wallet with test ETH
3. A Vercel account (free tier works)
4. WalletConnect Project ID (get from https://cloud.walletconnect.com)

## Step 1: Install Dependencies

```bash
cd wallet-mood-ring
npm install
```

## Step 2: Deploy Smart Contract

### Install Hardhat dependencies

```bash
cd contracts
npm install
```

### Configure environment

Create `contracts/.env`:
```env
PRIVATE_KEY=
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

### Deploy to Base Sepolia

```bash
npm run deploy:sepolia
```

Save the contract address - you'll need it for the frontend.

## Step 3: Configure Frontend

Create `wallet-mood-ring/.env.local`:

```env
# Base Network
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # From step 2

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Backend Signing (use a different private key than deployer)
PRIVATE_KEY=0x... # For signing mint authorizations

# Optional: BaseScan API for better transaction fetching
BASESCAN_API_KEY=YourApiKeyToken

# Optional: Paymaster for gas sponsorship
NEXT_PUBLIC_PAYMASTER_URL=https://...
NEXT_PUBLIC_PAYMASTER_POLICY_ID=...
```

## Step 4: Set Up Farcaster Manifest

1. Deploy to Vercel first (see Step 5)
2. Update `public/.well-known/farcaster.json` with your domain
3. Sign the manifest using the Base docs: https://docs.base.org/mini-apps/technical-guides/sign-manifest
4. Add your Farcaster account association

## Step 5: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel dashboard.

### Set Environment Variables in Vercel

Go to your project settings → Environment Variables and add all variables from `.env.local`.

## Step 6: Configure Paymaster (Optional but Recommended)

### Option A: Coinbase Paymaster

1. Sign up at https://cdp.coinbase.com
2. Create a paymaster policy
3. Add the URL and policy ID to your environment variables

### Option B: Custom Paymaster

Follow Base docs: https://docs.base.org/base-account/improve-ux/sponsor-gas/paymasters

## Step 7: Test

1. Visit your deployed app
2. Connect wallet
3. Check mood computation
4. Test mint (should be gas sponsored if paymaster is configured)

## Step 8: Deploy to Mainnet

1. Deploy contract to Base mainnet:
   ```bash
   npm run deploy:mainnet
   ```

2. Update environment variables:
   ```env
   NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
   NEXT_PUBLIC_NETWORK=mainnet
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Mainnet address
   ```

3. Redeploy to Vercel

## Troubleshooting

### Contract deployment fails
- Ensure you have enough ETH on Base Sepolia
- Check RPC URL is correct
- Verify private key format (0x prefix)

### Mint fails
- Check contract address is correct
- Verify PRIVATE_KEY is set in environment
- Ensure signature verification matches contract

### Paymaster not working
- Verify paymaster URL and policy ID
- Check paymaster has sufficient funds
- Review Base paymaster documentation
