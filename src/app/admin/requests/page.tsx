
import { columns } from './columns';
import { DataTable } from './data-table';
import { createClient } from '@supabase/supabase-js';
import type { ContactRequest } from '@/lib/definitions';


function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are not set.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}


async function getContactRequests(): Promise<ContactRequest[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching contact requests:', error);
    return [];
  }

  // Map the data to match the ContactRequest type
  const requests: ContactRequest[] = data.map(req => ({
    id: req.id,
    name: req.name,
    email: req.email,
    service: req.service,
    message: req.message,
    submittedAt: new Date(req.submitted_at),
  }));

  return requests;
}


export default async function AdminRequestsPage() {
  const contactRequests = await getContactRequests();
  return (
    <div className="flex-1 space-y-4">
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
