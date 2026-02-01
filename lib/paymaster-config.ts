/**
 * Coinbase Paymaster Configuration
 * 
 * To enable gasless minting:
 * 1. Sign up at https://cdp.coinbase.com
 * 2. Create a project and enable Paymaster for Base mainnet
 * 3. Create a sponsorship policy for your contract
 * 4. Add these environment variables:
 *    - NEXT_PUBLIC_PAYMASTER_URL
 *    - NEXT_PUBLIC_CDP_API_KEY (optional, for some integrations)
 */

export const PAYMASTER_CONFIG = {
  url: process.env.NEXT_PUBLIC_PAYMASTER_URL || '',
  isEnabled: !!process.env.NEXT_PUBLIC_PAYMASTER_URL,
};

export function isPaymasterEnabled(): boolean {
  return PAYMASTER_CONFIG.isEnabled;
}
