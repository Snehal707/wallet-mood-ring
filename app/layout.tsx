import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wallet Mood Ring',
  description: 'Discover your wallet mood based on Base activity',
  openGraph: {
    title: 'Wallet Mood Ring',
    description: 'Discover your wallet mood based on Base activity',
    type: 'website',
  },
  other: {
    'base:app_id': '69873b306dea3c7b8e149e7a',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
