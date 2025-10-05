'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from '@/components/profile/profile-settings';
import { MyEbooksList } from '@/components/profile/my-ebooks-list';
import { Button } from '@/components/ui/button';
import { PayPalIcon, SkrillIcon, MtnIcon } from '@/components/icons';
import { ChangePasswordDialog } from '@/components/profile/change-password-dialog';


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-2 mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight">My Account</h1>
            <p className="text-muted-foreground">Manage your account settings, orders, and profile information.</p>
        </div>
        <Tabs defaultValue="my-ebooks" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="my-ebooks">My Ebooks</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="payment">Payment Methods</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="my-ebooks">
                <Card>
                    <CardHeader>
                        <CardTitle>My Ebooks</CardTitle>
                        <CardDescription>All your purchased ebooks in one place. Download them anytime.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <MyEbooksList />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="profile">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>View and manage your public profile information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ProfileSettings />
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="payment">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Manage your saved payment methods for faster checkout.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="rounded-lg border bg-card text-card-foreground">
                            <div className="p-6">
                                <h3 className="font-semibold mb-4">Saved Methods</h3>
                                <div className="text-center text-sm text-muted-foreground py-8">
                                    <p>You have no saved payment methods.</p>
                                </div>
                            </div>
                            <div className="border-t p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium">We accept:</span>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CreditCard className="h-6 w-6" title="Mastercard" />
                                        <PayPalIcon className="h-6 w-6" title="PayPal" />
                                        <SkrillIcon className="h-6 w-6" title="Skrill" />
                                        <MtnIcon className="h-7 w-7" title="MTN Mobile Money" />
                                    </div>
                                </div>
                                <Button disabled>Add New Method</Button>
                            </div>
                       </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="settings">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Manage your account preferences and security.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="font-medium">Change Password</h3>
                            <p className="text-sm text-muted-foreground">It's a good idea to use a strong password that you're not using elsewhere.</p>
                            <ChangePasswordDialog />
                        </div>
                         <div className="space-y-2">
                            <h3 className="font-medium">Danger Zone</h3>
                            <p className="text-sm text-muted-foreground">Deleting your account is permanent and cannot be undone.</p>
                            <Button variant="destructive" disabled>Delete My Account</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
