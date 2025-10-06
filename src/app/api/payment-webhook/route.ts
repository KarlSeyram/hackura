
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
    const hash = crypto.createHmac('sha512', paystackSecret).update(.