// @ts-ignore
// deno-lint-ignore-file
// deno-lint-ignore no-explicit-any
//
// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js';
import { Resend } from 'npm:resend';

// IMPORTANT: Replace with your verified Resend domain email
const FROM_EMAIL = 'receipts@hackura.store';
// @ts-ignore
const RESEND_API_KEY = typeof Deno !== 'undefined' ? Deno.env.get('RESEND_API_KEY') : process.env.RESEND_API_KEY;

interface CartItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

interface PurchasePayload {
  userId: string;
  cartItems: CartItem[];
  paymentReference: string;
  finalPrice: number;
  discountCode?: string;
}

Deno.serve(async (req: Request) => {
  if (!RESEND_API_KEY) {
    console.error('FATAL: RESEND_API_KEY is not set in environment variables.');
    return new Response(JSON.stringify({ error: 'Server configuration error: Email service is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const resend = new Resend(RESEND_API_KEY);

  // 1. Basic validation
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload: PurchasePayload = await req.json();
    const { userId, cartItems, paymentReference, finalPrice } = payload;

    // 2. Initialize Supabase Admin Client to fetch user email
    // @ts-ignore
    const supabaseURL = typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_URL') : process.env.SUPABASE_URL;
    // @ts-ignore
    const supabaseServiceKey = typeof Deno !== 'undefined' ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') : process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = createClient(
      supabaseURL!,
      supabaseServiceKey!
    );

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, displayName')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error(`User not found for ID: ${userId}. Error: ${userError?.message}`);
    }

    const { email: to, displayName } = userData;

    // 3. Format email content
    const subject = `Your Hackura Order Confirmation (#${paymentReference})`;
    const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(finalPrice);
    // @ts-ignore
    const siteUrl = typeof Deno !== 'undefined' ? Deno.env.get('VERCEL_URL') : process.env.VERCEL_URL;
    const fullSiteUrl = siteUrl ? `https://${siteUrl}` : 'http://localhost:9002';


    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h1 style="color: #2C3E50; text-align: center;">Thank You for Your Order!</h1>
        <p>Hi ${displayName || 'there'},</p>
        <p>We've received your order and are getting it ready for you. You can access all your purchased ebooks anytime from your library.</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${fullSiteUrl}/my-ebooks" style="background-color: #2C3E50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">Go to My Library</a>
        </div>
        <h2 style="color: #2C3E50; border-bottom: 2px solid #F0F4F8; padding-bottom: 10px;">Order Summary</h2>
        <p><strong>Order ID:</strong> ${paymentReference}</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          ${cartItems.map(item => `
            <tr style="border-bottom: 1px solid #F0F4F8;">
              <td style="padding: 10px 0;">${item.title} (x${item.quantity})</td>
              <td style="padding: 10px 0; text-align: right;">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GHS' }).format(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </table>
        <p style="text-align: right; font-size: 1.2em; font-weight: bold; color: #2C3E50;">
          Total: ${formattedPrice}
        </p>
        <hr style="border: none; border-top: 1px solid #F0F4F8; margin: 20px 0;">
        <p style="font-size: 0.8em; color: #7f8c8d; text-align: center;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    // 4. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `Hackura Receipts <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API Error:', JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({ error: 'Failed to send receipt email', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ message: 'Receipt sent successfully', data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Function Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'An internal server error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
