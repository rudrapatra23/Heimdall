import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import { ToastProvider } from '@/components/ui/Toast';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Sery — Autonomous AI Chief of Staff',
  description: 'Sery executes real-world business operations for the top 1% of founders and technical leaders — autonomously, with full authority and audit trails.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
  openGraph: {
    title: 'Sery — Autonomous AI Chief of Staff',
    description: 'Not for everyone. Built for operators who execute at lightspeed.',
    images: [{ url: '/assets/app_logo.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} dark`}>
      <body className={plusJakartaSans.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
       </body>
    </html>
  );
}