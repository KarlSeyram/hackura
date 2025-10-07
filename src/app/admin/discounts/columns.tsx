
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Discount } from '@/lib/definitions';
import { DataTableRowActions } from './data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';


function getExpiryInfo(expires_at: string | null): { text: string; isSoon: boolean } {
  if (!expires_at) return { text: 'No expiry', isSoon: false };
  
  const expiryDate = parseISO(expires_at);
  const now = new Date();
  
  if (expiryDate < now) {
    return { text: 'Expired', isSoon: false };
  }

  const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
  const formattedDistance = formatDistanceToNow(expiryDate, { addSuffix: true });
  
  return {
    text: `Expires ${formattedDistance}`,
    isSoon: daysUntilExpiry < 7,
  };
}


export const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => {
        const discount = row.original;
        return (
            <Badge variant="outline" className="font-mono text-base">
                {discount.code}
            </Badge>
        )
    }
  },
   {
    accessorKey: 'discount_percent',
    header: () => <div className="text-right">Discount</div>,
    cell: ({ row }) => {
      const percent = parseInt(row.getValue('discount_percent'), 10);
      return <div className="text-right font-medium">{percent}%</div>;
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
        const isActive = row.getValue('is_active');
        const expiryInfo = getExpiryInfo(row.original.expires_at);
        const hasExpired = expiryInfo.text === 'Expired';
        
        const effectiveStatus = isActive && !hasExpired;

        return (
            <div className="flex items-center gap-2">
                {effectiveStatus ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span>{effectiveStatus ? 'Active' : 'Inactive'}</span>
            </div>
        )
    }
  },
  {
    accessorKey: 'expires_at',
    header: 'Expiry',
    cell: ({ row }) => {
        const expires_at = row.original.expires_at;
        const info = getExpiryInfo(expires_at);

        return (
            <div className={cn('text-sm', info.isSoon && 'text-amber-600 font-medium')}>
                {info.text}
            </div>
        );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
