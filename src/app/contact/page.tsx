'use client';

import { useActionState, useFormStatus } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitContactRequest } from '@/lib/actions';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
  
    return (
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Send Message
      </Button>
    );
}

export default function ContactPage() {
    const initialState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(submitContactRequest, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.message && Object.keys(state.errors).length === 0) {
          toast({
            title: 'Success!',
            description: state.message,
          });
        } else if (state.message) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: state.message,
            });
        }
      }, [state, toast]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground">
          Have a question or want to work with us? Drop us a line.
        </p>
      </div>

      <form action={dispatch} className="mt-10 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Your Name" />
          {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="your@email.com" />
           {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" placeholder="Your message..." rows={6} />
           {state.errors?.message && <p className="text-sm text-destructive">{state.errors.message[0]}</p>}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
