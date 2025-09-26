
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
import { Trash2, X } from 'lucide-react';
import ShareButton from '../products/share-button';
import Link from 'next/link';

export function CartSheetContent() {
  const { cartItems, removeFromCart, totalPrice, cartCount, clearCart } =
    useCart();

  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';

  const formattedTotalPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: paystackCurrency,
  }).format(totalPrice);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: paystackCurrency,
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
            <div className="space-y-4">
               <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formattedTotalPrice}</span>
              </div>
              
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </SheetClose>
            </div>
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
