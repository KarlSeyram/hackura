
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { AdsBanner } from '@/components/layout/ads-banner';
import type { Ad } from '@/lib/definitions';

export function LayoutClient({ children, ads }: { children: React.ReactNode, ads: Ad[] }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminPage && <AdsBanner ads={ads} />}
      {!isAdminPage && <Header />}
      <main className="flex-1">{children}</main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <AdsBanner ads={ads} />}
    </div>
  );
}
