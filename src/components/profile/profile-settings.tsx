
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirebase } from '@/firebase/provider';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';


const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters.' }),
  age: z.coerce.number().min(0, 'Age must be a positive number.').optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
});


export function ProfileSettings() {
  const { user, auth, firestore, isLoading: isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const userDocRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      age: 0,
      country: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (user) {
        form.setValue('displayName', user.displayName || '');
    }
    if (userProfile) {
        form.setValue('age', userProfile.age || 0);
        form.setValue('country', userProfile.country || '');
        form.setValue('bio', userProfile.bio || '');
    }
  }, [user, userProfile, form]);
  
  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!auth?.currentUser || !firestore) return;

    setIsUpdating(true);
    try {
      // Update Auth display name
      if (values.displayName !== auth.currentUser.displayName) {
          await updateProfile(auth.currentUser, {
            displayName: values.displayName,
          });
      }

      // Update Firestore document
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        displayName: values.displayName,
        email: auth.currentUser.email,
        age: values.age,
        country: values.country,
        bio: values.bio
      }, { merge: true });

      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile.',
      });
    } finally {
      setIsUpdating(false);
    }
  }


  if (isUserLoading || isProfileLoading || !user) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
            <p className="text-xl font-semibold">{user.displayName || 'No display name'}</p>
            <p className="text-muted-foreground">{user.email}</p>
        </div>
        </div>
        
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                    <Input placeholder="Your display name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Your age" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Ghana" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Tell us a little about yourself" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

            <Button type="submit" disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Profile
            </Button>
        </form>
        </Form>

    </div>
  );
}
