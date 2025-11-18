
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Ad } from '@/lib/definitions';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface AdsBannerProps {
  ads: Ad[];
}

export function AdsBanner({ ads }: AdsBannerProps) {
  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted text-muted-foreground w-full">
      <Carousel
        className="w-full"
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {ads.map((ad) => (
            <CarouselItem key={ad.id}>
              <Link
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-16 w-full items-center justify-center gap-4 px-4 no-underline"
              >
                {ad.image_url && (
                  <div className="relative h-12 w-12 flex-shrink-0">
                    <Image
                      src={ad.image_url}
                      alt={ad.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-grow text-center">
                  <p className="text-base font-semibold">{ad.title}</p>
                  {ad.description && <p className="hidden text-sm md:block">{ad.description}</p>}
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        {ads.length > 1 && (
            <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6" />
            </>
        )}
      </Carousel>
    </div>
  );
}
