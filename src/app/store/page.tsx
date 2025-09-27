
import { getEbooks } from '@/lib/data';
import type { Ebook } from '@/lib/definitions';
import ProductCard from '@/components/products/product-card';

export default async function StorePage() {
  const ebooks = await getEbooks();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <section className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Ebook Store
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
          Browse our collection of ebooks on cybersecurity and technology.
        </p>
      </section>

      <section>
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ebooks.map((ebook: Ebook) => (
                <ProductCard key={ebook.id} product={ebook} />
              ))}
            </div>
            {ebooks.length === 0 && (
                <div className="text-center col-span-full py-12">
                    <p className="text-muted-foreground">No products found.</p>
                </div>
            )}
          </>
      </section>
    </div>
  );
}
