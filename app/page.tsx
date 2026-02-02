import type { Metadata } from 'next';
import HomeClient from './home-client';

const APP_URL = 'https://wallet-mood-ring.vercel.app';

// Farcaster Mini App embed JSON (must be stringified in meta tag)
const miniAppEmbed = {
  version: '1',
  name: 'Wallet Mood Ring',
  imageUrl: `${APP_URL}/og-image.svg`,
  button: {
    title: 'Check Your Wallet Mood',
    action: {
      type: 'launch_miniapp',
      url: APP_URL,
    },
  },
};

export const metadata: Metadata = {
  title: 'Wallet Mood Ring',
  description: 'Discover your wallet mood based on Base activity',
  openGraph: {
    title: 'Wallet Mood Ring',
    description: 'Discover your wallet mood based on Base activity',
    type: 'website',
    url: APP_URL,
    images: [
      {
        url: `${APP_URL}/og-image.svg`,
      },
    ],
  },
  other: {
    // Mini App embed (new format)
    'fc:miniapp': JSON.stringify(miniAppEmbed),
    // Backwards compatibility
    'fc:frame': JSON.stringify(miniAppEmbed),
  },
};

export default function HomePage() {
  return <HomeClient />;
}
