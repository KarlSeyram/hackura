import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
