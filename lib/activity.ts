import { type WalletActivity } from '@/lib/mood-engine';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  input: string;
  timeStamp: string;
}

// Common DEX/router addresses on Base
const DEX_ROUTERS = [
  '0x2626664c2603336E57B271c5C0b26F421741e481', // Uniswap V3 Router
  '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24', // Uniswap V2 Router
  '0x7087e08107dF932A7b3C3e1A4e8C25c3c1c8B5D1', // Aerodrome Router
  '0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891', // BaseSwap Router
  '0x327Df1E6de05895d2ab08513aaDD9313fe505d86', // SwapRouter02
];

// Common NFT marketplace addresses on Base
const NFT_MARKETPLACES = [
  '0x00000000000000adc04c56bf30ac9d3c0aaf14dc', // OpenSea Seaport
  '0x00000000000001ad428e4906ae43d8f9852d0dd6', // OpenSea Seaport 1.1
  '0x74312363e45dcb76b5c1a7fa813cfcdf319575c1', // Zora
  '0x6170b3c3a54e3d9f3d7b2b0c4e8c8b8e8e8e8e', // Other marketplaces
];

// Common bridge addresses on Base
const BRIDGES = [
  '0x4200000000000000000000000000000000000010', // Base Bridge
  '0x3154Cf16ccdb4C6b922751f92d1Bd6b9E8F4C8bD', // Stargate Bridge
  '0x4c2F7092C2aE51D986bEFEa37848013006134268', // Hop Bridge
];

// Lending protocol addresses
const LENDING_PROTOCOLS = [
  '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // Aave
  '0x4e4c42b8dC1936fEB9b4f0B5B3C4C8F8b8b8b8b8', // Compound
];

// Common approval function signature
const APPROVE_SIG = '0x095ea7b3';

// NFT mint signatures
const MINT_SIGS = ['0x1249c58b', '0x40c10f19', '0xa0712d68'];

async function fetchFromBlockscout(address: string, sevenDaysAgo: number): Promise<Transaction[]> {
  const url = `https://base.blockscout.com/api?module=account&action=txlist&address=${address}&sort=desc`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return [];

  const data = await response.json();
  if (data.status === '1' && data.result) {
    return data.result.filter((tx: Transaction) => parseInt(tx.timeStamp) >= sevenDaysAgo);
  }
  return [];
}

async function fetchFromBaseScan(address: string, sevenDaysAgo: number): Promise<Transaction[]> {
  const apiKey = process.env.BASESCAN_API_KEY;
  const hasKey = apiKey && apiKey !== 'YourApiKeyToken' && apiKey.length > 10;
  const url = hasKey
    ? `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
    : `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return [];

  const data = await response.json();
  if (data.status === '1' && data.result) {
    return data.result.filter((tx: Transaction) => parseInt(tx.timeStamp) >= sevenDaysAgo);
  }
  return [];
}

export async function fetchBaseTransactions(address: string): Promise<Transaction[]> {
  const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
  const sources = [
    { name: 'Blockscout', fn: () => fetchFromBlockscout(address, sevenDaysAgo) },
    { name: 'BaseScan', fn: () => fetchFromBaseScan(address, sevenDaysAgo) },
  ];

  for (const source of sources) {
    try {
      const txs = await source.fn();
      if (txs.length > 0) {
        return txs;
      }
    } catch {
      // Try next source on failure
    }
  }

  return [];
}

export function analyzeTransactions(txs: Transaction[], _address: string): WalletActivity {
  const activeDays = new Set<string>();
  let swaps = 0;
  let approvals = 0;
  let nftMints = 0;
  let marketplaceInteractions = 0;
  let bridgeCount = 0;
  const uniqueContracts = new Set<string>();
  let lendingInteractions = 0;
  let lpInteractions = 0;

  txs.forEach((tx) => {
    const date = new Date(parseInt(tx.timeStamp) * 1000).toDateString();
    activeDays.add(date);

    if (tx.to) {
      const toLower = tx.to.toLowerCase();
      uniqueContracts.add(toLower);

      if (DEX_ROUTERS.includes(toLower)) {
        swaps++;
        if (tx.input.length > 138) {
          lpInteractions++;
        }
      }

      if (NFT_MARKETPLACES.includes(toLower)) {
        marketplaceInteractions++;
      }

      if (BRIDGES.includes(toLower)) {
        bridgeCount++;
      }

      if (LENDING_PROTOCOLS.includes(toLower)) {
        lendingInteractions++;
      }
    }

    if (tx.input.startsWith(APPROVE_SIG)) {
      approvals++;
    }

    if (tx.value === '0' && tx.input.length > 10 && tx.to) {
      const funcSig = tx.input.slice(0, 10);
      if (MINT_SIGS.includes(funcSig.toLowerCase())) {
        nftMints++;
      }
    }
  });

  return {
    txCount: txs.length,
    activeDays: activeDays.size,
    swaps,
    approvals,
    nftMints: Math.min(nftMints, marketplaceInteractions + 5),
    marketplaceInteractions,
    bridgeCount,
    uniqueContracts: uniqueContracts.size,
    lendingInteractions,
    lpInteractions,
  };
}
