'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
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
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>View and manage your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{user.displayName || 'We should have a display name as well'}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium">User ID</h3>
            <p className="text-sm text-muted-foreground">{user.uid}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
