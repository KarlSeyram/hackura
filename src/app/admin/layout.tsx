
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthError, PostgrestError } from "@supabase/supabase-js";

async function checkAdminRole() {
  const supabase = createAdminClient();
  let user, error: AuthError | null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
    error = data.error;
  } catch (e: any) {
    user = null;
    error = e;
  }

  if (error || !user) {
    redirect('/');
  }

  try {
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      redirect('/');
    }
  } catch(e) {
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
