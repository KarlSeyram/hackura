
import { createAdminClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

async function getAds() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching ads:", error);
        return [];
    }
    return data;
}

export default async function AdsPage() {
    const ads = await getAds();

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                    Promotions & Announcements
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
                    Check out the latest deals, news, and updates from Hackura.
                </p>
            </div>

            {ads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ads.map((ad) => (
                        <Card key={ad.id} className="flex flex-col overflow-hidden">
                           <div className="relative aspect-video w-full">
                                <Image
                                    src={ad.image_url}
                                    alt={ad.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <CardHeader>
                                <CardTitle>{ad.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <CardDescription>{ad.description}</CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={ad.link} target="_blank" rel="noopener noreferrer">
                                        Learn More <ExternalLink className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16">
                    <p className="text-muted-foreground">No active promotions at the moment. Check back soon!</p>
                </div>
            )}
        </div>
    );
}
