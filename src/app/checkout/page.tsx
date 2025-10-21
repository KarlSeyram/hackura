
'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { PaystackButton } from 'react-paystack';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import type { OnApproveData, CreateOrderData } from '@paypal/paypal-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Loader2, CreditCard, Tag, X, LogIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { recordPurchase, applyDiscount } from '@/app/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MtnIcon, GoogleIcon } from '@/components/icons';
import { useFirebase } from '@/firebase/provider';
import * as ga from '@/lib/ga';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';


function UserInfoForm({ onFormChange, initialName, initialEmail }: { onFormChange: (name: string, email: string, isValid: boolean) => void, initialName: string, initialEmail: string }) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    // When initial values change (e.g. user loads), update the form state
    setName(initialName);
    setEmail(initialEmail);
    validateAndNotify(initialName, initialEmail);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName, initialEmail]);


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleBlur = () => {
    validateAndNotify(name, email);
  };

  const validateAndNotify = (currentName: string, currentEmail: string) => {
    const isValid = currentName.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail);
    onFormChange(currentName, currentEmail, isValid);
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={handleNameChange} 
          onBlur={handleBlur}
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
          onChange={handleEmailChange}
          onBlur={handleBlur}
          placeholder="you@example.com"
          required
        />
      </div>
    </div>
  );
}


export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart, cartCount } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { auth, user, isLoading: isUserLoading } = useFirebase();

  const [isClient, setIsClient] = useState(false);
  const [paymentState, setPaymentState] = useState<'idle' | 'processing'>('idle');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [usdPrice, setUsdPrice] = useState(0);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const discountedPrice = discount ? totalPrice * (1 - discount.percent / 100) : totalPrice;


  useEffect(() => {
    setIsClient(true);
    // A simple, static conversion rate. In a real-world app, you'd fetch this from an API.
    const GHS_TO_USD_RATE = 0.067;
    setUsdPrice(discountedPrice * GHS_TO_USD_RATE);
  }, [discountedPrice]);

  useEffect(() => {
    if (isClient && !isUserLoading) {
      if (cartCount === 0 && paymentState === 'idle') {
        toast({
          title: 'Your Cart is Empty',
          description: 'Redirecting you to the store to add some items.',
        });
        router.push('/store');
      }
    }
  }, [isClient, isUserLoading, cartCount, router, toast, paymentState]);

  useEffect(() => {
    if (user && !user.isAnonymous) {
      const initialName = user.displayName || '';
      const initialEmail = user.email || '';
      setName(initialName);
      setEmail(initialEmail);
      // Directly validate the initial user data
      const isValid = initialName.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(initialEmail);
      setIsFormValid(isValid);
    }
  }, [user]);

  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';
  
  const handleFormChange = (newName: string, newEmail: string, isValid: boolean) => {
    setName(newName);
    setEmail(newEmail);
    setIsFormValid(isValid);
  };


  const handleGenericPaymentSuccess = (reference: string) => {
     if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not find a user account for this purchase.',
      });
      return;
    }

    ga.event('purchase', {
      currency: paystackCurrency,
      value: discountedPrice,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    console.log('Payment successful. Ref:', reference);
    setPaymentState('processing');
    toast({
      title: 'Payment Successful!',
      description: 'Redirecting to your downloads...',
    });

    clearCart();
    router.push(`/download/${reference}`);
  };

  const handlePaymentSuccess = async (reference: any) => {
    try {
      if (!user) throw new Error('User not authenticated for purchase recording.');
      await recordPurchase({
        userId: user.uid,
        cartItems,
        paymentReference: reference.reference,
        finalPrice: discountedPrice,
        discountCode: discount?.code,
      });
      handleGenericPaymentSuccess(reference.reference);
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

  const handlePaypalPaymentSuccess = async (details: any) => {
    try {
      if (!user) throw new Error('User not authenticated for purchase recording.');
      await recordPurchase({
        userId: user.uid,
        cartItems,
        paymentReference: details.id,
        finalPrice: discountedPrice,
        discountCode: discount?.code,
      });
      handleGenericPaymentSuccess(details.id);
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

  const handlePaymentError = (err: any) => {
    // The user closing the window is not a real error, so we don't show a toast.
    if (err && err.message && err.message.includes('Window closed')) {
        console.log("Payment window closed by user.");
        return;
    }
    console.error("Payment Error:", err);
    toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "An error occurred with the transaction. Please try again.",
    });
    setPaymentState('idle');
  };

  const handlePaymentClose = () => {
    console.log('Payment dialog closed.');
    setPaymentState('idle');
  }

  const handleApplyDiscount = async () => {
    if (!promoCode) return;
    setIsApplyingDiscount(true);
    const result = await applyDiscount(promoCode);
    if (result.success && result.discount) {
      setDiscount({ code: result.discount.code, percent: result.discount.percent });
      toast({
        title: 'Discount Applied!',
        description: `${result.discount.percent}% off your order.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: result.message,
      });
      setDiscount(null);
    }
    setIsApplyingDiscount(false);
  };

  const removeDiscount = () => {
    setDiscount(null);
    setPromoCode('');
    toast({
      title: 'Discount Removed',
      description: 'The promo code has been removed from your order.',
    });
  };

  const paystackComponentProps = {
    email,
    amount: Math.round(discountedPrice * 100),
    currency: paystackCurrency,
    reference: `hackura_paystack_${new Date().getTime()}`,
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: name,
        },
        {
          display_name: "User ID",
          variable_name: "user_id",
          value: user?.uid || "",
        },
        {
          display_name: "Cart Items",
          variable_name: "cart_items",
          value: JSON.stringify(cartItems.map(item => ({ id: item.id, title: item.title, quantity: item.quantity }))),
        },
        {
          display_name: "Discount Code",
          variable_name: "discount_code",
          value: discount?.code || "",
        },
        {
          display_name: "Final Price",
          variable_name: "final_price",
          value: discountedPrice,
        }
      ]
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

  const formattedDiscountedPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: paystackCurrency,
  }).format(discountedPrice);

  if (paymentState === 'processing') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="font-headline text-2xl font-bold">Finalizing Your Purchase...</h2>
          <p className="text-muted-foreground mt-2">Please do not close this window. You will be redirected shortly.</p>
      </div>
    )
  }

  if (cartCount === 0 && isClient) {
     return (
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <p>Redirecting to store...</p>
      </div>
    );
  }

  return (
   <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
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
          <div className="mt-6 border-t pt-4 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formattedTotalPrice}</span>
            </div>
             {discount && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount ({discount.percent}%)</span>
                <span className="text-green-600">- {new Intl.NumberFormat(undefined, { style: 'currency', currency: paystackCurrency }).format(totalPrice - discountedPrice)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formattedDiscountedPrice}</span>
            </div>
          </div>
        </div>

        <div>
           {isUserLoading ? (
               <div className="flex items-center justify-center rounded-lg border bg-muted/50 p-6 h-full">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin"/>
               </div>
           ) : user ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="space-y-6">
                <UserInfoForm 
                  onFormChange={handleFormChange}
                  initialName={user?.displayName || ''}
                  initialEmail={user?.email || ''}
                />

                {!discount ? (
                  <div className="flex items-end gap-2">
                    <div className="flex-grow space-y-2">
                      <Label htmlFor="promo-code">Promo Code</Label>
                      <Input 
                        id="promo-code" 
                        placeholder="Enter code" 
                        value={promoCode} 
                        onChange={e => setPromoCode(e.target.value)} 
                        disabled={isApplyingDiscount}
                      />
                    </div>
                    <Button onClick={handleApplyDiscount} disabled={!promoCode || isApplyingDiscount}>
                      {isApplyingDiscount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
                    <div className="flex items-center gap-2 font-medium text-green-600">
                        <Tag className="h-4 w-4"/>
                        <span>Code "{discount.code}" applied!</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={removeDiscount}>
                        <X className="h-4 w-4"/>
                    </Button>
                  </div>
                )}
                
                <Accordion type="single" collapsible defaultValue="paystack" className="w-full">
                    <AccordionItem value="paystack">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                <CreditCard />
                                <span>Card & Mobile Money (GHS)</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                            {isClient && (
                              <Button
                                  asChild
                                  className="w-full"
                                  disabled={!isFormValid || discountedPrice <= 0 || !paystackPublicKey}
                                >
                                  <PaystackButton
                                    {...paystackComponentProps}
                                    className="w-full h-full disabled:cursor-not-allowed"
                                  />
                                </Button>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="paypal">
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-[#00457C]"><title>PayPal</title><path d="M7.076 21.337H2.478L.002 3.141h4.943c.319 0 .618.17.787.45l2.426 3.863c.17.28.469.45.787.45h2.153c2.934 0 5.103 2.122 5.103 4.965 0 2.51-1.745 4.312-4.148 4.887l-2.404.576h-.697c-.304 0-.583.178-.737.458l-2.098 3.342zm11.751-13.076l-2.262 13.076H9.363l2.26-13.076h7.204z"/></svg>
                                <span>Pay with PayPal (USD)</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                            {isClient && isFormValid && usdPrice > 0 && paypalClientId && paypalClientId !== 'test' ? (
                              <PayPalButtons
                                style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                                disabled={!isFormValid || usdPrice <= 0}
                                createOrder={(data: CreateOrderData, actions) => {
                                    return actions.order.create({
                                      intent: "CAPTURE",
                                      purchase_units: [
                                        {
                                          amount: {
                                            value: usdPrice.toFixed(2),
                                            currency_code: 'USD',
                                          },
                                          description: 'Hackura Ebook Purchase',
                                        },
                                      ],
                                    });
                                }}
                                onApprove={async (data: OnApproveData, actions) => {
                                  if (actions.order) {
                                    const details = await actions.order.capture();
                                    await handlePaypalPaymentSuccess(details);
                                  } else {
                                    toast({
                                      variant: "destructive",
                                      title: "PayPal Error",
                                      description: "Could not finalize PayPal transaction.",
                                    });
                                  }
                                }}
                                onError={(err) => {
                                    console.error("PayPal Error:", err);
                                    toast({
                                        variant: "destructive",
                                        title: "PayPal Error",
                                        description: "An error occurred with the PayPal transaction. Please try again.",
                                    });
                                }}
                              />
                            ) : (
                              <p className="text-sm text-center text-muted-foreground">PayPal is not configured or the amount is too low for USD transaction.</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/store">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Continue Shopping
                  </Link>
              </Button>
              </div>
            </>
           ) : (
             <Card className="flex flex-col items-center justify-center text-center p-8 h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LogIn /> Please Log In</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">You need an account to complete your purchase. Please log in or create a new account.</p>
                    <div className="flex gap-4 justify-center">
                        <Button asChild><Link href="/login">Log In</Link></Button>
                        <Button asChild variant="secondary"><Link href="/signup">Sign Up</Link></Button>
                    </div>
                </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
   </PayPalScriptProvider>
  );
}
