import { type WalletActivity } from '@/lib/mood-engine';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  input: string;
  timeStamp: string;
}

// Common DEX/router addresses on Base (lowercase for comparison)
const DEX_ROUTERS = [
  // Uniswap
  '0x2626664c2603336e57b271c5c0b26f421741e481', // Uniswap V3 Router
  '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24', // Uniswap V2 Router
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', // Uniswap Universal Router
  '0x327df1e6de05895d2ab08513aadd9313fe505d86', // SwapRouter02
  '0x198ef79f1f515f02dfe9e3115ed9fc07183f02fc', // Uniswap X
  
  // Aerodrome (Base native DEX)
  '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43', // Aerodrome Router
  '0x6cb442acf35158d5eda88fe602221b67b400be3e', // Aerodrome Router V2
  
  // Other Base DEXs
  '0x6bded42c6da8fbf0d2ba55b2fa120c5e0c8d7891', // BaseSwap Router
  '0x1b8128c3a1b7d20053d10763ff02466ca7ff99fc', // SushiSwap Router
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', // SushiSwap
  
  // Aggregators - Coinbase
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0x Exchange Proxy (Coinbase uses this)
  '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae', // LI.FI Diamond
  '0x6352a56caadc4f1e25cd6c75970fa768a3304e64', // OpenOcean Exchange
  
  // 1inch
  '0x1111111254eeb25477b68fb85ed929f73a960582', // 1inch v5 Router
  '0x111111125421ca6dc452d289314280a0f8842a65', // 1inch v6 Router
  
  // ParaSwap
  '0xdef171fe48cf0115b1d80b88dc8eab59176fee57', // ParaSwap V5
  
  // Kyber
  '0x6131b5fae19ea4f9d964eac0408e4408b66337b5', // KyberSwap Router
  
  // Odos
  '0x19ceead7105607cd444f5ad10dd51356436095a1', // Odos Router V2
  
  // Socket/Bungee
  '0x3a23f943181408eac424116af7b7790c94cb97a5', // Socket Gateway
];

// Swap function signatures (to detect swaps even on unknown aggregators)
const SWAP_SIGNATURES = [
  '0x38ed1739', // swapExactTokensForTokens
  '0x8803dbee', // swapTokensForExactTokens
  '0x7ff36ab5', // swapExactETHForTokens
  '0x4a25d94a', // swapTokensForExactETH
  '0x18cbafe5', // swapExactTokensForETH
  '0xfb3bdb41', // swapETHForExactTokens
  '0x5c11d795', // swapExactTokensForTokensSupportingFeeOnTransferTokens
  '0xb6f9de95', // swapExactETHForTokensSupportingFeeOnTransferTokens
  '0x791ac947', // swapExactTokensForETHSupportingFeeOnTransferTokens
  '0x04e45aaf', // exactInputSingle (Uniswap V3)
  '0xb858183f', // exactInput (Uniswap V3)
  '0x5023b4df', // exactOutputSingle (Uniswap V3)
  '0x09b81346', // exactOutput (Uniswap V3)
  '0x472b43f3', // swapExactTokensForTokens (Universal Router)
  '0x42712a67', // swapTokensForExactTokens (Universal Router)
  '0xd9627aa4', // sellToUniswap (0x)
  '0x415565b0', // transformERC20 (0x)
  '0x2e95b6c8', // unoswap (1inch)
  '0xe449022e', // uniswapV3Swap (1inch)
  '0x12aa3caf', // swap (1inch AggregationRouterV5)
  '0x0502b1c5', // clipperSwap (1inch)
  '0x83800a8e', // swapOnAerodromeV2 (Aerodrome)
  '0x6678ec1f', // swapNoSplit (Odos)
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

      // Check if it's a swap - by contract OR by function signature
      const funcSig = tx.input.slice(0, 10).toLowerCase();
      const isSwapByContract = DEX_ROUTERS.includes(toLower);
      const isSwapBySignature = SWAP_SIGNATURES.includes(funcSig);
      
      if (isSwapByContract || isSwapBySignature) {
        swaps++;
        // LP interactions have longer calldata
        if (tx.input.length > 500) {
          lpInteractions++;
        }
      }

      if (NFT_MARKETPLACES.map(a => a.toLowerCase()).includes(toLower)) {
        marketplaceInteractions++;
      }

      if (BRIDGES.map(a => a.toLowerCase()).includes(toLower)) {
        bridgeCount++;
      }

      if (LENDING_PROTOCOLS.map(a => a.toLowerCase()).includes(toLower)) {
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
