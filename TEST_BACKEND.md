# Test Backend APIs

## Test 1: Check Mood API

Open in your browser or use this command:

**Replace `YOUR_WALLET_ADDRESS` with your actual wallet address:**

```
http://localhost:3000/api/mood?address=YOUR_WALLET_ADDRESS
```

Example:
```
http://localhost:3000/api/mood?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Expected Response:

```json
{
  "moodId": 0,
  "moodName": "Builder Mode",
  "scores": {
    "activity": 50,
    "defi": 30,
    "collector": 20,
    "risk": 40
  },
  "stats": {
    "tx7d": 25,
    "swaps7d": 5,
    "approvals7d": 3,
    "bridges7d": 1,
    "uniqueContracts": 8,
    "nftMints": 2
  },
  "reasons": [
    "25 tx in 7 days",
    "5 swaps",
    "3 approvals"
  ],
  "weekIndex": 2785,
  "rarityId": 1
}
```

## Test 2: Check if Server is Running

Visit:
```
http://localhost:3000
```

You should see your Wallet Mood Ring home page.

## Test 3: Test Mint Authorization (After Contract Deployed)

This is tested automatically when you click "Mint Badge" in the UI.

The flow:
1. Click "Mint Badge" button
2. Frontend calls `/api/mint-auth`
3. Backend signs the request
4. Frontend sends transaction
5. NFT mints!

## 🔍 Check Backend Logs

In the terminal where you ran `npm run dev`, you should see:
- API requests
- Any errors
- Contract interactions

## 🐛 Common Issues

### "Failed to fetch mood"
- Check if wallet address has any transactions on Base
- Add `BASESCAN_API_KEY` to `.env.local` for better results
- New wallets might have empty data

### "Invalid signature"
- Make sure contract was deployed with correct private key
- Check `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`

### "Contract not found"
- Deploy contract first
- Add address to `.env.local`
- Restart dev server

## ✅ Backend Health Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] API responds at `/api/mood`
- [ ] Contract deployed to Base Sepolia
- [ ] Contract address in `.env.local`
- [ ] Private key in both `.env.local` and `contracts/.env`
- [ ] Wallet has Base Sepolia ETH
- [ ] BaseScan API key (optional but recommended)

## 🎯 Full End-to-End Test

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Your mood should appear
4. Click "Mint Badge"
5. Approve transaction in wallet
6. NFT mints successfully!
7. Check your wallet - you should see the Mood Badge NFT!
