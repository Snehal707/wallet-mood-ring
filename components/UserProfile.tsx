'use client';

import { useUserContext } from '@/hooks/useUserContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';

/**
 * User profile display for Base Featured Checklist: avatar + username, no 0x addresses.
 * Uses sdk.context when embedded in Farcaster/Base; falls back to avatar-only or "Connected".
 */
export function UserProfile() {
  const userContext = useUserContext();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-[#05d9e8] via-[#7700ff] to-[#ff2a6d] text-white hover:brightness-110 transition"
            >
              Connect Wallet
            </button>
          );
        }

        // Connected: show avatar + username when context available, else "Connected"
        const displayName =
          userContext?.displayName || userContext?.username || 'Connected';

        return (
          <button
            onClick={openAccountModal}
            className="flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-xl border border-[var(--border)] transition hover:opacity-90"
            style={{ backgroundColor: 'var(--color-glass)' }}
          >
            {userContext?.pfpUrl ? (
              <img
                src={userContext.pfpUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--neon-purple)] flex items-center justify-center text-white text-xs font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium truncate max-w-[100px]" style={{ color: 'var(--color-text)' }}>
              {displayName}
            </span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
