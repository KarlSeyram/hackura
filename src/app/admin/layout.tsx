
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarHeader,
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

  if (roleError || roleData?.role !== 'admin') {
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
