
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center space-y-6 px-4 text-center">
      <AlertTriangle className="h-16 w-16 text-primary" />
      <h1 className="font-headline text-5xl font-bold tracking-tight">
        404 - Page Not Found
      </h1>
      <p className="max-w-md text-muted-foreground">
        Oops! The page you're looking for doesn't exist. It might have been
        moved, deleted, or you may have typed the address incorrectly.
      </p>
      <Button asChild size="lg">
        <Link href="/">Return to Homepage</Link>
      </Button>
    </div>
  );
}
