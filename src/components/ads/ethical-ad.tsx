
'use client';

import { Card } from '@/components/ui/card';
import { Code } from 'lucide-react';

export function EthicalAd() {
    return (
      <Card className="p-4 bg-muted/40 border-dashed">
         <div className="flex items-start gap-4">
            <div className="hidden sm:block p-3 bg-background border rounded-lg">
               <Code className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">
                Your Ad Will Appear Here
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                This is a placeholder for an ad. When you're ready, you can integrate with an ad network like EthicalAds or Google AdSense here.
              </p>
            </div>
        </div>
         <p className="text-xs text-muted-foreground text-right mt-2">
            Ad Placeholder
        </p>
      </Card>
    );
}
