'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UploadCloud, Inbox, Home } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/upload', label: 'Upload', icon: UploadCloud },
  { href: '/admin/requests', label: 'Requests', icon: Inbox },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-col border-r bg-background p-4">
      <div className="flex items-center gap-2 pb-4 border-b mb-4">
         <Logo />
        <h1 className="font-headline text-xl font-semibold">CyberShelf</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {adminNavItems.map(item => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2">
         <div className="my-4 h-px w-full bg-border" />
         <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Home className="h-4 w-4" />
            Back to Site
          </Link>
      </div>
    </aside>
  );
}
