
import { Button } from '@/components/ui/button';
import { PlusCircle, DollarSign, Book, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { getEbooks } from '@/lib/data';
import { columns } from './columns';
import { DataTable } from './data-table';
import { createClient } from '@supabase/supabase-js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { subDays, format } from 'date-fns';
import { SalesChart } from '@/components/admin/sales-chart';


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


async function getStats() {
  const supabase = createAdminClient();
  const sevenDaysAgo = subDays(new Date(), 7).toISOString();

  // Fetch ebooks and purchases in parallel
  const [ebooksRes, purchasesRes] = await Promise.all([
    supabase.from('ebooks').select('id, price, is_disabled'),
    supabase.from('purchases').select('ebook_id, created_at').gte('created_at', sevenDaysAgo)
  ]);
  
  if (ebooksRes.error) {
    console.error('Error fetching ebooks for stats:', ebooksRes.error);
    return { revenue: 0, sales: 0, productCount: 0, salesData: [] };
  }
   if (purchasesRes.error) {
    console.error('Error fetching purchases for stats:', purchasesRes.error);
    return { revenue: 0, sales: 0, productCount: 0, salesData: [] };
  }

  const ebooks = ebooksRes.data;
  const purchases = purchasesRes.data;

  const sales = purchases.length;
  
  const productCount = ebooks.filter(e => !e.is_disabled).length;
  
  // Initialize daily sales data for the last 7 days
  const salesData: { date: string, revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      salesData.push({
          date: format(date, 'MMM d'),
          revenue: 0,
      });
  }

  // Calculate total revenue and populate daily sales
  const totalRevenue = purchases.reduce((acc, purchase) => {
    const ebook = ebooks.find(p => p.id === purchase.ebook_id);
    const price = ebook?.price || 0;
    
    const purchaseDateStr = format(new Date(purchase.created_at), 'MMM d');
    const dayData = salesData.find(d => d.date === purchaseDateStr);
    if(dayData) {
        dayData.revenue += price;
    }

    return acc + price;
  }, 0);

  return { revenue: totalRevenue, sales, productCount, salesData };
}


export default async function AdminDashboard() {
  const ebooks = await getEbooks({ includeDisabled: true });
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
            <CardTitle className="text-sm font-medium">Total Revenue (7d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedRevenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales (7d)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.sales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productCount}</div>
          </CardContent>
        </Card>
      </div>

       <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardContent className="pl-2 pt-6">
            <SalesChart data={stats.salesData} />
          </CardContent>
        </CardHeader>
      </Card>

      <div>
        <h3 className="text-2xl font-bold tracking-tight mt-8 mb-4">Manage Products</h3>
        <DataTable columns={columns} data={ebooks} />
      </div>
    </div>
  );
}
