
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { UserWithRole } from './definitions';
import { columns } from './columns';
import { DataTable } from './data-table';


async function getUsersWithRoles(): Promise<{ users: UserWithRole[]; error: string | null }> {
  const supabase = createBrowserClient();

  // 1. Fetch all users from the public 'users' table
  const { data: usersData, error: usersError } = await supabase.from('users').select('*');
  if (usersError) {
    console.error("Error fetching users:", usersError);
    return { users: [], error: 'Could not fetch users from the database. Have you created the `users` table in Supabase and run the SQL query?' };
  }

  // 2. Fetch all admin roles from the 'user_roles' table
  const { data: rolesData, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');
  
  if (rolesError) {
    console.error("Error fetching user roles:", rolesError);
  }

  const adminIds = new Set(rolesData?.map(r => r.user_id) || []);

  // 3. Merge the data
  const combinedUsers: UserWithRole[] = usersData.map(user => ({
    uid: user.id, // Assuming the 'id' in the 'users' table is the Firebase UID
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    creationTime: user.created_at,
    isAdmin: adminIds.has(user.id),
  }));

  return { users: combinedUsers, error: null };
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { users, error } = await getUsersWithRoles();
      if (error) {
        setError(error);
      } else {
        setUsers(users);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
       <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4">
        <h2 className="font-headline text-3xl font-bold tracking-tight">User Management</h2>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to Load User Data</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="font-headline text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">An overview of all registered users and their roles.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users on your site. Use the toggle to grant or revoke admin privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={users} />
        </CardContent>
      </Card>
    </div>
  );
}
