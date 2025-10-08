
'use client';

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createBrowserClient } from "@/lib/supabase/client";
import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useFirebase } from "@/firebase/provider";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading } = useFirebase();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // If on the login page, do nothing.
    if (pathname === '/admin/login') {
        setIsAdmin(true); // Allow rendering of login page
        return;
    }
    
    // If user state is still loading, wait.
    if (isLoading) {
      return;
    }

    // If no user is logged in, redirect to login.
    if (!user) {
      redirect('/admin/login');
      return;
    }
    
    // If user is logged in, check their role.
    const checkRole = async () => {
        const supabase = createBrowserClient();
        const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.uid)
            .single();

        if (roleData?.role === 'admin') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    };
    checkRole();

  }, [user, isLoading, pathname]);

  // Redirect non-admins away from admin pages.
  useEffect(() => {
    if (isAdmin === false) {
      redirect('/');
    }
  }, [isAdmin]);

  // Show a loading state while we verify the user's role.
  if (isLoading || isAdmin === null) {
      // Don't show loading screen for the login page itself
      if (pathname === '/admin/login') {
          return <main className="flex-1 bg-muted/40">{children}</main>;
      }
      return (
          <div className="flex h-screen w-full items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  // If on login page and already logged in as admin, redirect to dashboard
  if (pathname === '/admin/login' && isAdmin) {
      redirect('/admin/dashboard');
  }

  // Render the admin layout for authenticated admins.
  return (
    <SidebarProvider>
      <Sidebar>
        <AdminSidebar />
      </Sidebar>
      <SidebarInset>
        <header className="p-4 md:p-8 flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h1 className="font-headline text-2xl font-bold">Admin</h1>
        </header>
        <main className="flex-1 bg-muted/40 p-4 md:p-8 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
