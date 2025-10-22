// @ts-ignore
// deno-lint-ignore-file
// deno-lint-ignore no-explicit-any
//
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from 'resend';

const RESEND_API_KEY = typeof Deno !== 'undefined' ? Deno.env.get('RESEND_API_KEY') : process.env.RESEND_API_KEY;
// IMPORTANT: Replace with an email from the domain you verified on Resend.
const FROM_EMAIL = 'welcome@hackura.store';

Deno.serve(async (req: Request) => {
  if (!RESEND_API_KEY) {
    console.error('FATAL: RESEND_API_KEY is not set in environment variables.');
    return new Response(JSON.stringify({ error: 'Server configuration error: Email service is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(RESEND_API_KEY);
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { email: to } = await req.json();
    if (!to) {
      return new Response(JSON.stringify({ error: '`email` field is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

    const { data, error } = await resend.emails.send({
        from: `Hackura <${FROM_EMAIL}>`,
        to,
        subject,
        html,
    });

    if (error) {
        // Provide more detailed logs for easier debugging in Supabase
        console.error('Resend API Error:', JSON.stringify(error, null, 2));
        return new Response(JSON.stringify({ 
            error: 'Failed to send welcome email.',
            details: error.message
        }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
     console.error('Server Error:', err);
     return new Response(JSON.stringify({ error: err.message || 'An internal server error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
})
