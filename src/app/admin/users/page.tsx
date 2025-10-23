
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { getUsersWithRoles } from './actions';

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
