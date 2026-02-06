'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useConnect, useAccount, useDisconnect } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { useEffect, useState } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import { farcasterFrame } from '@farcaster/miniapp-wagmi-connector';
import { base } from 'wagmi/chains';

const queryClient = new QueryClient();

const CONTEXT_TIMEOUT_MS = 2500;

/**
 * Farcaster: call ready() first to hide splash, then auto-connect wallet in background.
 * @see https://miniapps.farcaster.xyz/docs/getting-started#making-your-app-display
 * @see https://miniapps.farcaster.xyz/docs/guides/wallets
 */
function FarcasterSDKInit() {
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected, connector } = useAccount();
  const [hasTried, setHasTried] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (hasTried) return;

      // Call ready() first so splash hides immediately (per Farcaster docs)
      try {
        await sdk.actions.ready();
      } catch (_) {}

      try {
        // Detect Farcaster: sdk.context (dtech) or getEthereumProvider (docs)
        let inFarcaster = false;
        const context = await Promise.race([
          sdk.context,
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), CONTEXT_TIMEOUT_MS)
          ),
        ]).catch(() => null);

        if (context) {
          inFarcaster = true;
        } else {
          const provider = await sdk.wallet.getEthereumProvider().catch(() => undefined);
          if (provider) inFarcaster = true;
        }

        if (inFarcaster) {
          const isFarcasterConnector =
            connector?.type === 'farcasterMiniApp' ||
            connector?.type === 'farcasterFrame';

          if (!isConnected || !isFarcasterConnector) {
            if (isConnected) {
              await disconnectAsync();
            }
            await connectAsync({
              connector: farcasterFrame(),
              chainId: base.id,
            });
          }
        }
      } catch (_) {}
      setHasTried(true);
    };
    init();
  }, [hasTried, isConnected, connector?.type, connectAsync, disconnectAsync]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FarcasterSDKInit />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
