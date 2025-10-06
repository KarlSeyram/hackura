
import 'dotenv/config';
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
        console.warn('Invalid Paystack webhook signature.');
        return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
    }

    try {
        const event = JSON.parse(body);
        if (event.event === 'charge.success') {
            const { reference, metadata } = event.data;
            const cartItems: CartItem[] = metadata?.cartItems ? JSON.parse(metadata.cartItems) : [];
            const userId: string | undefined = metadata?.userId;

            if (userId && cartItems.length > 0 && reference) {
                await recordPurchase(userId, cartItems, reference);
                console.log(`Successfully processed Paystack webhook for ref: ${reference}`);
            } else {
                console.warn(`Paystack webhook for ref ${reference} missing metadata.`);
            }
        }
    } catch (error) {
        console.error('Error parsing Paystack webhook body:', error);
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }

    return NextResponse.json({ status: 'ok' });
}

async function handlePayPal(req: Request) {
    const isVerified = await verifyPayPalWebhook(req);
    if (!isVerified) {
        console.warn('Invalid PayPal webhook signature.');
        return NextResponse.json({ message: 'Invalid signature.' }, { status: 401 });
    }

    try {
        const event = await req.json();
        if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
            const order = event.resource;
            const reference = order.id;
            const customId = order.purchase_units[0]?.custom_id;
            const userId = customId; // We passed userId in custom_id

            if (userId && reference) {
                // We cannot get cartItems from PayPal webhook, so this is for redundancy.
                // The primary purchase record happens on the client.
                console.log(`PayPal webhook received for order ${reference}, user ${userId}. Purchase likely recorded on client.`);
            } else {
                console.warn(`PayPal webhook for order ${reference} missing user info (custom_id).`);
            }
        }
    } catch (error) {
        console.error('Error parsing PayPal webhook body:', error);
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }

    return NextResponse.json({ status: 'ok' });
}


export async function POST(req: Request) {
  const userAgent = req.headers.get('user-agent');
  if (userAgent?.includes('Paystack')) {
      return handlePaystack(req);
  }
  if (userAgent?.includes('PayPal')) {
      return handlePayPal(req);
  }

  // Fallback for Paystack if user-agent is not present/correct
  if (req.headers.has('x-paystack-signature')) {
      return handlePaystack(req);
  }

  return NextResponse.json({ message: 'Unrecognized webhook source.' }, { status: 400 });
}

    