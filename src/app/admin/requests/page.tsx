import { contactRequests } from '@/lib/data';
import { columns } from './columns';
import { DataTable } from './data-table';

export default function AdminRequestsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="font-headline text-3xl font-bold tracking-tight">Contact Requests</h2>
          <p className="text-muted-foreground">View messages submitted through the contact form.</p>
        </div>
      </div>
      <DataTable columns={columns} data={contactRequests} />
    </div>
  );
}
