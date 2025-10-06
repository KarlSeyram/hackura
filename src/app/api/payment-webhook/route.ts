
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordPurchase } from '@/app/actions';
import type { CartItem } from '@/lib/definitions';

const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
const paypalSecret = process.env.PAYPAL_WEBHOOK_SECRET;
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

async function verifyPayPalWebhook(req: Request) {
    if (!paypalSecret || !paypalClientId) return false;

    const reqBody = await req.clone().text();
    const transmissionId = req.headers.get('paypal-transmission-id');
    const transmissionTime = req.headers.get('paypal-transmission-time');
    const certUrl = req.headers.get('paypal-cert-url');
    const authAlgo = req.headers.get('paypal-auth-algo');
    const transmissionSig = req.headers.get('paypal-transmission-sig');

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
        return false;
    }

    try {
        const response = await fetch('https://api.sandbox.paypal.com/v1/notifications/verify-webhook-signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                auth_algo: authAlgo,
                cert_url: certUrl,
                transmission_id: transmissionId,
                transmission_sig: transmissionSig,
                transmission_time: transmissionTime,
                webhook_id: paypalSecret,
                webhook_event: JSON.parse(reqBody)
            }),
        });

        const jsonResponse = await response.json();
        return jsonResponse.verification_status === 'SUCCESS';
    } catch (err) {
        console.error("PayPal webhook verification failed:", err);
        return false;
    }
}

async function handlePaystack(req: Request) {
    if (!paystackSecret) {
        console.error('PAYSTACK_SECRET_KEY is not set.');
        return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
    }

    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    const hash = crypto.createHmac('sha512', paystackSecret).update(body).digest('hex');

    if (hash !== signature) {
        console.warn('Invalid Paystack signature.');
        return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
        const { reference, metadata } = event.data;
        const userId = metadata.userId;
        const cartItems: CartItem[] = JSON.parse(metadata.cartItems);

        if (!userId || !cartItems || cartItems.length === 0) {
            console.error('Missing userId or cartItems in Paystack metadata.');
            return NextResponse.json({ message: 'Missing required metadata.' }, { status: 400 });
        }

        try {
            await recordPurchase(userId, cartItems, reference);
            return NextResponse.json({ message: 'Purchase recorded successfully.' }, { status: 200 });
        } catch (error) {
            console.error('Error recording purchase from Paystack:', error);
            return NextResponse.json({ message: 'Internal server error while recording purchase.' }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Event not handled.' }, { status: 200 });
}

async function handlePayPal(req: Request) {
    const isVerified = await verifyPayPalWebhook(req);
    if (!isVerified) {
        return NextResponse.json({ message: 'Invalid PayPal webhook signature.' }, { status: 401 });
    }

    const event = await req.json();

    if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
        const orderDetails = event.resource;
        const orderId = orderDetails.id;
        const customId = orderDetails.purchase_units?.[0]?.custom_id;
        
        // In the PayPal button, we're not sending cart items, so we can't record the individual items here.
        // The purchase is recorded on the client-side immediately on approval.
        // This webhook can be used for secondary confirmation, logging, or sending emails.
        console.log(`PayPal order ${orderId} for user ${customId} was approved.`);

        return NextResponse.json({ message: 'PayPal event received.' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Event not handled.' }, { status: 200 });
}


export async function POST(req: Request) {
    try {
        const clonedReq = req.clone();
        const url = new URL(req.url);

        if (url.pathname.includes('paystack')) {
            return await handlePaystack(clonedReq);
        } else if (url.pathname.includes('paypal')) {
            return await handlePayPal(clonedReq);
        }

        // Fallback for requests coming from a single webhook endpoint
        const bodyText = await clonedReq.clone().text();
        if (req.headers.has('x-paystack-signature')) {
             return await handlePaystack(clonedReq);
        } else if (req.headers.has('paypal-transmission-id')) {
             return await handlePayPal(clonedReq);
        }

        return NextResponse.json({ message: 'Webhook provider not identified.' }, { status: 400 });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
