'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/miniapp-sdk';

const CONTEXT_TIMEOUT_MS = 2000;

export type UserContext = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};

/**
 * Fetches user from Farcaster/Base SDK context when embedded.
 * Returns null when standalone or context unavailable.
 */
export function useUserContext(): UserContext | null {
  const [user, setUser] = useState<UserContext | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchContext = async () => {
      try {
        const context = await Promise.race([
          sdk.context,
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), CONTEXT_TIMEOUT_MS)
          ),
        ]).catch(() => null);

        if (cancelled || !context?.user) return;

        const u = context.user as UserContext;
        if (u?.fid) {
          setUser(u);
        }
      } catch (_) {
        // Ignore
      }
    };

    fetchContext();
    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
