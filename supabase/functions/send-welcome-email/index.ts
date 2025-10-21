// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from 'resend';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
// IMPORTANT: Replace with an email from the domain you verified on Resend.
const FROM_EMAIL = 'welcome@hackura.store';

Deno.serve(async (req) => {
  const resend = new Resend(RESEND_API_KEY);
  // 1. Ensure the request is a POST request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 2. Extract the email from the request body
    const { email: to } = await req.json();
    if (!to) {
      return new Response(JSON.stringify({ error: '`email` field is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Define the email subject and HTML content with the discount code
    const subject = 'Welcome to Hackura! Here’s Your 20% Discount!';
    const html = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h1>Welcome to the Hackura Community!</h1>
        <p>Thank you for subscribing to our newsletter. We're thrilled to have you on board.</p>
        <p>As promised, here is your <strong>20% discount code</strong> for your next ebook purchase. Use the code below at checkout:</p>
        <h2 style="text-align: center; background-color: #f0f4f8; padding: 15px; border-radius: 8px; border: 1px solid #e0e6ec;">WELCOME20</h2>
        <p>Happy learning!</p>
        <br>
        <p><em>— The Hackura Team</em></p>
      </div>
    `;

    // 4. Send the email using the Resend API
    const { data, error } = await resend.emails.send({
        from: `Hackura <${FROM_EMAIL}>`,
        to,
        subject,
        html,
    });


    if (error) {
        console.error('Resend API Error:', error);
        return new Response(JSON.stringify(error), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
     console.error('Server Error:', err);
     return new Response(JSON.stringify({ error: 'An internal server error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
})
