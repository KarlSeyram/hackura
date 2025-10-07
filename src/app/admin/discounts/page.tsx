
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { columns } from './columns';
import { DataTable } from './data-table';
import { createAdminClient } from '@/lib/supabase/server';
import type { Discount } from '@/lib/definitions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DiscountForm } from './discount-form';

async function getDiscounts(): Promise<Discount[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('discounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }

  return data.map(d => ({
    id: d.id,
    code: d.code,
    discount_percent: d.discount_percent,
    is_active: d.is_active,
    expires_at: d.expires_at,
    created_at: d.created_at,
  }));
}

export default async function AdminDiscountsPage() {
  const discounts = await getDiscounts();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="font-headline text-3xl font-bold tracking-tight">Manage Discounts</h2>
          <p className="text-muted-foreground">Create and manage promo codes for your store.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Discount
            </Button>
          </DialogTrigger>
          <DialogContent>
             <DialogHeader>
              <DialogTitle>Create New Discount</DialogTitle>
              <DialogDescription>
                Fill out the details below to create a new promo code.
              </DialogDescription>
            </DialogHeader>
            <DiscountForm />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={discounts} />
    </div>
  );
}
