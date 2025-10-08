
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function checkAdminRole() {
  const supabase = createAdminClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  // If there was an error fetching the role, or the role is not 'admin', redirect.
  // This is the key change: a roleError should not automatically cause a redirect if the user might still be an admin.
  // The correct logic is to redirect only if we can confirm they are NOT an admin.
  if (roleData?.role !== 'admin') {
    if (roleError && roleError.code !== 'PGRST116') {
        // PGRST116 means "exact one row not found", which is expected for non-admins.
        // Log other errors but still redirect.
        console.error("Error fetching user role:", roleError);
    }
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
        <header className="p-4 md:p-8 flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h1 className="font-headline text-2xl font-bold">Admin</h1>
        </header>
        <main className="flex-1 bg-muted/40 p-4 md:p-8 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
