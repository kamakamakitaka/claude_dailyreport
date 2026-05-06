import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Knowledge Hub',
  description: 'コンサル向けナレッジ管理ツール - Daily Feed / Workbench / Decks',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" data-density="cozy">
        {children}
      </body>
    </html>
  );
}
