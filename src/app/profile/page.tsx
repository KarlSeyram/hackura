
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, Mail, Gift, Globe, Phone, Pencil } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MyEbooksList } from '@/components/profile/my-ebooks-list';
import { ChangePasswordDialog } from '@/components/profile/change-password-dialog';
import { DeleteAccountDialog } from '@/components/profile/delete-account-dialog';
import { useFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

function ProfileInfoDisplay() {
    const { user, firestore, isLoading: isUserLoading } = useFirebase();

    const userDocRef = useMemo(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);
    
    if (isUserLoading || isProfileLoading || !user) {
        return (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }
    
    const profileItems = [
        { icon: User, label: "Display Name", value: user.displayName },
        { icon: Mail, label: "Email", value: user.email },
        { icon: Gift, label: "Age", value: userProfile?.age },
        { icon: Globe, label: "Country", value: userProfile?.country },
        { icon: Phone, label: "Phone", value: userProfile?.phoneNumber },
    ];


    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-bold">{user.displayName}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profileItems.map(item => (
                    item.value ? (
                        <div key={item.label} className="flex items-start gap-4">
                            <item.icon className="h-5 w-5 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-sm text-muted-foreground">{item.label}</p>
                                <p className="font-medium">{item.value}</p>
                            </div>
                        </div>
                    ) : null
                ))}
            </div>
             {userProfile?.bio && (
                <div>
                    <h3 className="font-semibold mb-2">Bio</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{userProfile.bio}</p>
                </div>
            )}
        </div>
    );
}


export default function ProfilePage() {
  const { user, isLoading: isUserLoading } = useFirebase();
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
        <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl font-bold tracking-tight">My Account</h1>
                <p className="text-muted-foreground">Manage your account settings, orders, and profile information.</p>
            </div>
            <Button asChild variant="outline">
                <Link href="/profile/edit">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                </Link>
            </Button>
        </div>
        <Tabs defaultValue="my-ebooks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="my-ebooks">My Ebooks</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
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
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>This is your public profile information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ProfileInfoDisplay />
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
                         <div className="space-y-2 rounded-lg border border-destructive p-4">
                            <h3 className="font-medium text-destructive">Danger Zone</h3>
                            <p className="text-sm text-muted-foreground">Deleting your account is permanent and cannot be undone. All your purchased ebooks and data will be lost.</p>
                            <DeleteAccountDialog />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
