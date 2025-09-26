
'use client';

import Image from 'next/image';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Trash2, X, Download } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ShareButton from '../products/share-button';
import { createSignedDownloads } from '@/app/actions';
import { useEffect, useState } from 'react';

const CheckoutFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;

// Dedicated component to handle the Paystack payment hook
function PaystackPaymentButton({
  email,
  amount,
  disabled,
  onSuccess,
}: {
  email: string;
  amount: number;
  disabled: boolean;
  onSuccess: (reference: any) => void;
}) {
  const { toast } = useToast();
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

  const config = {
    reference: new Date().getTime().toString(),
    email,
    amount: Math.round(amount * 100), // Amount in kobo, rounded to nearest integer
    publicKey: paystackPublicKey,
    currency: 'GHS',
  };

  const initializePayment = usePaystackPayment(config);

  const onClose = () => {
    // Optional: handle payment closure
  };

  const handleCheckout = () => {
    if (!paystackPublicKey || !(paystackPublicKey.startsWith('pk_test_') || paystackPublicKey.startsWith('pk_live_'))) {
      toast({
        variant: 'destructive',
        title: 'Paystack Key Not Configured',
        description:
          'The Paystack public key is missing or invalid. Please check your .env file and restart the server.',
      });
      console.error('Paystack public key is missing or invalid.');
      return;
    }
    initializePayment({ onSuccess, onClose });
  };

  return (
    <Button
      onClick={handleCheckout}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
      disabled={disabled}
    >
      Checkout with Paystack
    </Button>
  );
}

export function CartSheetContent() {
  const { cartItems, removeFromCart, totalPrice, cartCount, clearCart } =
    useCart();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const handlePaymentSuccess = async (reference: any) => {
    console.log('Payment successful:', reference);
    
    try {
      const productsWithDownloads = await createSignedDownloads(cartItems);
      
      toast({
        title: 'Payment Successful!',
        description: (
          <div className="flex flex-col gap-2 mt-2">
            <p>Your download links are ready:</p>
            <ul className="list-disc pl-5">
              {productsWithDownloads.map(product => (
                <li key={product.id}>
                  {product.downloadUrl ? (
                    <a
                      href={product.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline flex items-center gap-2"
                    >
                      {product.title} <Download className="h-4 w-4" />
                    </a>
                  ) : (
                    <span>{product.title} (Link generation failed)</span>
                  )}
                </li>
              ))}
            </ul>
             <p className="text-xs text-muted-foreground mt-2">Links expire in 24 hours.</p>
          </div>
        ),
        duration: 30000, // Keep toast open longer
      });

      clearCart();

    } catch (error) {
      console.error('Error creating download links:', error);
      toast({
        variant: 'destructive',
        title: 'Error Preparing Downloads',
        description: 'We received your payment, but there was an issue creating your download links. Please contact support.',
      });
    }
  };


  const formattedTotalPrice = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(totalPrice);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(price);
  };

  return (
    <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
      <SheetHeader className="px-6">
        <SheetTitle>Cart ({cartCount})</SheetTitle>
      </SheetHeader>

      {cartItems.length > 0 ? (
        <>
          <div className="flex-1 overflow-y-auto no-scrollbar">
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
          </div>

          <SheetFooter className="p-6 sm:flex-col sm:items-stretch sm:space-x-0">
            <form onSubmit={handleSubmit(() => {})} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name')} placeholder="John Doe" />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  {...register('email')}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between font-semibold mt-4">
                <span>Total</span>
                <span>{formattedTotalPrice}</span>
              </div>

              {isClient && (
                <PaystackPaymentButton
                  email={email}
                  amount={totalPrice}
                  disabled={!isValid || totalPrice === 0}
                  onSuccess={handlePaymentSuccess}
                />
              )}
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
