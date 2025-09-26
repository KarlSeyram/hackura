import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ebooks } from '@/lib/data';
import { columns } from './columns';
import { DataTable } from './data-table';

export default function AdminDashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="font-headline text-3xl font-bold tracking-tight">Product Dashboard</h2>
            <p className="text-muted-foreground">Manage your ebooks here.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/admin/upload">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New
            </Link>
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={ebooks} />
    </div>
  );
}
