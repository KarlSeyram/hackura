'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, Mail } from 'lucide-react';
import { MyEbooksList } from '@/components/profile/my-ebooks-list';
import { ChangePasswordDialog } from '@/components/profile/change-password-dialog';
import { DeleteAccountDialog } from '@/components/profile/delete-account-dialog';
import { useFirebase } from '@/firebase/provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, isLoading: isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2 mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground">Manage your account settings and purchased ebooks.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold">{user.displayName}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-medium">Change Password</h3>
                        <p className="text-sm text-muted-foreground">Update your password.</p>
                        <ChangePasswordDialog />
                    </div>
                    <Separator />
                    <div className="space-y-2 rounded-lg border border-destructive p-3">
                        <h3 className="font-medium text-destructive">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">Permanently delete your account.</p>
                        <DeleteAccountDialog />
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
           <Card>
                <CardHeader>
                    <CardTitle>My Ebooks</CardTitle>
                    <CardDescription>All your purchased ebooks in one place. Download them anytime.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <MyEbooksList />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
