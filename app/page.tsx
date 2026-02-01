'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';

export default function Home() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mode, setMode] = useState<'flex' | 'roast'>('flex');

  useEffect(() => {
    if (isConnected && address) {
      router.push(`/result?address=${address}&mode=${mode}`);
    }
  }, [isConnected, address, router, mode]);

  return (
    <>
      <div className="noise" />
      
      <main className="relative z-10 max-w-[1100px] mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Logo className="w-9 h-9" style={{ filter: 'drop-shadow(0 0 8px rgba(5, 217, 232, 0.5))' }} />
            <div className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Wallet Mood Ring
            </div>
          </div>
          <ConnectButton 
            accountStatus="address"
            chainStatus="icon"
            showBalance={false}
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          
          {/* Hero Section */}
          <section className="relative float p-9 rounded-3xl bg-gradient-to-br from-white/[0.03] to-black/20 border border-[var(--border)] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Neon Top Border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--neon-pink)] via-[var(--neon-purple)] to-transparent" />
            
            <h1 className="text-[52px] leading-none font-black tracking-tight mb-4">
              Wallet <span className="bg-gradient-to-r from-[#05d9e8] via-[#7700ff] to-[#ff2a6d] bg-clip-text text-transparent">Mood Ring</span>
            </h1>
            
            <p className="text-[#94a3b8] text-[17px] leading-relaxed max-w-[460px] mb-6">
              Your onchain activity reveals your soul. Discover your wallet personality from Base activity, then mint a weekly Mood Badge.
            </p>

            {/* Trust Cards */}
            <div className="grid grid-cols-2 gap-3 mb-7">
              <div className="p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.2)]">
                <h4 className="text-sm font-semibold mb-1 text-white">Read-Only Analysis</h4>
                <p className="text-xs text-[#94a3b8]">We only read public data. No signing required to view.</p>
              </div>
              <div className="p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.2)]">
                <h4 className="text-sm font-semibold mb-1 text-white">Gasless Minting</h4>
                <p className="text-xs text-[#94a3b8]">Sponsored via Paymaster. 0 ETH cost to you.</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mb-6">
              <ConnectButton.Custom>
                {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  return (
                    <button
                      onClick={connected ? openAccountModal : openConnectModal}
                      className="px-6 py-3.5 rounded-xl font-bold text-[15px] text-white bg-gradient-to-r from-[#05d9e8] via-[#7700ff] to-[#ff2a6d] shadow-[0_4px_20px_rgba(119,0,255,0.4)] transition-all hover:translate-y-[-2px] hover:brightness-110"
                    >
                      {connected 
                        ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` 
                        : 'Connect Wallet'}
                    </button>
                  );
                }}
              </ConnectButton.Custom>
              
              <button
                onClick={() => setMode(mode === 'flex' ? 'roast' : 'flex')}
                className="px-6 py-3.5 rounded-xl font-bold text-[15px] text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] transition-all hover:bg-[rgba(255,255,255,0.1)]"
              >
                Mode: {mode === 'flex' ? 'Flex' : 'Roast'}
              </button>
            </div>

            {/* Features Grid - Below CTA */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-[var(--glass)] p-3 rounded-xl border border-[var(--border)]">
                <div className="text-[13px] font-semibold mb-1 text-white">Feed Ready</div>
                <div className="text-[11px] text-[var(--text-muted)]">Perfect ratio for social sharing.</div>
              </div>
              <div className="bg-[var(--glass)] p-3 rounded-xl border border-[var(--border)]">
                <div className="text-[13px] font-semibold mb-1 text-white">Weekly</div>
                <div className="text-[11px] text-[var(--text-muted)]">New mood & badge every week.</div>
              </div>
              <div className="bg-[var(--glass)] p-3 rounded-xl border border-[var(--border)]">
                <div className="text-[13px] font-semibold mb-1 text-white">Base Native</div>
                <div className="text-[11px] text-[var(--text-muted)]">Fast, cheap, and onchain.</div>
              </div>
            </div>
          </section>

          {/* Preview Panel */}
          <aside>
            <div className="relative p-7 rounded-3xl bg-[rgba(14,17,33,0.6)] border border-[var(--border)] backdrop-blur-[20px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)]">
              <div className="flex justify-between items-center mb-5">
                <small className="tracking-widest text-[#94a3b8] text-[11px] font-bold uppercase">Live Preview</small>
                <div className="w-3 h-3 rounded-full bg-[#333] shadow-[inset_0_0_4px_rgba(0,0,0,0.5)]" />
              </div>

              <div className="text-[13px] text-[#05d9e8] font-bold mb-1">WEEK 05</div>
              <h2 className="text-[38px] font-extrabold tracking-tight leading-tight mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                Waiting for wallet...
              </h2>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-3.5 p-3 rounded-[14px] bg-white/[0.02] border border-[var(--border)]">
                  <div className="w-2 h-2 rounded-full bg-[#444]" />
                  <span className="text-sm">-- Transactions</span>
                </div>
                <div className="flex items-center gap-3.5 p-3 rounded-[14px] bg-white/[0.02] border border-[var(--border)]">
                  <div className="w-2 h-2 rounded-full bg-[#444]" />
                  <span className="text-sm">-- Token Swaps</span>
                </div>
                <div className="flex items-center gap-3.5 p-3 rounded-[14px] bg-white/[0.02] border border-[var(--border)]">
                  <div className="w-2 h-2 rounded-full bg-[#444]" />
                  <span className="text-sm">-- Contract Approvals</span>
                </div>
              </div>

              <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-[rgba(255,255,255,0.03)] to-transparent border border-[rgba(255,255,255,0.08)] flex justify-between items-center">
                <small className="uppercase tracking-wider text-xs text-white">Rarity Tier</small>
                <div className="font-black text-lg text-[#94a3b8]">???</div>
              </div>

              <div className="text-[13px] text-[#94a3b8] leading-relaxed italic border-l-2 border-[rgba(255,255,255,0.08)] pl-3">
                Connect to reveal if you're a Builder, Degen, or Ghost.
              </div>
            </div>
          </aside>

        </div>
      </main>
    </>
  );
}
