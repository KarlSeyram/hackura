
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/use-cart';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Chatbot } from '@/components/chatbot/chatbot';
import { LayoutClient } from './layout-client';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Hackura',
  description: 'Your one-stop shop for tech and cybersecurity ebooks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'></path></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/*
          1. Sign up at Newor Media and get your site approved.
          2. They will provide a script to place in the <head> of your site.
          3. Paste that script here, replacing this comment block.
          
          Example of what the script might look like:
          <script async src="https://ad.newormedia.com/newor.min.js" data-site-id="YOUR_SITE_ID"></script>
        */}
      </head>
      <body className="font-body antialiased">
        <CartProvider>
          <LayoutClient>
            {children}
          </LayoutClient>
          <Toaster />
          <Chatbot />
        </CartProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
