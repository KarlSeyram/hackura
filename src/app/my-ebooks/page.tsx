
'use client';

import { useEffect } from 'react';
import { Loader2, Library } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MyEbooksList } from '@/components/profile/my-ebooks-list';
import { useFirebase } from '@/firebase/provider';

export default function MyEbooksPage() {
  const { user, isLoading: isUserLoading } = useFirebase();
  const router = useRouter();
  
  useEffect(() => {
    if (!isUserLoading && !user) {
        router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading your library...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
            <Library className="h-8 w-8 text-primary" />
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">My Ebooks</h1>
                <p className="text-muted-foreground">All your purchased ebooks in one place.</p>
            </div>
        </div>

        <MyEbooksList />
    </div>
  );
}
