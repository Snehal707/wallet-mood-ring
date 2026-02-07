'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const isHome = pathname === '/';
  const isResult = pathname?.startsWith('/result');

  const goToHome = () => router.push('/');
  const goToResult = () => {
    if (isConnected && address) {
      router.push(`/result?address=${address}`);
    } else {
      router.push('/');
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--color-bg-surface)]/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      <div className="flex items-center justify-around max-w-[500px] mx-auto py-2">
        <button
          onClick={goToHome}
          className="flex flex-col items-center gap-1 min-h-[44px] min-w-[60px] justify-center px-4 py-2 rounded-xl transition"
          style={{
            color: isHome ? 'var(--neon-blue)' : 'var(--text-muted)',
            backgroundColor: isHome ? 'rgba(5, 217, 232, 0.1)' : 'transparent',
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={goToResult}
          className="flex flex-col items-center gap-1 min-h-[44px] min-w-[60px] justify-center px-4 py-2 rounded-xl transition"
          style={{
            color: isResult ? 'var(--neon-purple)' : 'var(--text-muted)',
            backgroundColor: isResult ? 'rgba(119, 0, 255, 0.1)' : 'transparent',
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-xs font-medium">My Mood</span>
        </button>
      </div>
    </nav>
  );
}
