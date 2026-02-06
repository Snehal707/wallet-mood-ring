# 🔄 Transfer Contract Ownership

## Current Situation

- **Contract Address**: `0x613AaBFB890632AE2939FA6aEb065a692D4D7A32`
- **Current Owner** (compromised): `0x84e029a92EA865B6C22925Ae068D41e3132A378a`
- **New Owner** (secure): `0x79FD75a3fC633259aDD60885f927d973d3A3642b`

## ⚠️ Important Security Warning

The old wallet (`0x84e029a92EA865B6C22925Ae068D41e3132A378a`) is compromised. You need to:

1. **Quickly transfer ownership** before someone else does
2. **Never use the old wallet again** after transfer
3. **Update Vercel PRIVATE_KEY** to the new wallet's key

## Step-by-Step Transfer

### Option 1: Using Hardhat Script (Recommended)

1. **Add to `contracts/.env`** (temporarily):
   ```env
   OLD_PRIVATE_KEY=0x... # The compromised wallet's private key
   NEW_OWNER_ADDRESS=0x79FD75a3fC633259aDD60885f927d973d3A3642b
   CONTRACT_ADDRESS=0x613AaBFB890632AE2939FA6aEb065a692D4D7A32
   ```

2. **Run the transfer script**:
   ```bash
   cd contracts
   npx hardhat run scripts/transfer-ownership.ts --network base
   ```

3. **Verify the transfer**:
   - Visit: `https://wallet-mood-ring.vercel.app/api/check-config`
   - Should show: `ownerMatch: true`

4. **Remove OLD_PRIVATE_KEY** from `.env` immediately after transfer

### Option 2: Using BaseScan (Web Interface)

1. Go to: https://basescan.org/address/0x613AaBFB890632AE2939FA6aEb065a692D4D7A32#writeContract
2. Connect with the old wallet (`0x84e029a92EA865B6C22925Ae068D41e3132A378a`)
3. Find `transferOwnership` function
4. Enter new owner: `0x79FD75a3fC633259aDD60885f927d973d3A3642b`
5. Click "Write" and confirm transaction

### Option 3: Using MetaMask/Wallet

1. Connect the old wallet to MetaMask
2. Go to BaseScan contract page
3. Use the "Write Contract" tab
4. Call `transferOwnership(0x79FD75a3fC633259aDD60885f927d973d3A3642b)`

## After Transfer

1. ✅ **Update Vercel PRIVATE_KEY** to the new wallet's private key
2. ✅ **Verify**: `https://wallet-mood-ring.vercel.app/api/check-config`
3. ✅ **Test minting** to confirm everything works
4. ✅ **Never use the old wallet again**

## Verification

After transfer, check:
```
https://wallet-mood-ring.vercel.app/api/check-config
```

Should return:
```json
{
  "contractOwner": "0x79FD75a3fC633259aDD60885f927d973d3A3642b",
  "signerAddress": "0x79FD75a3fC633259aDD60885f927d973d3A3642b",
  "ownerMatch": true,
  "status": "✅ CONFIGURED CORRECTLY"
}
```
