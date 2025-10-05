
'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'; // 'sb' is a mock client ID for development

export function PayPalProvider({ children }: { children: React.ReactNode }) {
    if (!paypalClientId) {
        console.error("PayPal Client ID is not set. PayPal buttons will not work.");
        return <>{children}</>;
    }

    return (
        <PayPalScriptProvider options={{ clientId: paypalClientId }}>
            {children}
        </PayPalScriptProvider>
    );
}
