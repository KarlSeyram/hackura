
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createAd } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Ad...
        </>
      ) : (
        'Create Ad'
      )}
    </Button>
  );
}

type FormErrors = {
  title?: string[];
  description?: string[];
  link?: string[];
  image?: string[];
};

type FormState = {
  message: string;
  errors: FormErrors;
};

export default function AdsManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const initialState: FormState = { message: '', errors: {} };
  const [state, formAction] = useFormState(createAd, initialState);


  useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors).length > 0) {
        toast({
          variant: 'destructive',
          title: 'Ad Creation Failed',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success!',
          description: state.message,
        });
        formRef.current?.reset();
        router.refresh();
      }
    }
  }, [state, toast, router]);


  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex-1 space-y-4">
        <h2 className="font-headline text-3xl font-bold tracking-tight">Manage Ads</h2>
        <Card>
          <CardHeader>
            <CardTitle>Create New Ad</CardTitle>
            <CardDescription>
              Fill out the form below to create a new advertisement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Ad Title</Label>
                <Input id="title" name="title" placeholder="e.g., Summer Sale on All Ebooks" />
                {state.errors?.title?.[0] && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="A short, catchy description for the ad." rows={3} />
                {state.errors?.description?.[0] && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="link">Link URL</Label>
                <Input id="link" name="link" type="url" placeholder="https://example.com/promotion" />
                {state.errors?.link?.[0] && <p className="text-sm text-destructive">{state.errors.link[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Ad Image</Label>
                <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
                 {state.errors?.image?.[0] && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
              </div>

              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
