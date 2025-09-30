
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  Inbox,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/upload', label: 'Upload', icon: UploadCloud },
  { href: '/admin/requests', label: 'Requests', icon: Inbox },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className="h-6 w-6 text-primary"><path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20'/></svg>
          <span className="font-headline text-lg font-bold">CyberShelf</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {adminNavItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={isActive}
                    icon={<item.icon />}
                    tooltip={item.label}
                  >
                    {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" legacyBehavior passHref>
              <SidebarMenuButton icon={<Home />} tooltip="Back to Site">
                Back to Site
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
