
import { Button } from '@/components/ui/button';
import { PlusCircle, DollarSign, Book, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { getEbooks } from '@/lib/data';
import { columns } from './columns';
import { DataTable } from './data-table';
import { createAdminClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

async function getStats() {
  const supabase = createAdminClient();
  const { data: ebooks, error: ebooksError } = await supabase.from('ebooks').select('id, price');
  if (ebooksError) {
    console.error('Error fetching ebooks for stats:', ebooksError);
    return { revenue: 0, sales: 0, productCount: 0 };
  }

  const { data: purchases, error: purchasesError } = await supabase.from('purchases').select('ebook_id');
  if (purchasesError) {
    console.error('Error fetching purchases for stats:', purchasesError);
    return { revenue: 0, sales: 0, productCount: ebooks.length };
  }

  const sales = purchases.length;
  const revenue = purchases.reduce((acc, purchase) => {
    const ebook = ebooks.find(p => p.id === purchase.ebook_id);
    return acc + (ebook?.price || 0);
  }, 0);
  
  const productCount = ebooks.length;

  return { revenue, sales, productCount };
}


export default async function AdminDashboard() {
  const ebooks = await getEbooks();
  const stats = await getStats();
  
  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';
  const formattedRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: paystackCurrency,
  }).format(stats.revenue);

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">An overview of your store's performance.</p>
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

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedRevenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.sales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productCount}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-2xl font-bold tracking-tight mt-8 mb-4">Manage Products</h3>
        <DataTable columns={columns} data={ebooks} />
      </div>
    </div>
  );
}
