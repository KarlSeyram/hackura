
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { getMyEbooks, getSecureDownloadUrl } from '@/app/actions';
import type { Ebook } from '@/lib/definitions';
import { Loader2, Library, Download, AlertTriangle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

function EbookRow({ ebook }: { ebook: Ebook }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const { url, error } = await getSecureDownloadUrl(ebook.id);
            if (error || !url) {
                 toast({
                    variant: "destructive",
                    title: "Download failed",
                    description: "Could not generate a secure download link. Please try again later.",
                });
            } else {
                // This will trigger the download in the browser
                window.location.href = url;
            }
        } catch (e) {
             toast({
                variant: "destructive",
                title: "Download failed",
                description: "An unexpected error occurred.",
            });
        } finally {
            setIsDownloading(false);
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg">
            <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md">
                <Image src={ebook.imageUrl} alt={ebook.title} fill className="object-cover" />
            </div>
            <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold">{ebook.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{ebook.description}</p>
            </div>
            <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download
            </Button>
        </div>
    )
}

export default function MyEbooksPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else {
        getMyEbooks(user.uid)
          .then(setEbooks)
          .finally(() => setIsLoading(false));
      }
    }
  }, [user, isUserLoading, router]);

  if (isLoading || isUserLoading) {
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

        {ebooks.length > 0 ? (
            <div className="space-y-6">
                {ebooks.map(ebook => (
                   <EbookRow key={ebook.id} ebook={ebook} />
                ))}
            </div>
        ) : (
            <Card className="text-center p-8">
                <CardContent className="flex flex-col items-center justify-center gap-4">
                    <XCircle className="h-12 w-12 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Your library is empty</h2>
                    <p className="text-muted-foreground">You haven't purchased any ebooks yet.</p>
                    <Button asChild className="mt-4">
                        <Link href="/store">Explore the Store</Link>
                    </Button>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
