# Fix Private Key Issue

## ❌ Problem
Your private key in `contracts/.env` is too short or incorrectly formatted.

## ✅ Solution

### Step 1: Get Your Full Private Key

From MetaMask or your wallet:
1. Open MetaMask
2. Click the three dots menu
3. Account Details → Show Private Key
4. Enter your password
5. Copy the FULL private key (should be 64 hex characters)

### Step 2: Format Correctly

Your private key should look like this:
```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

- Starts with `0x`
- Followed by exactly 64 hexadecimal characters (0-9, a-f)
- Total length: 66 characters

### Step 3: Update contracts/.env

Open `contracts/.env` and make sure it looks like this:

```env
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

**Replace the example key with your actual private key!**

### Step 4: Verify Format

Your `.env` file should have:
- No spaces around the `=` sign
- No quotes around the private key
- No extra lines or characters
- The key starts with `0x`
- Exactly 64 hex characters after `0x`

### Common Mistakes

❌ **Wrong:**
```env
PRIVATE_KEY = 0x123...  # Spaces around =
PRIVATE_KEY="0x123..."  # Quotes
PRIVATE_KEY=123...      # Missing 0x
PRIVATE_KEY=0x123       # Too short
```

✅ **Correct:**
```env
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Step 5: Try Deploying Again

```bash
npm run deploy:sepolia
```

## 🔒 Security Reminder

- Never share your private key
- Never commit `.env` files to git
- Use a separate wallet for testing
- Keep your main wallet safe
