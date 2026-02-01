import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { computeMood } from '@/lib/mood-engine';
import { fetchBaseTransactions, analyzeTransactions } from '@/lib/activity';

// EIP712 Domain for mint authorization
const DOMAIN_BASE = {
  name: 'Wallet Mood Ring',
  version: '1',
  chainId: 8453, // Base mainnet
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

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const DOMAIN = {
      ...DOMAIN_BASE,
      verifyingContract: contractAddress,
    };

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const txs = await fetchBaseTransactions(address);
    const activity = analyzeTransactions(txs, address);
    const moodResult = computeMood(activity);

    const wallet = new ethers.Wallet(privateKey);

    const value = {
      to: address,
      weekIndex: BigInt(moodResult.weekIndex),
      moodId: Number(moodResult.moodId),
      tx7d: Number(moodResult.stats.tx7d),
      swaps7d: Number(moodResult.stats.swaps7d),
      approvals7d: Number(moodResult.stats.approvals7d),
      rarityId: Number(moodResult.rarityId),
    };

    // Sign typed data
    const signature = await wallet.signTypedData(DOMAIN, TYPES, value);

    // Convert BigInt to string for JSON serialization
    return NextResponse.json({
      signature,
      domain: DOMAIN,
      types: TYPES,
      value: {
        ...value,
        weekIndex: value.weekIndex.toString(),
      },
    });
  } catch (error) {
    console.error('Error in /api/mint-auth:', error);
    return NextResponse.json(
      { error: 'Failed to generate mint authorization' },
      { status: 500 }
    );
  }
}
