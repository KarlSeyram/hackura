
import { createAdminClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

// This is a simplified representation. The actual Auth server SDK returns more.
type AppUser = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  creationTime?: string;
};

type UserWithRole = AppUser & {
  isAdmin: boolean;
};

// This server action fetches users from Firebase Auth and merges them with roles from Supabase.
// It's a placeholder for using the real Firebase Admin SDK.
// NOTE: For a real app, you would use the Firebase Admin SDK to list users.
// This is not possible here, so we will simulate it by fetching from our public `users` table.
async function getUsersWithRoles(): Promise<{ users: UserWithRole[]; error: string | null }> {
  const supabase = createAdminClient();

  // 1. Fetch all users from the public 'users' table (as a stand-in for Firebase Auth users)
  const { data: usersData, error: usersError } = await supabase.from('users').select('*');
  if (usersError) {
    console.error("Error fetching users:", usersError);
    return { users: [], error: 'Could not fetch users from the database.' };
  }

  // 2. Fetch all admin roles from the 'user_roles' table
  const { data: rolesData, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');
  
  if (rolesError) {
    console.error("Error fetching user roles:", rolesError);
    return { users: [], error: 'Could not fetch user roles.' };
  }

  const adminIds = new Set(rolesData.map(r => r.user_id));

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

export default async function UserManagementPage() {
  const { users, error } = await getUsersWithRoles();

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
          <p className="text-muted-foreground">An overview of all registered users.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users who have an account on your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                        <AvatarFallback>{user.displayName?.[0] || user.email?.[0]}</AvatarFallback>
                      </Avatar>
                      <span>{user.displayName || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isAdmin && <Badge>Admin</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.creationTime ? format(new Date(user.creationTime), 'PP') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <Users className="h-4 w-4" />
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>
          To grant or revoke admin privileges, you must currently do so directly in your Supabase 'user_roles' table. UI-based role management will be added in a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
}
