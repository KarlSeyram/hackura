
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { createSignedDownloads } from '@/app/actions';
import { PaystackButton } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart, cartCount } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setIsClient(true);
    if (cartCount === 0) {
      // Redirect to store if cart is empty
      router.push('/store');
    }
  }, [cartCount, router]);

  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';

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
        duration: 30000,
      });

      clearCart();
      setName('');
      setEmail('');
      router.push('/store');

    } catch (error) {
      console.error('Error creating download links:', error);
      toast({
        variant: 'destructive',
        title: 'Error Preparing Downloads',
        description: 'We received your payment, but there was an issue creating your download links. Please contact support.',
      });
    }
  };

  const componentProps = {
    email,
    amount: Math.round(totalPrice * 100),
    currency: paystackCurrency,
    metadata: {
      name,
      cartItems: JSON.stringify(cartItems.map(item => ({id: item.id, title: item.title, quantity: item.quantity}))),
    },
    publicKey: paystackPublicKey,
    text: "Pay Now",
    onSuccess: (reference: any) => handlePaymentSuccess(reference),
    onClose: () => {},
  };

  const formattedTotalPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: paystackCurrency,
  }).format(totalPrice);

  const isFormValid = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isClient || cartCount === 0) {
    // You can render a loading skeleton here
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Order Summary */}
        <div className="order-last md:order-first">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: paystackCurrency }).format(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formattedTotalPrice}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe" 
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            {isClient && (
              <PaystackButton
                {...componentProps}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                disabled={!isFormValid || totalPrice === 0 || !paystackPublicKey}
              />
            )}
             <Button variant="outline" asChild className="w-full">
                <Link href="/store">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Continue Shopping
                </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
