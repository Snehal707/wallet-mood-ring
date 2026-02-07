import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import { BottomNav } from '@/components/BottomNav';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('wallet-mood-ring-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t||(d?'dark':'light');document.documentElement.setAttribute('data-theme',r==='light'?'light':'')})();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <ErrorBoundary>
            <Providers>
              <div className="pb-20">{children}</div>
              <BottomNav />
            </Providers>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
