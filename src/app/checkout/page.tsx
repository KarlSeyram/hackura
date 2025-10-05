
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { PaystackButton } from 'react-paystack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Loader2, CreditCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { recordPurchase } from '@/app/actions';
import { useUser } from '@/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PayPalIcon, SkrillIcon, MtnIcon } from '@/components/icons';

type PaymentMethod = 'paystack' | 'paypal' | 'skrill';

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart, cartCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const [isClient, setIsClient] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing'>('idle');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('paystack');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isUserLoading) {
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to proceed with your purchase.',
          variant: 'destructive',
        });
        router.push('/login');
      } else if (cartCount === 0 && paymentState === 'idle') {
        toast({
          title: 'Your Cart is Empty',
          description: 'Redirecting you to the store to add some items.',
        });
        router.push('/store');
      }
    }
  }, [isClient, user, isUserLoading, cartCount, router, toast, paymentState]);

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';

  const handlePaymentSuccess = async (reference: any) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to complete a purchase.',
      });
      return;
    }
    console.log('Payment successful. Ref:', reference.reference);
    setPaymentState('processing');
    toast({
      title: 'Payment Successful!',
      description: 'Adding ebooks to your library...',
    });

    try {
      await recordPurchase(user.uid, cartItems, reference.reference);
      clearCart();
      router.push(`/my-ebooks`);
    } catch (error) {
      console.error('Failed during post-payment processing:', error);
      toast({
        variant: 'destructive',
        title: 'Error Processing Purchase',
        description: 'There was an issue saving your purchase. Please contact support.',
      });
      setPaymentState('idle');
    }
  };

  const handlePaymentClose = () => {
    console.log('Payment dialog closed.');
    setPaymentState('idle');
  }

  const componentProps = {
    email,
    amount: Math.round(totalPrice * 100),
    currency: paystackCurrency,
    reference: `hackura_${new Date().getTime()}`,
    metadata: {
      name,
      userId: user?.uid,
      cartItems: JSON.stringify(cartItems.map(item => ({ id: item.id, title: item.title, quantity: item.quantity }))),
    },
    publicKey: paystackPublicKey,
    text: "Pay Now",
    onSuccess: (reference: any) => handlePaymentSuccess(reference),
    onClose: handlePaymentClose,
  };

  const formattedTotalPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: paystackCurrency,
  }).format(totalPrice);

  const isFormValid = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  if (!isClient || isUserLoading || !user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="font-headline text-2xl font-bold">Loading Checkout...</h2>
          <p className="text-muted-foreground mt-2">Checking your authentication status.</p>
      </div>
    );
  }

  if (paymentState === 'processing') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="font-headline text-2xl font-bold">Finalizing Your Purchase...</h2>
          <p className="text-muted-foreground mt-2">Please do not close this window. You will be redirected shortly.</p>
      </div>
    )
  }

  if (cartCount === 0) {
     return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <p>Redirecting to store...</p>
      </div>
    );
  }

  const renderPaymentButton = () => {
    switch (selectedPaymentMethod) {
      case 'paystack':
        return isClient && (
          <PaystackButton
            {...componentProps}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            disabled={!isFormValid || totalPrice === 0 || !paystackPublicKey}
          />
        );
      case 'paypal':
        return <Button disabled className="w-full">PayPal Coming Soon</Button>;
      case 'skrill':
        return <Button disabled className="w-full">Skrill Coming Soon</Button>;
      default:
        return null;
    }
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
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <Accordion type="single" collapsible defaultValue="paystack" onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}>
              <AccordionItem value="paystack">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <CreditCard />
                    <span>Card & Mobile Money</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {renderPaymentButton()}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="paypal">
                <AccordionTrigger>
                   <div className="flex items-center gap-2">
                    <PayPalIcon className="h-6 w-6" />
                    <span>PayPal</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                   {renderPaymentButton()}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="skrill">
                <AccordionTrigger>
                   <div className="flex items-center gap-2">
                    <SkrillIcon className="h-6 w-6" />
                    <span>Skrill</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                   {renderPaymentButton()}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
