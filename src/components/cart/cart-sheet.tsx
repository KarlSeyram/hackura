
'use client';

import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Trash2, X } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useToast } from '@/hooks/use-toast';

function PaystackButton() {
    const { toast } = useToast();
    const { totalPrice, clearCart } = useCart();
    
    // This should be stored in an environment variable
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

    const config = {
        reference: (new Date()).getTime().toString(),
        email: "user@example.com", // You should get this from your user data
        amount: totalPrice * 100, // Amount in kobo
        publicKey: publicKey,
        currency: 'GHS',
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = (reference: any) => {
        console.log(reference);
        toast({
            title: 'Payment Successful',
            description: 'Thank you for your purchase!',
        });
        clearCart();
    };

    const onClose = () => {
        console.log('closed');
        toast({
            variant: 'destructive',
            title: 'Payment Canceled',
            description: 'Your payment was canceled.',
        });
    }

    const handleCheckout = () => {
        if (!publicKey) {
             toast({
                variant: 'destructive',
                title: 'Paystack not configured',
                description: 'Please set your Paystack public key in the environment variables.',
            });
            return;
        }
        initializePayment({onSuccess, onClose});
    }

    return (
        <Button onClick={handleCheckout} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white">
            Checkout with Paystack
        </Button>
    )
}

export function CartSheetContent() {
  const { cartItems, removeFromCart, totalPrice, cartCount, clearCart } = useCart();
  
  const formattedTotalPrice = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(totalPrice);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
    }).format(price);
  }

  return (
    <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
      <SheetHeader className="px-6">
        <SheetTitle>Cart ({cartCount})</SheetTitle>
      </SheetHeader>
      <Separator />
      {cartItems.length > 0 ? (
        <>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-4 p-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Separator />
          <SheetFooter className="p-6 sm:flex-col sm:items-stretch sm:space-x-0">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formattedTotalPrice}</span>
            </div>
            <PaystackButton />
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={clearCart}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
            </Button>
          </SheetFooter>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <h3 className="font-semibold">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground">
            Add some ebooks to get started.
          </p>
          <SheetClose asChild>
            <Button>Continue Shopping</Button>
          </SheetClose>
        </div>
      )}
    </SheetContent>
  );
}
