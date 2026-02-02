import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export async function GET() {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

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

    return NextResponse.json({
      signerAddress,
      contractOwner: owner,
      match,
      message: match 
        ? '✅ Signer matches contract owner' 
        : '❌ MISMATCH! Signer is NOT the contract owner. Update PRIVATE_KEY in Vercel.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
