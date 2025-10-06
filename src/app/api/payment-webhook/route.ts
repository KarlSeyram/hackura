
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordPurchase } from '@/app/actions';
import type { CartItem } from '@/lib/definitions';

const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

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
        
        const customFields = metadata.custom_fields || [];
        const userIdField = customFields.find((f: any) => f.variable_name === 'user_id');
        const cartItemsField = customFields.find((f: any) => f.variable_name === 'cart_items');

        const userId = userIdField?.value;
        const cartItems: CartItem[] = cartItemsField ? JSON.parse(cartItemsField.value) : [];

        if (!userId || !cartItems || cartItems.length === 0) {
            console.error('Missing userId or cartItems in Paystack metadata custom fields.');
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


export async function POST(req: Request) {
    try {
        const clonedReq = req.clone();
        
        if (req.headers.has('x-paystack-signature')) {
             return await handlePaystack(clonedReq);
        }

        return NextResponse.json({ message: 'Webhook provider not identified.' }, { status: 400 });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
