
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  Inbox,
  Home,
  Tag,
  Users,
  Megaphone,
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
import Image from 'next/image';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/upload', label: 'Upload', icon: UploadCloud },
  { href: '/admin/requests', label: 'Requests', icon: Inbox },
  { href: '/admin/discounts', label: 'Discounts', icon: Tag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/ads', label: 'Ads', icon: Megaphone },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Image src="https://sylhuiocyaznvdhnayjz.supabase.co/storage/v1/object/public/logo/logo.png" alt="Hackura Logo" width={24} height={24} />
          <span className="font-headline text-lg font-bold">Hackura</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {adminNavItems.map(item => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.label}
                  >
                    <Icon />
                    <span>{item.label}</span>
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
              <SidebarMenuButton tooltip="Back to Site">
                <Home />
                <span>Back to Site</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
