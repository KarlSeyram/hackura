import ProductCard from '@/components/products/product-card';
import { ebooks } from '@/lib/data';
import type { Ebook } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
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

      <section>
        <h2 className="font-headline text-3xl font-bold tracking-tight mb-8">
          Featured Ebooks
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEbooks.map((ebook: Ebook) => (
            <ProductCard key={ebook.id} product={ebook} />
          ))}
        </div>
        <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
                <Link href="/store">View All Products</Link>
            </Button>
        </div>
      </section>
    </div>
  );
}
