
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ContactRequest } from '@/lib/definitions';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

export const columns: ColumnDef<ContactRequest>[] = [
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
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
    {
    accessorKey: 'service',
    header: 'Service',
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => {
        const message = row.original.message;
        return <p className="truncate max-w-sm">{message}</p>
    }
  },
  {
    accessorKey: 'submittedAt',
    header: () => <div className="text-right">Submitted At</div>,
    cell: ({ row }) => {
        const date = new Date(row.getValue('submittedAt'));
        const formatted = format(date, 'PPp');
        return <div className="text-right font-medium">{formatted}</div>;
    }
  },
];
