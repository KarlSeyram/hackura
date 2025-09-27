
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPurchaseDownloadLinks, clearPurchaseData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { PurchaseLink } from '@/lib/definitions';

export default function DownloadPage({ params }: { params: { purchaseId: string } }) {
    const [links, setLinks] = useState<PurchaseLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLinks = useCallback(async () => {
        const { purchaseId } = params;
        if (!purchaseId) return;

        setLoading(true);
        setError(null);
        try {
            const fetchedLinks = await getPurchaseDownloadLinks(purchaseId);
            if (fetchedLinks && fetchedLinks.length > 0) {
                setLinks(fetchedLinks);
                setTimeout(() => clearPurchaseData(purchaseId), 1000 * 60 * 60 * 24); // 24 hours
            } else {
                throw new Error("No links found yet.");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred while fetching your downloads.");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        const { purchaseId } = params;
        if (!purchaseId) return;

        let retries = 0;
        const maxRetries = 5;
        const retryDelay = 3000; // 3 seconds

        const tryFetch = async () => {
            try {
                const fetchedLinks = await getPurchaseDownloadLinks(purchaseId);
                 if (fetchedLinks && fetchedLinks.length > 0) {
                    setLinks(fetchedLinks);
                    setLoading(false);
                    setError(null);
                     setTimeout(() => clearPurchaseData(purchaseId), 1000 * 60 * 60 * 24); // 24 hours
                } else {
                    throw new Error("No links found yet.");
                }
            } catch (e) {
                retries++;
                if (retries >= maxRetries) {
                    setError("Could not retrieve download links after several attempts. Please contact support.");
                    setLoading(false);
                } else {
                    console.log(`Retrying... (${retries}/${maxRetries})`);
                    setTimeout(tryFetch, retryDelay);
                }
            }
        };

        tryFetch();
    }, [params]);


    return (
        <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            {loading && (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h1 className="font-headline text-2xl font-bold">Preparing Your Downloads...</h1>
                    <p className="text-muted-foreground mt-2">Please wait a moment. Your files are being securely generated.</p>
                </>
            )}

            {!loading && error && (
                 <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h1 className="font-headline text-xl font-bold text-destructive-foreground">Failed to Get Downloads</h1>
                    <p className="text-destructive-foreground/80 mt-2">
                        We're sorry, but there was a problem preparing your download links.
                    </p>
                    <p className="text-xs text-destructive-foreground/60 mt-4">
                        Please contact our support team and provide your payment reference ID: <br />
                        <span className="font-mono bg-destructive/20 px-1 py-0.5 rounded">{params.purchaseId}</span>
                    </p>
                     <Button asChild className="mt-6">
                        <Link href="/contact">Contact Support</Link>
                    </Button>
                </div>
            )}

            {!loading && !error && links.length > 0 && (
                <>
                    <h1 className="font-headline text-3xl font-bold">Thank You for Your Purchase!</h1>
                    <p className="text-muted-foreground mt-2 mb-8">Your download links are ready. These links will expire in 24 hours.</p>

                    <div className="w-full max-w-md space-y-4">
                        {links.map((link, index) => (
                            <Button key={index} asChild size="lg" className="w-full">
                                <a href={link.download_url} download>
                                    <Download className="mr-2 h-5 w-5" />
                                    Download {link.title}
                                </a>
                            </Button>
                        ))}
                    </div>

                    <p className="text-sm text-muted-foreground mt-12">
                        Having trouble? <Link href="/contact" className="underline hover:text-primary">Contact us</Link>.
                    </p>
                </>
            )}
        </div>
    );
}
