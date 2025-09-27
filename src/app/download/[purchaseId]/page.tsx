'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { PurchaseWithEbook } from '@/lib/definitions';
import React from 'react';

export default function DownloadPage({ params }: { params: { purchaseId: string } }) {
    const { purchaseId } = React.use(params);
    const [purchase, setPurchase] = useState<PurchaseWithEbook | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPurchaseDetails = useCallback(async () => {
        if (!purchaseId) {
            setError("No purchase reference provided.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Fetch the purchase record and join it with the ebooks table
            const { data, error: dbError } = await supabase
                .from("purchases")
                .select("id, payment_ref, created_at, ebooks(id, title, file_name)")
                .eq("payment_ref", purchaseId)
                .single();

            if (dbError || !data) {
                throw new Error("Could not find a matching purchase. Please contact support if you believe this is an error.");
            }
            
            // The result from Supabase needs to be cast to the correct type
            const typedData = data as unknown as PurchaseWithEbook;

            if (!typedData.ebooks?.file_name) {
                 throw new Error("The ebook file for this purchase is missing. Please contact support.");
            }
            
            setPurchase(typedData);

        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred while fetching your download.");
        } finally {
            setLoading(false);
        }
    }, [purchaseId]);

    useEffect(() => {
        fetchPurchaseDetails();
    }, [fetchPurchaseDetails]);

    // Construct the public URL for the file
    const downloadUrl = purchase?.ebooks?.file_name
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ebook-files/${purchase.ebooks.file_name}`
        : '';


    return (
        <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            {loading && (
                <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h1 className="font-headline text-2xl font-bold">Verifying Your Purchase...</h1>
                    <p className="text-muted-foreground mt-2">Please wait a moment while we retrieve your files.</p>
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

            {!loading && !error && purchase && (
                <>
                    <h1 className="font-headline text-3xl font-bold">Thank You for Your Purchase!</h1>
                    <p className="text-muted-foreground mt-2 mb-8">Your download link is ready.</p>

                    <div className="w-full max-w-md space-y-4">
                        <Button asChild size="lg" className="w-full">
                            <a href={downloadUrl} download>
                                <Download className="mr-2 h-5 w-5" />
                                Download {purchase.ebooks.title}
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
