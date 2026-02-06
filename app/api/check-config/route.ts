import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export async function GET(request: NextRequest) {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!privateKey) {
      return NextResponse.json({ 
        error: 'PRIVATE_KEY not set in Vercel',
        contractAddress: contractAddress || 'NOT SET',
      });
    }

    if (!contractAddress) {
      return NextResponse.json({ 
        error: 'NEXT_PUBLIC_CONTRACT_ADDRESS not set in Vercel',
        signerAddress: new ethers.Wallet(privateKey).address,
      });
    }

    // Get signer address from private key
    const wallet = new ethers.Wallet(privateKey);
    const signerAddress = wallet.address;

    // Get contract owner
    const client = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org'),
    });

    let contractOwner = null;
    let ownerMatch = false;
    let error = null;

    try {
      contractOwner = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi: [{ name: 'owner', type: 'function', inputs: [], outputs: [{ type: 'address' }] }],
        functionName: 'owner',
      }) as string;

      ownerMatch = signerAddress.toLowerCase() === contractOwner.toLowerCase();
    } catch (e: any) {
      error = e.message;
    }

    return NextResponse.json({
      // Contract Configuration
      contractAddress: contractAddress,
      contractOwner: contractOwner,
      
      // Signer Configuration
      signerAddress: signerAddress,
      signerPublicKey: wallet.publicKey, // This is the public key, not the address
      
      // Verification
      ownerMatch: ownerMatch,
      error: error,
      
      // Status
      status: ownerMatch 
        ? '✅ CONFIGURED CORRECTLY - Signer matches contract owner' 
        : error
        ? `❌ ERROR: ${error}`
        : '❌ MISMATCH - Signer does not match contract owner. Update PRIVATE_KEY in Vercel.',
      
      // Instructions
      instructions: {
        ifMismatch: 'If ownerMatch is false, update PRIVATE_KEY in Vercel to match the contract owner wallet.',
        contractAddress: 'This is the contract address being used for all mint operations.',
        signerAddress: 'This is the wallet address derived from PRIVATE_KEY in Vercel.',
        contractOwner: 'This is the actual owner of the contract on-chain.',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'NOT SET',
    });
  }
}

export const dynamic = 'force-dynamic';
