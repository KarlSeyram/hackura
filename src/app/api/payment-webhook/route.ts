
import 'dotenv/config';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordPurchase } from '@/app/actions';
import type { CartItem } from '@/lib/definitions';

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

  try {
    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      
      const cartItems: CartItem[] = metadata?.cartItems ? JSON.parse(metadata.cartItems) : [];
      const userId: string | undefined = metadata?.userId;

      if (userId && cartItems.length > 0 && reference) {
        try {
          // This acts as a reliable fallback to ensure the purchase is recorded.
          await recordPurchase(userId, cartItems, reference);
          console.log(`Successfully processed webhook and recorded purchase for payment reference: ${reference}`);
        } catch (error) {
          console.error(`Webhook processing failed for reference ${reference}:`, error);
          // Still return 200 to Paystack to prevent retries for this specific error.
        }
      } else {
        console.warn(`Webhook for reference ${reference} received without sufficient metadata (userId or cartItems).`);
      }
    }
  } catch (error) {
    console.error('Error parsing Paystack webhook body:', error);
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  return NextResponse.json({ status: 'ok' });
}
