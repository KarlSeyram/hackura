
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function checkAdminRole() {
  const supabase = createAdminClient();
  
  // Correctly destructure the response from getUser()
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Check for the admin role in the user_roles table
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || roleData?.role !== 'admin') {
    // If user has no admin role, redirect them away from admin pages.
    redirect('/');
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdminRole();

  return (
    <SidebarProvider>
      <Sidebar>
        <AdminSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 bg-muted/40 p-4 pt-16 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
