import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getEbooks } from '@/lib/data';
import { ProductClient } from './product-client';

async function getProduct(id: string) {
    const ebooks = await getEbooks();
    const product = ebooks.find(p => p.id.toString() === id);
    return product;
}


export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }
  
  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: paystackCurrency,
  }).format(product.price);

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-lg">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            data-ai-hint={product.imageHint}
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 text-3xl font-bold">{formattedPrice}</p>
          <p className="mt-6 text-base text-muted-foreground">
            {product.description}
          </p>
          
          <ProductClient product={product} />

        </div>
      </div>
    </div>
  );
}
