import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { getEbooks } from '@/lib/data';
import { columns } from './columns';
import { DataTable } from './data-table';
import { createAdminClient } from '@/lib/supabase/server';

async function getProducts() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('ebooks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  // The data from supabase has image_url, but our Ebook type expects imageUrl.
  // We need to map the data to match the Ebook type.
  const ebooks = data.map(ebook => ({
    id: ebook.id,
    title: ebook.title,
    description: ebook.description, 
    price: ebook.price,
    imageUrl: ebook.image_url,
    imageHint: '', 
    category: ebook.category || 'General',
  }));

  return ebooks;
}


export default async function AdminDashboard() {
  const ebooks = await getProducts();
  return (
    <div className="flex-1 space-y-4">
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
