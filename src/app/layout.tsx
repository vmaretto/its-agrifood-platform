import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ITS AgriFood Academy',
  description: 'Piattaforma di learning interattiva per il corso AgrifoodTech - ITS Eat Agrifuture Firenze',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
