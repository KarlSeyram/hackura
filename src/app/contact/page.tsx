'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitContactRequest } from '@/lib/actions';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  XIcon,
  WhatsAppIcon,
  FacebookIcon,
} from '@/components/icons';

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
  const [state, dispatch] = useFormState(submitContactRequest, initialState);
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
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          Contact Us
        </h1>
        <p className="text-muted-foreground">
          Have a question or want to work with us? Drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h3 className="font-headline text-xl font-semibold mb-3">
              Contact Information
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:cybershelf@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  cybershelf@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span>+233503274729</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-headline text-xl font-semibold mb-3">
              Business Hours
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <span>Monday - Friday: 9:00 AM - 5:00 PM</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-headline text-xl font-semibold mb-3">
              Follow Us
            </h3>
            <div className="flex items-center gap-4">
              <Link href="https://x.com/dorpe_karl" target="_blank" aria-label="X page">
                <XIcon className="h-6 w-6 fill-foreground transition-colors hover:fill-primary" />
              </Link>
              <Link href="https://wa.me/+233503274729" target="_blank" aria-label="WhatsApp">
                <WhatsAppIcon className="h-7 w-7 fill-foreground transition-colors hover:fill-primary" />
              </Link>
              <Link href="https://www.facebook.com/karlseyram" target="_blank" aria-label="Facebook page">
                <FacebookIcon className="h-6 w-6 fill-foreground transition-colors hover:fill-primary" />
              </Link>
            </div>
          </div>
        </div>

        <form action={dispatch} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your Name" />
              {state.errors?.name && (
                <p className="text-sm text-destructive">
                  {state.errors.name[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="service">Service of Interest</Label>
            <Select name="service">
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="penetration-testing">
                  Penetration Testing
                </SelectItem>
                <SelectItem value="security-architecture">
                  Security Architecture Review
                </SelectItem>
                <SelectItem value="incident-response">
                  Incident Response Retainer
                </SelectItem>
                <SelectItem value="custom-tech-solutions">
                  Custom Tech Solutions
                </SelectItem>
                <SelectItem value="academic-research-assistance">
                  Insightful Minds Research Hub
                </SelectItem>
                 <SelectItem value="basic-web-pentesting">
                  Basic Web Pentesting
                </SelectItem>
                <SelectItem value="graphic-design">
                  Graphic Designing
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Your message..."
              rows={6}
            />
            {state.errors?.message && (
              <p className="text-sm text-destructive">
                {state.errors.message[0]}
              </p>
            )}
          </div>
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
