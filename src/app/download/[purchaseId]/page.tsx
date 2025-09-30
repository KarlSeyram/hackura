
import { getPurchaseDownloadLinks } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


export default async function PurchaseConfirmationPage({ params }: { params: { purchaseId: string } }) {
    const { purchaseId } = params;
    
    try {
        const downloadLinks = await getPurchaseDownloadLinks(purchaseId);

        return (
            <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[70vh]">
                 <Card className="w-full">
                    <CardHeader className="items-center text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                        <CardTitle className="font-headline text-3xl">Thank You for Your Purchase!</CardTitle>
                        <CardDescription>Your download links are ready. You will also receive an email with these links shortly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {downloadLinks.map((link, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                    <p className="font-medium truncate pr-4">{link.title}</p>
                                    <Button asChild>
                                        <a href={link.download_url}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <p className="text-xs text-muted-foreground text-center">
                            These links are for your personal use and will expire in 24 hours.
                        </p>
                        <Button asChild variant="outline">
                           <Link href="/store">Continue Shopping</Link>
                        </Button>
                    </CardFooter>
                 </Card>
            </div>
        );

    } catch (error) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-center flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h1 className="font-headline text-xl font-bold text-destructive-foreground">Could Not Retrieve Downloads</h1>
                    <p className="text-destructive-foreground/80 mt-2">
                        {error instanceof Error ? error.message : 'An unknown error occurred.'}
                    </p>
                    <Button asChild className="mt-6">
                    <Link href="/store">Back to Store</Link>
                    </Button>
                </div>
            </div>
        );
    }
}
