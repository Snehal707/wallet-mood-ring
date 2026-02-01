# Environment Setup Guide

## ✅ Project Folder
The project folder `wallet-mood-ring` already exists! You don't need to create it.

## 📝 Create .env.local File

You **DO need** to create a `.env.local` file. Here's how:

### Option 1: Manual Creation (Recommended)

1. Navigate to the `wallet-mood-ring` folder
2. Create a new file named `.env.local` (note the `.local` part)
3. Copy and paste this content:

```env
# Base Network Configuration
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=

# Wallet Connect (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=

# Backend Signing Key (for mint authorization)
PRIVATE_KEY=

# BaseScan API (optional, for transaction fetching)
BASESCAN_API_KEY=
```

### Option 2: Using PowerShell

Run this command in the `wallet-mood-ring` folder:

```powershell
@"
# Base Network Configuration
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=

# Backend Signing Key
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE

# BaseScan API (optional)
BASESCAN_API_KEY=
"@ | Out-File -FilePath ".env.local" -Encoding utf8
```

## 🔑 Required Values to Fill

### Minimum Required (to test without minting):

1. **NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID**
   - Go to https://cloud.walletconnect.com
   - Create a new project
   - Copy the Project ID
   - Paste it in `.env.local`

### For Full Functionality:

2. **PRIVATE_KEY** (for mint authorization)
   - Use a wallet private key (NOT your main wallet!)
   - Format: `0x...` (64 hex characters)
   - This will be the contract owner

3. **NEXT_PUBLIC_CONTRACT_ADDRESS** (after deploying contract)
   - Deploy contract first (see below)
   - Copy the deployed address
   - Paste it in `.env.local`

4. **BASESCAN_API_KEY** (optional but recommended)
   - Get from https://basescan.org/apis
   - Improves transaction fetching

## 🚀 Quick Start Steps

1. **Create `.env.local`** (see above)

2. **Get WalletConnect Project ID:**
   ```bash
   # Visit https://cloud.walletconnect.com
   # Create project → Copy Project ID → Paste in .env.local
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Test without contract:**
   - Connect wallet
   - See mood results
   - Share works!

6. **Deploy contract (optional):**
   ```bash
   cd contracts
   npm install
   npm run deploy:sepolia
   # Copy address to .env.local
   ```

## ⚠️ Important Notes

- `.env.local` is in `.gitignore` - it won't be committed
- Never share your `PRIVATE_KEY`
- Use a separate wallet for `PRIVATE_KEY` (not your main wallet)
- The app works without contract for testing mood computation

## 📍 File Location

Your `.env.local` should be here:
```
wallet-mood-ring/
  └── .env.local  ← Create this file
```
