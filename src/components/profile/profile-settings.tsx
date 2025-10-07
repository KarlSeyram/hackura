
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
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';
import { nonBlockingSetDoc } from '@/firebase/non-blocking-updates';


const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters.' }),
  age: z.coerce.number().min(0, 'Age must be a positive number.').optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  countryCode: z.string().optional(),
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
      phoneNumber: '',
      countryCode: '',
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
        
        const fullPhoneNumber = userProfile.phoneNumber || '';
        const countryCodeMatch = fullPhoneNumber.match(/^(\+\d+)/);

        if (countryCodeMatch) {
            const countryCode = countryCodeMatch[1];
            const number = fullPhoneNumber.substring(countryCode.length).trim();
            form.setValue('countryCode', countryCode);
            form.setValue('phoneNumber', number);
        } else {
            form.setValue('phoneNumber', fullPhoneNumber);
        }
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

      const fullPhoneNumber = values.countryCode && values.phoneNumber 
          ? `${values.countryCode}${values.phoneNumber}` 
          : values.phoneNumber;

      // Update Firestore document
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      const dataToSave = {
        displayName: values.displayName,
        email: auth.currentUser.email,
        age: values.age,
        country: values.country,
        bio: values.bio,
        phoneNumber: fullPhoneNumber,
      };

      nonBlockingSetDoc(userRef, dataToSave, { merge: true });

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
             <div className="space-y-2">
                <FormLabel>Phone Number</FormLabel>
                <div className="flex gap-2">
                    <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                        <FormItem className="w-1/3">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-64">
                            {countries.map(country => (
                                <SelectItem key={country.code} value={country.dial_code}>
                                {country.code} ({country.dial_code})
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormControl>
                            <Input type="tel" placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>
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
