
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { PurchaseLink } from '@/lib/definitions';
import { getPurchaseDownloadLinks } from '@/app/actions';
import React from 'react';

export default function DownloadPage({ params }: { params: { purchaseId: string } }) {
    const { purchaseId } = React.use(params);
    const [links, setLinks] = useState<PurchaseLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLinks = useCallback(async () => {
        if (!purchaseId) {
            setError("No purchase reference provided.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Poll for the download links
            let attempts = 0;
            const maxAttempts = 10;
            const interval = 3000; // 3 seconds

            const getLinks = async () => {
                attempts++;
                try {
                    const fetchedLinks = await getPurchaseDownloadLinks(purchaseId);
                    
                    if (fetchedLinks && fetchedLinks.length > 0) {
                        setLinks(fetchedLinks);
                        setLoading(false);
                    } else if (attempts < maxAttempts) {
                        setTimeout(getLinks, interval);
                    } else {
                        throw new Error("Could not retrieve download links after several attempts. The purchase might still be processing. Please contact support.");
                    }
                } catch(e: any) {
                     if (attempts < maxAttempts) {
                        setTimeout(getLinks, interval);
                    } else {
                        throw e;
                    }
                }
            };

            await getLinks();

        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred while fetching your downloads.");
            setLoading(false);
        }
    }, [purchaseId]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            {loading && (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h1 className="font-headline text-2xl font-bold">Preparing Your Downloads...</h1>
                    <p className="text-muted-foreground mt-2">Please wait a moment. This can take up to 30 seconds as we verify your payment.</p>
                </>
            )}

            {!loading && error && (
                 <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h1 className="font-headline text-xl font-bold text-destructive-foreground">Failed to Get Downloads</h1>
                    <p className="text-destructive-foreground/80 mt-2">
                        {error}
                    </p>
                     <Button asChild className="mt-6">
                        <Link href="/contact">Contact Support</Link>
                    </Button>
                </div>
            )}

            {!loading && !error && links.length > 0 && (
                <>
                    <h1 className="font-headline text-3xl font-bold">Thank You for Your Purchase!</h1>
                    <p className="text-muted-foreground mt-2 mb-8">Your download links are ready. These links are secure and will expire in 24 hours.</p>

                    <div className="w-full max-w-md space-y-4">
                        {links.map((link) => (
                            <Button asChild size="lg" className="w-full" key={link.title}>
                                <a href={link.download_url} download>
                                    <Download className="mr-2 h-5 w-5" />
                                    Download {link.title}
                                </a>
                            </Button>
                        ))}
                    </div>

                     <Button asChild variant="outline" className="mt-8">
                        <Link href="/store">Continue Shopping</Link>
                    </Button>
                </>
            )}
        </div>
    );
}
