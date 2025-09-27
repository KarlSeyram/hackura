'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { PurchaseLink } from '@/lib/definitions';
import React from 'react';

export default function DownloadPage({ params }: { params: { purchaseId: string } }) {
    const { purchaseId } = React.use(params);
    const [link, setLink] = useState<PurchaseLink | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLink = useCallback(async () => {
        if (!purchaseId) {
            setError("No product ID provided.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { data, error: dbError } = await supabase
                .from("ebooks")
                .select("title, file_name")
                .eq("id", purchaseId)
                .single();

            if (dbError || !data || !data.file_name) {
                throw new Error("Could not find the requested ebook.");
            }
            
            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ebook-files/${data.file_name}`;
            
            setLink({
                title: data.title,
                download_url: publicUrl,
            });

        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred while fetching your download.");
        } finally {
            setLoading(false);
        }
    }, [purchaseId]);

    useEffect(() => {
        fetchLink();
    }, [fetchLink]);


    return (
        <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            {loading && (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h1 className="font-headline text-2xl font-bold">Preparing Your Download...</h1>
                    <p className="text-muted-foreground mt-2">Please wait a moment while we retrieve your file.</p>
                </>
            )}

            {!loading && error && (
                 <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h1 className="font-headline text-xl font-bold text-destructive-foreground">Failed to Get Downloads</h1>
                    <p className="text-destructive-foreground/80 mt-2">
                        We're sorry, but there was a problem retrieving your download link.
                    </p>
                    <p className="text-xs text-destructive-foreground/60 mt-4">
                        Please contact our support team if the problem persists.
                    </p>
                     <Button asChild className="mt-6">
                        <Link href="/contact">Contact Support</Link>
                    </Button>
                </div>
            )}

            {!loading && !error && link && (
                <>
                    <h1 className="font-headline text-3xl font-bold">Thank You for Your Purchase!</h1>
                    <p className="text-muted-foreground mt-2 mb-8">Your download link is ready.</p>

                    <div className="w-full max-w-md space-y-4">
                        <Button asChild size="lg" className="w-full">
                            <a href={link.download_url} download>
                                <Download className="mr-2 h-5 w-5" />
                                Download {link.title}
                            </a>
                        </Button>
                    </div>

                     <Button asChild variant="outline" className="mt-8">
                        <Link href="/store">Continue Shopping</Link>
                    </Button>
                </>
            )}
        </div>
    );
}
