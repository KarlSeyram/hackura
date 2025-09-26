import Link from 'next/link';
import { XIcon, WhatsAppIcon } from '@/components/icons';
import { Book } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Book className="h-6 w-6 text-primary" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CyberShelf. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" aria-label="X page">
            <XIcon className="h-5 w-5 fill-foreground transition-colors hover:fill-primary" />
          </Link>
          <Link href="#" aria-label="WhatsApp">
            <WhatsAppIcon className="h-6 w-6 fill-foreground transition-colors hover:fill-primary" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
