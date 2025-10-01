
'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Code } from 'lucide-react';
import Script from 'next/script';

// TODO: Replace with your own Google AdSense IDs
const AdSensePublisherId = 'ca-pub-YOUR_PUBLISHER_ID';
const AdSenseSlotId = 'YOUR_AD_SLOT_ID';

export function EthicalAd() {
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  // In development, show a placeholder instead of a real ad
  if (isDevelopment || !AdSensePublisherId.startsWith('ca-pub-') || AdSenseSlotId === 'YOUR_AD_SLOT_ID') {
    return (
      <Card className="p-4 bg-muted/40 border-dashed">
         <div className="flex items-start gap-4">
            <div className="hidden sm:block p-3 bg-background border rounded-lg">
               <Code className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">
                Your AdSense Ad Will Appear Here
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                This is a placeholder. Once you add your Publisher and Ad Slot IDs, real ads will be displayed.
              </p>
            </div>
        </div>
         <p className="text-xs text-muted-foreground text-right mt-2">
            Ad Placeholder
        </p>
      </Card>
    );
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AdSensePublisherId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Card className="p-4 bg-muted/40 flex justify-center items-center min-h-[120px]">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100px' }}
          data-ad-client={AdSensePublisherId}
          data-ad-slot={AdSenseSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </Card>
    </>
  );
}
