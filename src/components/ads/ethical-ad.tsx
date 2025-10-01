
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Code } from 'lucide-react';
import Link from 'next/link';

export function EthicalAd() {
  return (
    <Card className="p-4 bg-muted/40 border-dashed">
      <div className="flex items-start gap-4">
        <div className="hidden sm:block p-3 bg-background border rounded-lg">
           <Code className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">
            Deploy your Next.js app with one click.
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Explore our lightning-fast, globally-distributed infrastructure for modern web applications. Get started for free.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="#" target="_blank" rel="noopener noreferrer">
            Learn More
          </Link>
        </Button>
      </div>
       <p className="text-xs text-muted-foreground text-right mt-2">
          Sponsored Ad
        </p>
    </Card>
  );
}
