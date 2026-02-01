'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

const queryClient = new QueryClient();

// Initialize Farcaster SDK and signal ready
function FarcasterSDKInit() {
  useEffect(() => {
    const init = async () => {
      try {
        // Signal to Farcaster that the app is ready
        await sdk.actions.ready();
        console.log('Farcaster SDK ready');
      } catch (error) {
        // Not running in Farcaster context, ignore
        console.log('Not in Farcaster context');
      }
    };
    init();
  }, []);

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
