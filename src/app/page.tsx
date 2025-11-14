
import ProductCard from '@/components/products/product-card';
import { getEbooks } from '@/lib/data';
import type { Ebook } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HomeClient } from './home-client';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function RecommendationsFallback() {
    return (
         <section className="mt-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight mb-8">
                Recommended For You
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-lg" />
                </div>
                 <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-lg" />
                </div>
                 <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-lg" />
                </div>
            </div>
        </section>
    )
}

export default async function Home() {
  const ebooks = await getEbooks();
  const featuredEbooks = ebooks.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <section className="text-center mb-16 py-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Unlock Your Expertise in Cybersecurity & Tech
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-xl">
          Dive into our curated collection of ebooks, designed to elevate your skills and keep you ahead of the curve in the fast-paced world of technology.
        </p>
        <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
                <Link href="/store">Explore Ebooks</Link>
            </Button>
        </div>
      </section>

      <Suspense fallback={<RecommendationsFallback />}>
        <HomeClient allEbooks={ebooks} />
      </Suspense>
      
      <Separator className="my-16" />

      <section className="mt-16">
        <h2 className="font-headline text-3xl font-bold tracking-tight mb-8">
          Featured Ebooks
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEbooks.map((ebook: Ebook) => (
                <ProductCard key={ebook.id} product={ebook} />
            ))}
        </div>
      </section>
    </div>
  );
}
