'use client';

import { useUser } from '@/firebase';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAuth, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters.' }),
});


export function ProfileSettings() {
  const { user, isUserLoading } = useUser();
  const auth = getAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });
  
  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;

    setIsUpdating(true);
    try {
      await updateProfile(user, {
        displayName: values.displayName,
      });
      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });
      // The useUser hook will trigger a re-render with the new info automatically
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


  if (isUserLoading || !user) {
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
            <Button type="submit" disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Profile
            </Button>
        </form>
        </Form>

    </div>
  );
}
