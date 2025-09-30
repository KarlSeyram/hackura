
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Ebook } from '@/lib/definitions';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableRowActions } from './data-table-row-actions';
import Image from 'next/image';

const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'USD';

export const columns: ColumnDef<Ebook>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
        const product = row.original;
        return (
            <div className="flex items-center gap-4">
                <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded-sm">
                    <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <span className="font-medium truncate max-w-xs">{product.title}</span>
            </div>
        )
    }
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: paystackCurrency,
      }).format(price);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
