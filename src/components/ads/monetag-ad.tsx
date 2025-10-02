
'use client';

import { Card } from '@/components/ui/card';

export function MonetagAd() {

  return (
    <Card className="p-4 bg-muted/40 border-dashed flex items-center justify-center text-center min-h-[100px]">
      <div>
        <h4 className="font-semibold text-muted-foreground">Monetag Ad Placeholder</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Your Monetag ad unit will be displayed here.
        </p>
        {/*
          1. In your Monetag dashboard, create an Ad Zone.
          2. They will give you an HTML ad code snippet.
          3. Paste that entire code snippet here, replacing this comment block.
          
          Example of what the code might look like:
          <div class="some-monetag-class">
            <!-- Monetag ad code or script goes here -->
          </div>
        */}
      </div>
    </Card>
  );
}
