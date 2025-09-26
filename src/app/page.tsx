import ProductCard from '@/components/products/product-card';
import { ebooks } from '@/lib/data';
import type { Ebook } from '@/lib/definitions';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <section className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Welcome to CyberShelf
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
          Your digital library for cutting-edge cybersecurity and tech knowledge.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-3xl font-bold tracking-tight mb-8">
          Featured Ebooks
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ebooks.map((ebook: Ebook) => (
            <ProductCard key={ebook.id} product={ebook} />
          ))}
        </div>
      </section>
    </div>
  );
}
