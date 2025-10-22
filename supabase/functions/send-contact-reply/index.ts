// @ts-ignore
// deno-lint-ignore-file
// deno-lint-ignore no-explicit-any
//
// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { Resend } from 'resend';

// IMPORTANT: Replace with your verified Resend domain email
const FROM_EMAIL = 'support@hackura.store';
const RESEND_API_KEY = typeof Deno !== 'undefined' ? Deno.env.get('RESEND_API_KEY') : process.env.RESEND_API_KEY;

interface ContactPayload {
  name: string;
  email: string;
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
    const payload: ContactPayload = await req.json();
    const { name, email: to } = payload;

    if (!name || !to) {
        return new Response(JSON.stringify({ error: '`name` and `email` are required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 2. Format email content
    const subject = 'We’ve Received Your Message | Hackura';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h1 style="color: #2C3E50;">Thank You, ${name}!</h1>
        <p>This is an automated confirmation that we have successfully received your message. Our team will review your inquiry and get back to you as soon as possible.</p>
        <p>If you need to add any more details, please reply directly to this email.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>The Hackura Team</strong></p>
      </div>
    `;

    // 3. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `Hackura Support <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API Error:', JSON.stringify(error, null, 2));
      return new Response(JSON.stringify({ error: 'Failed to send confirmation email', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ message: 'Auto-reply sent successfully', data }), {
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
