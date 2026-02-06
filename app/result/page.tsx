'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useReadContract, useCapabilities, useSendCalls, useCallsStatus } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { type MoodResult } from '@/lib/mood-engine';
import { parseAbi, encodeFunctionData } from 'viem';
import { base } from 'wagmi/chains';
import { Logo } from '@/components/Logo';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NFTPreview } from '@/components/NFTPreview';
import { PAYMASTER_CONFIG } from '@/lib/paymaster-config';

const MOOD_COLORS: Record<number, { primary: string; secondary: string; name: string }> = {
  0: { primary: '#05d9e8', secondary: '#007aff', name: 'Builder Mode' },
  1: { primary: '#ff2a6d', secondary: '#ff0055', name: 'Degen Mode' },
  2: { primary: '#7700ff', secondary: '#aa00ff', name: 'Collector Mode' },
  3: { primary: '#f9e000', secondary: '#ffaa00', name: 'Bridge Tourist' },
  4: { primary: '#94a3b8', secondary: '#ffffff', name: 'Quiet Mode' },
};

const RARITY_NAMES = ['Common', 'Rare', 'Legendary'];

const RARITY_COLORS: Record<number, { text: string; color: string }> = {
  0: { text: 'COMMON', color: '#94a3b8' },
  1: { text: 'RARE', color: '#05d9e8' },
  2: { text: 'LEGENDARY', color: '#f9e000' },
};

const CONTRACT_ABI = parseAbi([
  'function mint(address to, uint256 weekIndex, uint8 moodId, uint32 tx7d, uint32 swaps7d, uint32 approvals7d, uint8 rarityId, bytes signature) external',
  'function hasMintedWeek(address user, uint256 weekIndex) view returns (bool)',
]);

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return Math.ceil(day / 7).toString().padStart(2, '0');
}

function ResultPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [mintLoading, setMintLoading] = useState(false);
  const [mode, setMode] = useState<'flex' | 'roast'>('flex');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isWriteSuccess } = useWaitForTransactionReceipt({ hash });
  
  // Paymaster capabilities for gasless transactions
  const { data: capabilities } = useCapabilities();
  const { sendCalls, data: callsId, isPending: isCallsPending } = useSendCalls();
  
  // Track sendCalls status for gasless transactions
  // callsId is an object with shape { id: string, capabilities?: ... }
  const callsIdString = typeof callsId === 'string' ? callsId : callsId?.id;
  const { data: callsStatus } = useCallsStatus({
    id: callsIdString as string,
    query: { 
      enabled: !!callsIdString,
      refetchInterval: (data) => {
        // Keep polling until confirmed or failed (lowercase status values)
        if (data.state.data?.status === 'success' || data.state.data?.status === 'failure') {
          return false;
        }
        return 1000; // Poll every second
      },
    },
  });
  
  // Combined success state from either writeContract or sendCalls
  const isCallsSuccess = callsStatus?.status === 'success';
  const isSuccess = isWriteSuccess || isCallsSuccess;
  const isCallsConfirming = !!callsIdString && callsStatus?.status === 'pending';
  
  // Get transaction hash from either method
  const txHash = hash || callsStatus?.receipts?.[0]?.transactionHash;
  
  // Check if wallet supports paymaster (e.g., Coinbase Smart Wallet)
  const paymasterCapability = useMemo(() => {
    if (!capabilities || !capabilities[base.id]) return null;
    const chainCaps = capabilities[base.id];
    if (chainCaps.paymasterService?.supported) {
      return chainCaps.paymasterService;
    }
    return null;
  }, [capabilities]);
  
  // Gasless is only available when wallet supports paymaster AND paymaster URL is configured
  const paymasterUrl = PAYMASTER_CONFIG.url;
  const isGasless = !!paymasterCapability && !!paymasterUrl;
  
  // Network detection
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const isWrongNetwork = chainId !== base.id; // Base mainnet is 8453

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

  // Check if user has already minted this week
  const { data: hasMinted, isLoading: isCheckingMint } = useReadContract({
    address: contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'hasMintedWeek',
    args: address && moodResult ? [address, BigInt(moodResult.weekIndex)] : undefined,
    query: {
      enabled: !!address && !!moodResult && !!contractAddress && !isWrongNetwork,
    },
  });

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'flex' || modeParam === 'roast') {
      setMode(modeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    const fetchMood = async () => {
      try {
        const addr = address || searchParams.get('address');
        if (!addr) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/mood?address=${addr}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch mood: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setMoodResult(data);
      } catch (error: any) {
        console.error('Failed to fetch mood:', error);
        alert(error?.message || 'Failed to analyze wallet. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMood();
  }, [address, isConnected, router, searchParams]);

  const handleMint = async () => {
    if (!moodResult || !address) return;

    setMintLoading(true);
    try {
      // Pre-flight check: verify owner match first
      const debugResponse = await fetch(`/api/debug-owner?address=${address}`);
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        if (!debugData.ownerMatch) {
          throw new Error('Server configuration error: Signer does not match contract owner. Please contact support.');
        }
      }

      const authResponse = await fetch('/api/mint-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          weekIndex: moodResult.weekIndex,
          moodId: moodResult.moodId,
          stats: {
            ...moodResult.stats,
            rarityId: moodResult.rarityId,
          },
        }),
      });

      if (!authResponse.ok) {
        const error = await authResponse.json();
        throw new Error(error.error || 'Failed to get mint authorization');
      }

      const auth = await authResponse.json();
      
      if (!auth.signature) {
        throw new Error('Invalid authorization response');
      }

      const mintArgs = [
        address,
        BigInt(moodResult.weekIndex),
        moodResult.moodId,
        moodResult.stats.tx7d,
        moodResult.stats.swaps7d,
        moodResult.stats.approvals7d,
        moodResult.rarityId,
        auth.signature as `0x${string}`,
      ] as const;

      // Use paymaster ONLY if wallet supports it (e.g., Coinbase Smart Wallet)
      // Regular wallets (MetaMask, OKX) don't support wallet_sendCalls
      const walletSupportsPaymaster = !!paymasterCapability;
      
      if (walletSupportsPaymaster && paymasterUrl) {
        // Only use sendCalls for wallets that support EIP-5792 (like Coinbase Smart Wallet)
        // Capabilities must be keyed by chain ID per EIP-5792/ERC-7677
        const callData = encodeFunctionData({
          abi: CONTRACT_ABI,
          functionName: 'mint',
          args: mintArgs,
        });

        sendCalls({
          calls: [{
            to: contractAddress,
            data: callData,
          }],
          capabilities: {
            [base.id]: {
              paymasterService: {
                url: paymasterUrl,
              },
            },
          },
        });
      } else {
        // Regular transaction (user pays gas) - for wallets that don't support EIP-5792
        writeContract({
          address: contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'mint',
          args: mintArgs,
        });
      }
    } catch (error: any) {
      console.error('Mint failed:', error);
      let errorMessage = error?.message || 'Mint failed. Please try again.';
      
      // Provide more helpful error messages
      if (errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
        errorMessage = 'Transaction cancelled by user.';
      } else if (errorMessage.includes('Already minted')) {
        errorMessage = 'You have already minted this week\'s badge.';
      } else if (errorMessage.includes('Invalid signature')) {
        errorMessage = 'Signature verification failed. Please refresh and try again.';
      } else if (errorMessage.includes('revert') || errorMessage.includes('execution reverted')) {
        errorMessage = 'Transaction failed. Please check that you haven\'t already minted this week.';
      }
      
      alert(errorMessage);
    } finally {
      setMintLoading(false);
    }
  };

  const handleShare = () => {
    if (!moodResult) return;

    const text = `My wallet mood: ${moodResult.moodName}! 🎭\n\n${moodResult.reasons.join('\n')}\n\nCheck yours at ${window.location.origin}`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const getMoodCaption = () => {
    if (!moodResult) return '';
    
    const { moodName, stats, moodId } = moodResult;
    const txCount = stats.tx7d;
    
    // Generate accurate captions based on actual activity
    if (mode === 'flex') {
      if (txCount === 0) {
        return `Flex: ${moodName} - A wallet of mystery. No recent activity detected. The calm before the storm?`;
      } else if (txCount < 5) {
        return `Flex: ${moodName} verified. ${txCount} transactions this week. Quality over quantity.`;
      } else if (txCount < 20) {
        return `Flex: ${moodName} verified. ${txCount} transactions this week. Solid Base activity.`;
      } else if (txCount < 50) {
        return `Flex: ${moodName} verified. ${txCount} transactions this week. Power user detected.`;
      } else {
        return `Flex: ${moodName} verified. ${txCount} transactions this week! Top tier Base activity.`;
      }
    } else {
      // Roast mode
      if (txCount === 0) {
        return `Roast: ${moodName}? More like Ghost Mode. Zero transactions? Even your wallet is on vacation.`;
      } else if (txCount < 5) {
        return `Roast: ${moodName} with only ${txCount} transactions? That's it? Gas is basically free on Base.`;
      } else if (txCount < 20) {
        return `Roast: ${moodName} - ${txCount} transactions is cute. Wake me up when you're serious.`;
      } else {
        return `Roast: ${moodName} with ${txCount} transactions. Okay, maybe you do touch grass... sometimes.`;
      }
    }
  };

  if (loading) {
    return (
      <>
        <div className="noise" />
        <main className="flex min-h-screen items-center justify-center relative z-10">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--neon-blue)] mx-auto"></div>
            <p className="text-[var(--text-muted)]">Analyzing your wallet...</p>
            <p className="text-sm text-[var(--text-muted)] opacity-70">This may take a few seconds</p>
          </div>
        </main>
      </>
    );
  }

  if (!moodResult) {
    return (
      <>
        <div className="noise" />
        <main className="flex min-h-screen items-center justify-center relative z-10">
          <div className="text-center space-y-4">
            <p className="text-red-400">Failed to load mood data</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[var(--grad-main)] rounded-xl font-bold hover:brightness-110 transition"
            >
              Go Back
            </button>
          </div>
        </main>
      </>
    );
  }

  const colors = MOOD_COLORS[moodResult.moodId] || MOOD_COLORS[4];
  const rarity = RARITY_COLORS[moodResult.rarityId] || RARITY_COLORS[0];

  return (
    <>
      <div className="noise" />
      
      <main className="relative z-10 max-w-[1100px] mx-auto px-5 py-8 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/')}>
            <Logo className="w-9 h-9" style={{ filter: 'drop-shadow(0 0 8px rgba(5, 217, 232, 0.5))' }} />
            <div className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Wallet Mood Ring
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode(mode === 'flex' ? 'roast' : 'flex')}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.1)] transition text-white"
            >
              Mode: {mode === 'flex' ? 'Flex' : 'Roast'}
            </button>
            <ConnectButton 
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>

        {/* Wrong Network Banner */}
        {isWrongNetwork && (
          <div className="mb-6 p-4 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-orange-300 font-semibold">Wrong Network Detected</p>
                <p className="text-orange-200/70 text-sm">Please switch to Base network to mint your badge</p>
              </div>
            </div>
            <button
              onClick={() => switchChain({ chainId: base.id })}
              disabled={isSwitching}
              className="px-4 py-2 rounded-lg font-bold text-sm bg-orange-500 hover:bg-orange-400 disabled:opacity-50 transition text-white"
            >
              {isSwitching ? 'Switching...' : 'Switch to Base'}
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          
          {/* Result Card */}
          <section 
            className="relative p-7 rounded-3xl backdrop-blur-[20px] transition-all duration-500"
            style={{
              background: 'rgba(14, 17, 33, 0.6)',
              border: `1px solid ${colors.primary}44`,
              boxShadow: `0 20px 60px -10px ${colors.primary}22`,
            }}
          >
            {/* Neon Top Border */}
            <div 
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.secondary}, transparent)` }}
            />

            <div className="flex justify-between items-center mb-5">
              <small className="tracking-widest text-[#94a3b8] text-[11px] font-bold uppercase">Your Mood</small>
              <div 
                className="w-3 h-3 rounded-full transition-all duration-500"
                style={{
                  background: colors.primary,
                  boxShadow: `0 0 12px ${colors.primary}`,
                }}
              />
            </div>

            <div 
              className="text-[13px] font-bold mb-1"
              style={{ color: colors.primary }}
            >
              WEEK {getWeekNumber()}
            </div>
            
            <h2 className="text-[38px] font-extrabold tracking-tight leading-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              {moodResult.moodName}
            </h2>

            {/* Pills with colored dots */}
            <div className="space-y-2.5 mb-6">
              {moodResult.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-center gap-3.5 p-3 rounded-[14px] bg-white/[0.02] border border-[var(--border)]">
                  <div 
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: idx === 1 ? colors.secondary : colors.primary,
                      boxShadow: `0 0 8px ${idx === 1 ? colors.secondary : colors.primary}`,
                    }}
                  />
                  <span className="text-sm">{reason}</span>
                </div>
              ))}
            </div>

            {/* Rarity */}
            <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-[rgba(255,255,255,0.03)] to-transparent border border-[rgba(255,255,255,0.08)] flex justify-between items-center">
              <small className="uppercase tracking-wider text-xs text-white">Rarity Tier</small>
              <div 
                className="font-black text-lg transition-all"
                style={{ 
                  color: rarity.color,
                  textShadow: `0 0 15px ${rarity.color}66`,
                }}
              >
                {rarity.text}
              </div>
            </div>

            {/* Caption */}
            <div className="text-[13px] text-[#94a3b8] leading-relaxed italic border-l-2 pl-3 mb-6"
              style={{ borderColor: colors.primary + '44' }}
            >
              {getMoodCaption()}
            </div>

            {/* NFT Preview */}
            <div className="mb-6">
              <NFTPreview
                moodId={moodResult.moodId}
                weekIndex={moodResult.weekIndex}
                stats={{
                  tx7d: moodResult.stats.tx7d,
                  swaps7d: moodResult.stats.swaps7d,
                  approvals7d: moodResult.stats.approvals7d,
                }}
                rarityId={moodResult.rarityId}
              />
            </div>

            {/* Gasless indicator */}
            {isGasless && !hasMinted && !isSuccess && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                <span className="text-green-400 text-xs">⚡</span>
                <span className="text-green-400 text-xs font-medium">
                  Gasless with Coinbase Smart Wallet; Base gas is low for others.
                </span>
              </div>
            )}
            {!isGasless && !hasMinted && !isSuccess && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xs text-[#94a3b8]">
                  Gasless requires Coinbase Smart Wallet. Base gas is low for other wallets.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-[1fr_2fr] gap-3">
              <button
                onClick={handleShare}
                className="px-4 py-3 rounded-xl font-bold text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.1)] transition text-white"
              >
                Share
              </button>
              {isWrongNetwork ? (
                <button
                  onClick={() => switchChain({ chainId: base.id })}
                  disabled={isSwitching}
                  className="px-4 py-3 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-white"
                >
                  {isSwitching ? 'Switching...' : 'Switch to Base'}
                </button>
              ) : hasMinted || isSuccess ? (
                <div className="px-4 py-3 rounded-xl font-bold text-sm bg-green-500/20 border border-green-500/50 text-green-400 text-center flex items-center justify-center gap-2">
                  <span>✅</span>
                  <span>Already Minted This Week</span>
                </div>
              ) : (
                <button
                  onClick={handleMint}
                  disabled={mintLoading || isPending || isCallsPending || isConfirming || isCallsConfirming || !contractAddress || isCheckingMint}
                  className="px-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#05d9e8] via-[#7700ff] to-[#ff2a6d] shadow-[0_4px_20px_rgba(119,0,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:translate-y-[-1px] hover:brightness-110 transition-all text-white"
                >
                  {isCheckingMint
                    ? 'Checking...'
                    : mintLoading || isPending || isCallsPending || isConfirming || isCallsConfirming
                    ? 'Minting...'
                    : isGasless
                    ? 'Mint Badge (Free)'
                    : 'Mint Badge'}
                </button>
              )}
            </div>

            {isSuccess && (
              <div className="mt-4 bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                <p className="text-green-400 mb-2">NFT minted successfully! 🎉</p>
                {txHash && (
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 underline text-sm"
                  >
                    View on BaseScan
                  </a>
                )}
              </div>
            )}
          </section>

          {/* Stats Panel */}
          <aside className="space-y-6">
            <div className="p-7 rounded-3xl bg-[rgba(14,17,33,0.6)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[20px]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#94a3b8] mb-4">Activity Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#94a3b8]">Transactions (7d)</span>
                  <span className="font-bold text-white">{moodResult.stats.tx7d}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#94a3b8]">Token Swaps</span>
                  <span className="font-bold text-white">{moodResult.stats.swaps7d}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#94a3b8]">Approvals</span>
                  <span className="font-bold text-white">{moodResult.stats.approvals7d}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#94a3b8]">Unique Contracts</span>
                  <span className="font-bold text-white">{moodResult.stats.uniqueContracts}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[rgba(14,17,33,0.6)] border border-[rgba(255,255,255,0.08)] backdrop-blur-[20px] text-center">
              <p className="text-xs text-[#94a3b8] mb-2">Built on Base</p>
              <p className="text-xs text-[#94a3b8]">Powered by Mini Apps</p>
            </div>
          </aside>

        </div>
      </main>
    </>
  );
}

// Wrap in Suspense for useSearchParams
export default function ResultPageWrapper() {
  return (
    <Suspense fallback={
      <>
        <div className="noise" />
        <main className="flex min-h-screen items-center justify-center relative z-10">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--neon-blue)] mx-auto"></div>
            <p className="text-[var(--text-muted)]">Loading...</p>
          </div>
        </main>
      </>
    }>
      <ResultPage />
    </Suspense>
  );
}
