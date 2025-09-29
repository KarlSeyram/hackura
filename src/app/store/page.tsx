
import { getEbooks } from '@/lib/data';
import { StoreClient } from './store-client';


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

      <StoreClient initialEbooks={ebooks} />
    </div>
  );
}
