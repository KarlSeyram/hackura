
'use client';

import { useEffect, useRef } from 'react';

// IMPORTANT: Remember to replace 'YOUR-PUBLISHER-ID' with your actual EthicalAds publisher ID.
const PUBLISHER_ID = 'YOUR-PUBLISHER-ID';

export function EthicalAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the script has already been added to avoid duplicates
    if (document.getElementById('ethical-ad-script')) {
      // If the script is already there, just re-run the ad placement logic
      if (typeof (window as any).ethicalads !== 'undefined') {
        (window as any).ethicalads.load();
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'ethical-ad-script';
    script.src = 'https://media.ethicalads.io/media/client/ethicalads.min.js';
    script.async = true;

    document.head.appendChild(script);

    return () => {
      // Optional: Cleanup script if component unmounts, though usually not necessary
      // if (script.parentNode) {
      //   script.parentNode.removeChild(script);
      // }
    };
  }, []);

  return (
    <div className="min-h-[120px] my-4">
        <div
        ref={adRef}
        data-ea-publisher={PUBLISHER_ID}
        data-ea-type="image"
        className="bordered horizontal"
        ></div>
    </div>
  );
}
