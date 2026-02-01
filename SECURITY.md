# Security Guide - Private Keys

## ⚠️ IMPORTANT: Private Key Usage

### What is PRIVATE_KEY used for?

The `PRIVATE_KEY` in `.env.local` is used by the **backend server** to sign EIP712 messages that authorize NFT mints. This is NOT for your personal wallet connection.

### 🔒 Security Best Practices

#### ✅ DO THIS:

1. **Create a SEPARATE wallet** for the backend signing key
   - This should be a NEW wallet, NOT your main wallet
   - Fund it with minimal ETH (just for gas if needed)
   - This wallet will be the contract owner

2. **Use a dedicated signing wallet:**
   ```bash
   # Generate a new wallet (example)
   # Use MetaMask or any wallet generator
   # Save the private key securely
   ```

3. **Keep it secret:**
   - Never commit `.env.local` to git (it's in `.gitignore`)
   - Never share the private key
   - Use environment variables in production (Vercel, etc.)

4. **Use different keys for different environments:**
   - One key for testnet (Base Sepolia)
   - Different key for mainnet (Base)

#### ❌ DON'T DO THIS:

1. **DON'T use your main wallet's private key**
   - Your main wallet has your funds
   - If compromised, you lose everything

2. **DON'T commit private keys to git**
   - `.env.local` is gitignored for a reason
   - Never push private keys to GitHub

3. **DON'T share private keys**
   - Not in screenshots
   - Not in chat messages
   - Not in documentation

## 📝 Setup Steps

### Step 1: Create a New Wallet

**Option A: Using MetaMask**
1. Create a new account in MetaMask
2. Export the private key (Settings → Security & Privacy → Show Private Key)
3. Copy the private key

**Option B: Using a wallet generator**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Add 0x prefix: 0x + result
```

### Step 2: Fund the Wallet (Minimal Amount)

- For Base Sepolia: Get test ETH from faucet
- For Base Mainnet: Send minimal ETH (just for contract deployment)

### Step 3: Add to .env.local

```env
PRIVATE_KEY=0x1234567890abcdef... # Your NEW wallet's private key
```

### Step 4: Deploy Contract with This Wallet

When you deploy the contract, use this same wallet:
```bash
cd contracts
# Make sure PRIVATE_KEY in contracts/.env matches
npm run deploy:sepolia
```

The contract owner will be this wallet address.

## 🔐 How It Works

1. **User connects their wallet** (their main wallet) → Frontend
2. **User requests mint** → Frontend sends request to `/api/mint-auth`
3. **Backend signs authorization** → Uses `PRIVATE_KEY` to sign EIP712 message
4. **User mints NFT** → Frontend sends transaction with signature
5. **Contract verifies** → Checks signature matches contract owner

## 🛡️ Production Security

### For Vercel Deployment:

1. **Never commit `.env.local`**
   - It's already in `.gitignore`
   - Double-check before pushing

2. **Use Vercel Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add `PRIVATE_KEY` there
   - Mark as "Production" only

3. **Use separate keys:**
   - Testnet key for staging
   - Mainnet key for production

## ⚡ Quick Checklist

- [ ] Created NEW wallet (not main wallet)
- [ ] Saved private key securely
- [ ] Added to `.env.local` (never commit)
- [ ] Deployed contract with this wallet
- [ ] Set up Vercel env vars for production
- [ ] Never shared the key anywhere

## 🆘 If Private Key is Compromised

1. **Immediately:**
   - Remove from `.env.local`
   - Remove from Vercel/env vars
   - Generate new wallet

2. **If contract is deployed:**
   - Consider deploying new contract
   - Or transfer ownership to new wallet

3. **Review:**
   - Check if key was committed to git
   - Check if shared anywhere
   - Rotate all related credentials

## 📚 Additional Resources

- [MetaMask Security](https://support.metamask.io/hc/en-us/articles/360015489591)
- [Ethereum Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
