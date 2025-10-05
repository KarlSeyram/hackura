
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CreditCard, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from '@/components/profile/profile-settings';
import { MyEbooksList } from '@/components/profile/my-ebooks-list';
import { Button } from '@/components/ui/button';

function PayPalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8.336 2.116c-2.028.21-3.793 1.15-5.002 2.805-.01.012-.015.028-.023.042C2.083 7.15.538 10.138.538 12.5c0 3.132 1.864 5.705 4.414 6.902.327.15.65.283.966.402.13.05.257.098.381.144.18.067.357.128.53.186 2.515.85 5.257.915 7.92-.185a.91.91 0 0 0 .185-.093c1.554-1.022 2.85-2.67 3.51-4.63.18-.54.324-1.1.442-1.675.053-.262.1-.526.143-.79.06-.37.09-.744.09-1.123 0-3.13-1.865-5.705-4.415-6.902-.326-.15-.65-.283-.966-.402-.13-.05-.257-.098-.38-.144a14.24 14.24 0 0 0-.53-.186c-2.516-.85-5.257-.915-7.92.185a.86.86 0 0 0-.185.093Zm11.83 4.965c-.24.734-1.003 1.25-1.88 1.25h-2.906c-2.246 0-3.618 1.48-3.95 3.596-.34 2.164.717 3.39 2.553 3.39 1.145 0 2-.693 2.22-1.88.24-.734 1-1.25 1.88-1.25h.84c.88 0 1.64.516 1.88 1.25.22 1.188-1.076 1.88-2.22 1.88-2.822 0-4.68-2.05-4.2-5.46.43-2.99 2.735-4.54 5.6-4.54h2.863c.88 0 1.64.516 1.88 1.25Z" />
    </svg>
  );
}

function SkrillIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.012 24c-1.32.016-2.614-.23-3.82-.72-1.23-.5-2.33-1.23-3.26-2.16-1.11-1.12-1.92-2.48-2.4-3.98-.44-1.4-.55-2.9-.3-4.38.25-1.48.84-2.88 1.71-4.11 1.03-1.42 2.4-2.59 3.99-3.4 1.6-.82 3.38-1.26 5.17-1.24 1.79.02 3.58.46 5.18 1.28 1.6.82 2.96 1.98 3.99 3.4 1.03 1.42 1.7 3.01 1.95 4.67.25 1.66-.02 3.36-.76 4.9-.74 1.53-1.93 2.84-3.4 3.78-1.46.94-3.14 1.5-4.86 1.62-.22.01-.45.02-.67.02zm-5.7-8.08c-.28.02-.55.1-.81.24-.43.23-.78.57-1 1-.33.43-.53.94-.58 1.47-.05.53.05 1.07.29 1.56.24.49.62.9 1.1 1.19.48.28.98.43 1.56.43.58 0 1.08-.15 1.56-.43.48-.29.86-.69 1.1-1.19.24-.49.34-1.03.29-1.56s-.25-1.04-.58-1.47c-.22-.43-.56-.77-1-1-.26-.14-.53-.22-.81-.24zm5.71 0c-.28.02-.55.1-.81.24-.43.23-.78.57-1.01 1-.33.43-.53.94-.58 1.47s.05 1.07.29 1.56c.24.49.62.9 1.1 1.19.48.28.98.43 1.56.43.58 0 1.08-.15 1.56-.43.48-.29.86-.69 1.1-1.19.24-.49.34-1.03.29-1.56s-.25-1.04-.58-1.47c-.22-.43-.56-.77-1-1-.26-.14-.53-.22-.81-.24zm5.7 0c-.28.02-.55.1-.81.24-.43.23-.78.57-1 1-.33.43-.53.94-.58 1.47s.05 1.07.29 1.56c.24.49.62.9 1.1 1.19.48.28.98.43 1.56.43.58 0 1.08-.15 1.56-.43.48-.29.86-.69 1.1-1.19.24-.49.34-1.03.29-1.56s-.25-1.04-.58-1.47c-.22-.43-.56-.77-1-1-.26-.14-.53-.22-.81-.24z" />
    </svg>
  );
}

function MtnIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z" />
      <path d="m154.2 144.38-20.06-34.75a3.89 3.89 0 0 0-6.79 0l-20.06 34.75a4 4 0 0 0 3.42 5.95h40.08a4 4 0 0 0 3.41-5.95Z" />
    </svg>
  );
}



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
                            <Button variant="outline" disabled>Change Password</Button>
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

    