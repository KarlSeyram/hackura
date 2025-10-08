
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { UserWithRole } from './definitions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { RoleToggle } from './role-toggle';
import { useFirebase } from '@/firebase/provider';


export const columns: ColumnDef<UserWithRole>[] = [
  {
    accessorKey: 'displayName',
    header: 'User',
    cell: ({ row }) => {
        const user = row.original;
        return (
             <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL} alt={user.displayName} />
                <AvatarFallback>{user.displayName?.[0] || user.email?.[0]}</AvatarFallback>
                </Avatar>
                <span>{user.displayName || 'N/A'}</span>
            </div>
        )
    }
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'isAdmin',
    header: 'Admin Role',
    cell: ({ row }) => {
        const user = row.original;
        const { user: currentUser } = useFirebase();
        
        // Prevent an admin from revoking their own role
        const isCurrentUser = currentUser?.uid === user.uid;

        return <RoleToggle user={user} disabled={isCurrentUser} />
    }
  },
  {
    accessorKey: 'creationTime',
    header: () => <div className="text-right">Joined</div>,
    cell: ({ row }) => {
        const date = row.getValue('creationTime');
        if (!date) return <div className="text-right">N/A</div>;
        const formatted = format(new Date(date as string), 'PP');
        return <div className="text-right font-medium">{formatted}</div>;
    }
  },
];
