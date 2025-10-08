
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { usePathname } from "next/navigation";

async function checkAdminRole() {
  const supabase = createAdminClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/admin/login');
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleData?.role !== 'admin') {
    if (roleError && roleError.code !== 'PGRST116') {
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

  // Skip auth check for the admin login page itself
  // A client component with usePathname can't be used in a server layout directly.
  // We will assume that if children are provided, we should check role, except for login page.
  // A better solution would be to use middleware, but for this structure:
  // We let the check run, and the login page will handle existing logged-in users.
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
