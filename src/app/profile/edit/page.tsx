
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditProfilePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
             <Button asChild variant="ghost">
                <Link href="/profile" className="flex items-center gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Profile
                </Link>
             </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your public profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ProfileSettings />
            </CardContent>
        </Card>
    </div>
  );
}

