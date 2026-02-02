import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export async function GET(request: NextRequest) {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const userAddress = request.nextUrl.searchParams.get('address');

    if (!privateKey) {
      return NextResponse.json({ error: 'PRIVATE_KEY not set' });
    }
    if (!contractAddress) {
      return NextResponse.json({ error: 'CONTRACT_ADDRESS not set' });
    }

    // Get signer address from private key
    const wallet = new ethers.Wallet(privateKey);
    const signerAddress = wallet.address;

    // Get contract owner
    const client = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org'),
    });

    const owner = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: [{ name: 'owner', type: 'function', inputs: [], outputs: [{ type: 'address' }] }],
      functionName: 'owner',
    });

    const match = signerAddress.toLowerCase() === (owner as string).toLowerCase();

    // Calculate current week index
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekIndex = Math.ceil(diff / oneWeek);

    let hasMinted = null;
    if (userAddress) {
      hasMinted = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: [{ name: 'hasMintedWeek', type: 'function', inputs: [{ type: 'address' }, { type: 'uint256' }], outputs: [{ type: 'bool' }] }],
        functionName: 'hasMintedWeek',
        args: [userAddress as `0x${string}`, BigInt(weekIndex)],
      });
    }

    return NextResponse.json({
      signerAddress,
      contractOwner: owner,
      contractAddress,
      ownerMatch: match,
      currentWeekIndex: weekIndex,
      userAddress: userAddress || 'not provided (add ?address=0x...)',
      hasMintedThisWeek: hasMinted,
      message: match 
        ? '✅ Signer matches contract owner' 
        : '❌ MISMATCH! Update PRIVATE_KEY in Vercel.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}

export const dynamic = 'force-dynamic';
