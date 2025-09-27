import { getSecureDownloadUrl } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import jwt from 'jsonwebtoken';

async function DownloadContent({ token }: { token: string | null }) {

  if (!token) {
     return (
      <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-center flex flex-col items-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="font-headline text-xl font-bold text-destructive-foreground">Download Failed</h1>
        <p className="text-destructive-foreground/80 mt-2">No download link provided. Please check the URL.</p>
        <Button asChild className="mt-6">
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>
    );
  }

  // First, decode the token on the server to check expiry before calling the action.
  const decoded = jwt.decode(token) as { exp: number } | null;
  if (!decoded || (decoded.exp * 1000) < Date.now()) {
     return (
      <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-center flex flex-col items-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="font-headline text-xl font-bold text-destructive-foreground">Download Link Expired</h1>
        <p className="text-destructive-foreground/80 mt-2">This download link has expired. Please purchase the item again to get a new link.</p>
        <Button asChild className="mt-6">
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>
    );
  }

  // If not expired, verify on the server and get the URL.
  const result = await getSecureDownloadUrl(token);

  if (result.error || !result.url) {
    let errorMessage = 'An unknown error occurred. Please try again or contact support.';
     switch (result.error) {
        case 'expired':
        case 'invalid':
            errorMessage = 'This download link is invalid or has expired. Please try your purchase again.';
            break;
        case 'not_found':
            errorMessage = 'The requested ebook could not be found. Please contact support.';
            break;
    }
    return (
      <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-center flex flex-col items-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="font-headline text-xl font-bold text-destructive-foreground">Download Failed</h1>
        <p className="text-destructive-foreground/80 mt-2">{errorMessage}</p>
        <Button asChild className="mt-6">
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center flex flex-col items-center">
      <h1 className="font-headline text-3xl font-bold">Your Download is Ready!</h1>
      <p className="text-muted-foreground mt-2 mb-8">Click the button below to download your ebook.</p>
      <div className="w-full max-w-md space-y-4">
        <Button asChild size="lg" className="w-full">
          <a href={result.url} download>
            <Download className="mr-2 h-5 w-5" />
            Download Ebook
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        This link is for your personal use and will expire shortly.
      </p>
    </div>
  );
}


export default async function DownloadPage({ searchParams }: { searchParams: { token?: string } }) {
    const token = searchParams.token || null;
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
          <DownloadContent token={token} />
      </div>
    );
}
