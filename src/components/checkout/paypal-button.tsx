
'use client';

import { PayPalButtons, OnApproveData, CreateOrderData } from '@paypal/react-paypal-js';
import { useToast } from '@/hooks/use-toast';
import { recordPurchase } from '@/app/actions';
import type { CartItem } from '@/lib/definitions';
import { useUser } from '@/firebase';

interface PayPalCheckoutButtonProps {
    cartItems: CartItem[];
    totalPrice: number;
    onPaymentSuccess: (orderId: string) => void;
    onPaymentError: (err: any) => void;
}

const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'USD';


export function PayPalCheckoutButton({
    cartItems,
    totalPrice,
    onPaymentSuccess,
    onPaymentError
}: PayPalCheckoutButtonProps) {
    const { toast } = useToast();
    const { user } = useUser();

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
            toast({ title: 'Payment Successful!', description: 'Processing your order...' });
            
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
        console.error("PayPal Checkout Error:", err);
        toast({
            variant: 'destructive',
            title: 'PayPal Error',
            description: 'An error occurred with the PayPal transaction. Please try again.',
        });
        onPaymentError(err);
    };

    return (
       <PayPalButtons
        style={{ layout: "vertical", color: 'blue', shape: 'rect', label: 'pay' }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        />
    );
}

