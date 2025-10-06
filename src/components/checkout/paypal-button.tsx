
'use client';

import { PayPalButtons, OnApproveData, CreateOrderData } from '@paypal/react-paypal-js';
import { useToast } from '@/hooks/use-toast';
import { recordPurchase } from '@/app/actions';
import type { CartItem } from '@/lib/definitions';
import { Button } from '../ui/button';
import { useState } from 'react';

interface PayPalCheckoutButtonProps {
    cartItems: CartItem[];
    totalPrice: number;
    onPaymentSuccess: (orderId: string) => void;
    onPaymentError: (err: any) => void;
    disabled?: boolean;
}

const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'USD';


export function PayPalCheckoutButton({
    cartItems,
    totalPrice,
    onPaymentSuccess,
    onPaymentError,
    disabled
}: PayPalCheckoutButtonProps) {
    const { toast } = useToast();
    // Faking user for now
    const [user, setUser] = useState({ uid: '123' });

    const createOrder = (data: CreateOrderData, actions: any) => {
        console.log("Creating PayPal order...");
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: totalPrice.toFixed(2),
                        currency_code: paystackCurrency,
                    },
                    description: "Hackura Ebook Purchase",
                    custom_id: user?.uid, // Pass user ID here
                },
            ],
            application_context: {
                shipping_preference: 'NO_SHIPPING',
            }
        });
    };

    const onApprove = async (data: OnApproveData, actions: any) => {
        console.log("PayPal order approved. Data:", data);
        if (!actions.order || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not finalize purchase. User or order details missing.' });
            return;
        }

        try {
            const details = await actions.order.capture();
            const orderId = details.id;
            console.log('Payment successful. Order ID:', orderId);
            
            // Record the purchase in the backend
            await recordPurchase(user.uid, cartItems, orderId);

            onPaymentSuccess(orderId);
        } catch (error) {
            console.error("Error capturing PayPal order:", error);
            toast({ variant: 'destructive', title: 'Payment Capture Failed', description: 'There was an issue capturing your payment.' });
            onPaymentError(error);
        }
    };
    

    const onError = (err: any) => {
        // This string is what the PayPal SDK throws when the user closes the popup.
        const a = 'paypal-checkout-components';
        if (err.message && err.message.includes(`${a}__braintree_popup_closed_by_user`)) {
          onCancel();
          return;
        }
        
        onPaymentError(err);
    };

    const onCancel = () => {
        console.log('PayPal payment cancelled by user.');
        toast({
            title: 'Payment Cancelled',
            description: 'Your payment process was cancelled.',
            variant: 'default'
        });
    }

    if (disabled) {
        return <Button disabled className="w-full">Fill Form to Enable PayPal</Button>
    }

    return (
       <PayPalButtons
        style={{ layout: "vertical", color: 'blue', shape: 'rect', label: 'pay' }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
        />
    );
}
