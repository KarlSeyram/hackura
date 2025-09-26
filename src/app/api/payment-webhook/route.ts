
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSignedDownloads } from '@/app/actions';

const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
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

  const event = JSON.parse(body);

  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data;
    const cartItems = metadata?.cartItems ? JSON.parse(metadata.cartItems) : [];

    if (cartItems.length > 0 && reference) {
      try {
        // We have the cart items, now generate the signed URLs and store them
        await createSignedDownloads(cartItems, reference);
        console.log(`Successfully processed webhook for payment reference: ${reference}`);
        
      } catch (error) {
        console.error(`Webhook processing failed for reference ${reference}:`, error);
        return NextResponse.json({ message: 'Webhook processing error.' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ status: 'ok' });
}
