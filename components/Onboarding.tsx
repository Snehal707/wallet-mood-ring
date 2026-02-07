'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'wallet-mood-ring-onboarding-seen';

const SCREENS = [
  {
    title: 'Discover Your Wallet Mood',
    description: 'We analyze your Base activity to reveal your onchain personality.',
    icon: '🔮',
  },
  {
    title: 'Connect & View',
    description: 'Connect your wallet to see your mood. No signing required—we only read public data.',
    icon: '👛',
  },
  {
    title: 'Mint Weekly Badges',
    description: 'Mint a Mood Badge NFT each week. Sponsored transactions when supported.',
    icon: '✨',
  },
];

export function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setVisible(true);
    } catch (_) {
      setVisible(false);
    }
  }, []);

  const handleNext = () => {
    if (screen < SCREENS.length - 1) {
      setScreen(screen + 1);
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (_) {}
      setVisible(false);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (_) {}
    setVisible(false);
  };

  if (!visible) return null;

  const current = SCREENS[screen];
  const isLast = screen === SCREENS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="max-w-sm w-full p-6 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--border)] shadow-xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">{current.icon}</div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">
            {current.title}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {current.description}
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          {SCREENS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{
                backgroundColor: i <= screen ? 'var(--neon-blue)' : 'var(--color-border)',
              }}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 min-h-[44px] px-4 py-3 rounded-xl font-medium text-sm text-[var(--color-text-muted)] border border-[var(--border)] hover:bg-[var(--glass-hover)] transition"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 min-h-[44px] px-4 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#05d9e8] via-[#7700ff] to-[#ff2a6d] hover:brightness-110 transition"
          >
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
