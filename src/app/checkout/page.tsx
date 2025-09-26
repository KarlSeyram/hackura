
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { getDownloadLinks, clearPurchaseData } from '@/app/actions';
import { PaystackButton } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, ShoppingCart, Loader2 } from 'lucide-react';
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
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentRef, setPaymentRef] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (cartCount === 0 && paymentState !== 'success') {
      router.push('/store');
    }
  }, [cartCount, router, paymentState]);

  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';

  const pollForDownloadLinks = useCallback(async (reference: string) => {
    let attempts = 0;
    const maxAttempts = 10; // Poll for 20 seconds
    const interval = 2000; // 2 seconds

    while (attempts < maxAttempts) {
      const result = await getDownloadLinks(reference);
      if (result.success && result.links && result.links.length > 0) {
        setPaymentState('success');
        toast({
          title: 'Payment Successful!',
          description: (
            <div className="flex flex-col gap-2 mt-2">
              <p>Your download links are ready:</p>
              <ul className="list-disc pl-5">
                {result.links.map(link => (
                  <li key={link.id}>
                    <a
                      href={link.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline flex items-center gap-2"
                    >
                      {cartItems.find(item => item.id === link.ebook_id)?.title || 'Ebook'} <Download className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-2">Links expire in 24 hours.</p>
            </div>
          ),
          duration: 60000, // 1 minute
        });
        
        clearCart();
        clearPurchaseData(reference); // Clean up the links from the DB after serving them
        return;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    setPaymentState('idle'); // Reset state
    toast({
      variant: 'destructive',
      title: 'Error Preparing Downloads',
      description: 'We received your payment, but there was an issue creating your download links. Please check your email or contact support.',
      duration: 30000,
    });

  }, [toast, clearCart, cartItems]);


  const handlePaymentSuccess = async (reference: any) => {
    console.log('Payment successful. Ref:', reference.reference);
    setPaymentState('processing');
    setPaymentRef(reference.reference);
    pollForDownloadLinks(reference.reference);
  };

  const componentProps = {
    email,
    amount: Math.round(totalPrice * 100),
    currency: paystackCurrency,
    reference: `cybershelf_${new Date().getTime()}`,
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

  if (!isClient || (cartCount === 0 && paymentState !== 'success')) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <p>Loading checkout...</p>
      </div>
    );
  }
  
  if (paymentState === 'processing') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="font-headline text-2xl font-bold">Processing Your Order...</h2>
          <p className="text-muted-foreground mt-2">Please do not close this window. Your download links will appear shortly.</p>
          <p className="text-sm text-muted-foreground mt-4">(Payment Reference: {paymentRef})</p>
      </div>
    )
  }
  
  if (paymentState === 'success') {
      return (
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
            <h2 className="font-headline text-2xl font-bold">Thank you for your purchase!</h2>
            <p className="text-muted-foreground mt-2">Your download links have been generated in the toast notification.</p>
            <p className="text-muted-foreground mt-1">If you missed it, please check your email or contact support with your payment reference: <span className="font-mono">{paymentRef}</span></p>
            <Button asChild className="mt-8">
                <Link href="/store">Continue Shopping</Link>
            </Button>
        </div>
      )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
