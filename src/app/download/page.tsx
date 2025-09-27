
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSecureDownloadUrl } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';

function DownloadContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validateAndFetchUrl() {
      if (!token) {
        setError('No download link provided. Please check the URL.');
        setLoading(false);
        return;
      }
      
      // First, decode the token on the client to check expiry without a server round-trip.
      const decoded = jwt.decode(token) as { exp: number } | null;
      if (!decoded || (decoded.exp * 1000) < Date.now()) {
        setError('This download link has expired. Please purchase the item again to get a new link.');
        setLoading(false);
        return;
      }

      // If not expired client-side, verify on the server and get the URL.
      const result = await getSecureDownloadUrl(token);

      if (result.error) {
        switch (result.error) {
          case 'expired':
          case 'invalid':
            setError('This download link is invalid or has expired. Please try your purchase again.');
            break;
          case 'not_found':
            setError('The requested ebook could not be found. Please contact support.');
            break;
          default:
            setError('An unknown error occurred. Please try again or contact support.');
            break;
        }
      } else if (result.url) {
        setDownloadUrl(result.url);
      }
      setLoading(false);
    }
    validateAndFetchUrl();
  }, [token]);


  if (loading) {
    return (
      <>
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="font-headline text-2xl font-bold">Validating Your Download Link...</h1>
        <p className="text-muted-foreground mt-2">Please wait a moment.</p>
      </>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="font-headline text-xl font-bold text-destructive-foreground">Download Failed</h1>
        <p className="text-destructive-foreground/80 mt-2">{error}</p>
        <Button asChild className="mt-6">
          <Link href="/store">Back to Store</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-headline text-3xl font-bold">Your Download is Ready!</h1>
      <p className="text-muted-foreground mt-2 mb-8">Click the button below to download your ebook.</p>
      <div className="w-full max-w-md space-y-4">
        <Button asChild size="lg" className="w-full">
          <a href={downloadUrl!} download>
            <Download className="mr-2 h-5 w-5" />
            Download Ebook
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        This link is for your personal use and will expire shortly.
      </p>
    </>
  );
}


export default function DownloadPage() {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Suspense fallback={<div>Loading...</div>}>
            <DownloadContent />
        </Suspense>
      </div>
    );
}
