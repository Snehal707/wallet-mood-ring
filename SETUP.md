# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and fill in the values.

3. **Deploy the contract:**
   ```bash
   cd contracts
   npm install
   npm run deploy:sepolia
   ```
   Copy the contract address to your `.env.local`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Base MiniKit Integration

This app uses RainbowKit for wallet connection, which works with Base Mini Apps. To enable full Mini App functionality:

1. **Add MiniKit to your app:**
   The app is already configured with RainbowKit which supports Base Mini Apps.

2. **Test in Base App:**
   - Deploy to a public URL (Vercel)
   - Open Base App
   - Navigate to Mini Apps section
   - Your app should appear if manifest is configured

3. **Farcaster Integration:**
   - Update `public/.well-known/farcaster.json` with your domain
   - Sign the manifest (see Base docs)
   - Add account association

## Environment Variables Explained

- `NEXT_PUBLIC_BASE_RPC_URL`: Base RPC endpoint (Sepolia or Mainnet)
- `NEXT_PUBLIC_NETWORK`: Either "sepolia" or "mainnet"
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Deployed MoodBadge contract address
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Get from https://cloud.walletconnect.com
- `PRIVATE_KEY`: Private key for signing mint authorizations (NOT the deployer key)
- `BASESCAN_API_KEY`: Optional, for better transaction fetching
- `NEXT_PUBLIC_PAYMASTER_URL`: Paymaster endpoint for gas sponsorship
- `NEXT_PUBLIC_PAYMASTER_POLICY_ID`: Paymaster policy ID

## Paymaster Setup

For gasless transactions, you need a paymaster:

1. **Coinbase Paymaster (Recommended):**
   - Sign up at https://cdp.coinbase.com
   - Create a paymaster policy
   - Add URL and policy ID to env vars

2. **Custom Paymaster:**
   - Follow Base docs: https://docs.base.org/base-account/improve-ux/sponsor-gas/paymasters
   - Implement paymaster contract
   - Configure in your app

## Testing Checklist

- [ ] Wallet connects successfully
- [ ] Mood computation works (shows result)
- [ ] Mint authorization API works
- [ ] Mint transaction succeeds (with or without paymaster)
- [ ] NFT appears in wallet
- [ ] NFT metadata renders correctly
- [ ] Share functionality works
- [ ] Farcaster manifest is accessible

## Common Issues

**"Invalid signature" error:**
- Check PRIVATE_KEY matches the contract owner
- Verify contract address is correct
- Ensure chainId matches in mint-auth API

**Mint fails:**
- Check contract has correct owner set
- Verify weekIndex calculation matches
- Ensure user hasn't already minted this week

**Paymaster not working:**
- Verify paymaster URL is correct
- Check paymaster has funds
- Review Base paymaster documentation
