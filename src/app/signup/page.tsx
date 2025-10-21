'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GoogleIcon } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { useFirebase } from '@/firebase/provider';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, type User as FirebaseUser } from 'firebase/auth';
import { createBrowserClient } from '@/lib/supabase/client';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';

const formSchema = z.object({
  displayName: z.string().min(2, {
    message: 'Display name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters long.',
  }),
});

export default function SignUpPage() {
  const router = useRouter();
  const { auth, user, isLoading: isUserLoading } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router]);

  const upsertUserProfile = async (user: FirebaseUser) => {
    const supabase = createBrowserClient();
    const { error } = await supabase.from('users').upsert({
      id: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    }, { onConflict: 'id' });

    if (error) {
      console.error('Error upserting user profile:', error);
      // Depending on the use case, you might want to handle this more gracefully
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    setIsLoading(true);
    setError(null);
    
    initiateEmailSignUp(auth, values.email, values.password);
  }

  async function handleGoogleSignIn() {
    if (!auth) return;
    setIsGoogleLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    signInWithPopup(auth, provider)
      .then(async (userCredential) => {
        await upsertUserProfile(userCredential.user);
        // Auth state listener will handle the redirect
      })
      .catch((error: any) => {
        setError(error.message);
        setIsGoogleLoading(false);
      });
  }
  
  if (isUserLoading || user) { // Keep loading screen while user state is resolving or if user exists
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {(isLoading || isGoogleLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            </Form>
             <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-5 w-5" />
              )}
              Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
