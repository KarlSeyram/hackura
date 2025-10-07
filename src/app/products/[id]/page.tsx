
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getEbooks, getReviewsForEbook, submitReview } from '@/lib/data';
import { ProductClient } from './product-client';
import { Star, MessageCircle } from 'lucide-react';
import { ReviewForm } from './review-form';
import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';

async function getProduct(id: string) {
    const ebooks = await getEbooks();
    const product = ebooks.find(p => p.id.toString() === id);
    return product;
}

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for does not exist.',
    }
  }
  
  const imageUrl = product.imageUrl;

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ] : [],
      type: 'website',
    },
     twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }
  
  const reviews = await getReviewsForEbook(id);

  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: paystackCurrency,
  }).format(product.price);

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-lg">
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
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <span>({reviews.length} reviews)</span>
          </div>
          <p className="mt-6 text-base text-muted-foreground">
            {product.description}
          </p>
          
          <ProductClient product={product} />

        </div>
      </div>
       <Separator className="my-12" />

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-headline text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="space-y-8">
             {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold">
                        {review.reviewer.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{review.reviewer}</p>
                        <div className="flex items-center">
                           {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                           ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-2">{review.comment}</p>
                    </div>
                  </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/50 p-8 rounded-lg">
                    <MessageCircle className="h-10 w-10 mb-4" />
                    <p className="font-medium">No reviews yet.</p>
                    <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
            )}
          </div>
        </div>
        <div>
            <h2 className="font-headline text-2xl font-bold mb-6">Write a Review</h2>
            <ReviewForm ebookId={product.id} />
        </div>
      </div>
    </div>
  );
}
