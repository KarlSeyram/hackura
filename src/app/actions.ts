
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import type { CartItem } from '@/lib/definitions';

// This function records a purchase in the database after a successful payment.
export async function recordPurchase(cartItems: CartItem[], paymentReference: string) {
  const supabase = createAdminClient();

  const purchaseRecords = cartItems.map(item => ({
    ebook_id: item.id,
    payment_ref: paymentReference,
    // In a real app, you'd get the user_id from the current session
    // user_id: userId, 
  }));

  if (purchaseRecords.length > 0) {
    const { error: insertError } = await supabase
      .from('purchases')
      .insert(purchaseRecords);

    if (insertError) {
      console.error('Error inserting purchase records:', insertError);
      // Depending on the desired behavior, you might want to throw an error
      // or handle it gracefully.
      return { success: false, error: insertError };
    }
  }
  
  return { success: true };
}
