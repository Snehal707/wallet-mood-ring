# Base Featured Checklist - Remaining Steps

For [Base Featured placement](https://docs.base.org/mini-apps/featured-guidelines/overview). Most items are done; complete these remaining steps.

## 1. Transaction Sponsorship (Required)

**Requirement:** "Transactions are sponsored"

Set `NEXT_PUBLIC_PAYMASTER_URL` in Vercel:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add `NEXT_PUBLIC_PAYMASTER_URL` with your paymaster URL
3. Redeploy

**Options:**
- **Base Paymaster:** [docs](https://docs.base.org/onchainkit/paymaster/quickstart-guide), claim credits at [base.dev](https://base.dev)
- **Coinbase Paymaster:** [CDP](https://cdp.coinbase.com)

## 2. Asset Verification

- **Icon** (`public/icon.png`): 1024×1024 px, PNG, no transparency
- **Cover** (`public/og-image.png`): 1200×630 px, no Base logo or team photos

Resize or replace if needed.

## 3. Load Time Test

- App loads within 3 seconds
- In-app actions complete within 1 second

Test at https://wallet-mood-ring.vercel.app and https://base.app/app/https://wallet-mood-ring.vercel.app

## 4. Validation and Submission

1. Validate manifest: [base.dev/preview](https://base.dev/preview) — enter `wallet-mood-ring.vercel.app`
2. Test in Base app and Warpcast
3. Submit: [submission form](https://docs.google.com/forms/d/e/1FAIpQLSeZiB3fmMS7oxBKrWsoaew2LFxGpktnAtPAmJaNZv5TOCXIZg/viewform)
