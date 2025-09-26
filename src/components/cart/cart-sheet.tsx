
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
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ShareButton from '../products/share-button';

const CheckoutFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;


function PaystackButton({ email, amount, disabled }: { email: string; amount: number; disabled: boolean }) {
    const { toast } = useToast();
    const { clearCart } = useCart();
    
    const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

    const config = {
        reference: (new Date()).getTime().toString(),
        email: email, 
        amount: amount * 100, // Amount in kobo
        publicKey: paystackPublicKey,
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
        // Don't show a toast here, as it can be annoying if the user is just closing the modal.
    };

    const handleCheckout = () => {
        if (!paystackPublicKey) {
             toast({
                variant: 'destructive',
                title: 'Paystack key not found',
                description: 'The Paystack public key is missing. Please check your configuration.',
            });
            return;
        }
        
        initializePayment({onSuccess, onClose});
    }

    return (
        <Button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={disabled}>
            Checkout with Paystack
        </Button>
    )
}

export function CartSheetContent() {
  const { cartItems, removeFromCart, totalPrice, cartCount, clearCart } = useCart();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutFormSchema),
    mode: 'onChange',
  });

  const email = watch('email');

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
  
  const onSubmit: SubmitHandler<CheckoutFormValues> = (data) => {
    // The actual payment is handled by the PaystackButton's onClick, 
    // but we can use this handler if we need to do something with the form data before that.
    // The button is inside the form, so submitting the form will trigger its onClick.
    console.log('Form submitted, proceeding to Paystack:', data);
  };


  return (
    <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
      <SheetHeader className="px-6">
        <SheetTitle>Cart ({cartCount})</SheetTitle>
      </SheetHeader>
      
      {cartItems.length > 0 ? (
        <>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-8 p-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                     <p className="text-sm font-medium">
                      {formatPrice(item.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <ShareButton product={item} />
                         <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <SheetFooter className="p-6 sm:flex-col sm:items-stretch sm:space-x-0">
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name')} placeholder="John Doe" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
               </div>
                <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" {...register('email')} placeholder="you@example.com" />
                 {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
               </div>
              
              <div className="flex justify-between font-semibold mt-4">
                <span>Total</span>
                <span>{formattedTotalPrice}</span>
              </div>

               <PaystackButton email={email} amount={totalPrice} disabled={!isValid || totalPrice === 0} />
            </form>
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
