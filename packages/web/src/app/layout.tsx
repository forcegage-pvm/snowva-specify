import type { Metadata } from 'next';

import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Snowva Operations Console',
  description:
    'Core UI for Snowva customer, pricing, sales, and finance workflows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-foreground antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
