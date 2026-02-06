import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { computeMood } from '@/lib/mood-engine';
import { fetchBaseTransactions, analyzeTransactions } from '@/lib/activity';

const CONTRACT_ABI = [
  {
    name: 'mint',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'weekIndex', type: 'uint256' },
      { name: 'moodId', type: 'uint8' },
      { name: 'tx7d', type: 'uint32' },
      { name: 'swaps7d', type: 'uint32' },
      { name: 'approvals7d', type: 'uint32' },
      { name: 'rarityId', type: 'uint8' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'hasMintedWeek',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }, { name: 'weekIndex', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'DOMAIN_SEPARATOR',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'owner',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
];

const DOMAIN_BASE = {
  name: 'Wallet Mood Ring',
  version: '1',
  chainId: 8453,
};

const TYPES = {
  MintAuth: [
    { name: 'to', type: 'address' },
    { name: 'weekIndex', type: 'uint256' },
    { name: 'moodId', type: 'uint8' },
    { name: 'tx7d', type: 'uint32' },
    { name: 'swaps7d', type: 'uint32' },
    { name: 'approvals7d', type: 'uint32' },
    { name: 'rarityId', type: 'uint8' },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;

    if (!contractAddress || !privateKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    // Compute mood
    const txs = await fetchBaseTransactions(address);
    const activity = analyzeTransactions(txs, address);
    const moodResult = computeMood(activity);

    // Generate signature
    const wallet = new ethers.Wallet(privateKey);
    const DOMAIN = { ...DOMAIN_BASE, verifyingContract: contractAddress };

    const value = {
      to: address,
      weekIndex: BigInt(moodResult.weekIndex),
      moodId: Number(moodResult.moodId),
      tx7d: Number(moodResult.stats.tx7d),
      swaps7d: Number(moodResult.stats.swaps7d),
      approvals7d: Number(moodResult.stats.approvals7d),
      rarityId: Number(moodResult.rarityId),
    };

    const signature = await wallet.signTypedData(DOMAIN, TYPES, value);

    // Check if already minted
    const client = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org'),
    });

    const hasMinted = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'hasMintedWeek',
      args: [address as `0x${string}`, BigInt(moodResult.weekIndex)],
    });

    // Get contract owner and domain separator for debugging
    const [contractOwner, contractDomainSeparator] = await Promise.all([
      client.readContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'owner',
      }),
      client.readContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'DOMAIN_SEPARATOR',
      }),
    ]);

    // Simulate the transaction
    let simulationResult = null;
    let simulationError = null;
    try {
      await client.simulateContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [
          address as `0x${string}`,
          BigInt(moodResult.weekIndex),
          moodResult.moodId,
          moodResult.stats.tx7d,
          moodResult.stats.swaps7d,
          moodResult.stats.approvals7d,
          moodResult.rarityId,
          signature as `0x${string}`,
        ],
        account: address as `0x${string}`,
      });
      simulationResult = '✅ Transaction would succeed';
    } catch (error: any) {
      simulationError = error.message || 'Unknown error';
      // Try to extract revert reason
      if (error.message?.includes('Already minted this week')) {
        simulationError = '❌ Already minted this week';
      } else if (error.message?.includes('Invalid signature')) {
        simulationError = '❌ Invalid signature - Check that signer matches contract owner';
      } else if (error.message?.includes('Caller must be recipient')) {
        simulationError = '❌ Caller must be recipient';
      } else if (error.message?.includes('Invalid mood') || error.message?.includes('Invalid rarity')) {
        simulationError = `❌ ${error.message}`;
      }
    }

    return NextResponse.json({
      address,
      weekIndex: moodResult.weekIndex,
      moodId: moodResult.moodId,
      stats: moodResult.stats,
      rarityId: moodResult.rarityId,
      hasMintedThisWeek: hasMinted,
      signature: signature.slice(0, 20) + '...',
      signerAddress: wallet.address,
      contractOwner,
      signerMatchesOwner: wallet.address.toLowerCase() === contractOwner.toLowerCase(),
      simulation: simulationResult || simulationError,
      rawError: simulationError ? simulationError.slice(0, 500) : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
