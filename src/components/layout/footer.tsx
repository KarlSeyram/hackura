
import Link from 'next/link';
import { XIcon, WhatsAppIcon, FacebookIcon } from '@/components/icons';

const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/store', label: 'Store' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
];

export default function Footer() {
  return (
    <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <Link href="/" className="font-headline text-xl font-bold">
                        Hackura
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        Your one-stop shop for tech and cybersecurity ebooks and services.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        {quickLinks.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Follow Us</h3>
                    <div className="flex items-center gap-4">
                         <Link href="https://x.com/dorpe_karl" target="_blank" aria-label="X page">
                            <XIcon className="h-6 w-6 fill-foreground transition-colors hover:fill-primary" />
                        </Link>
                        <Link href="https://wa.me/+233503274729" target="_blank" aria-label="WhatsApp">
                            <WhatsAppIcon className="h-7 w-7 fill-foreground transition-colors hover:fill-primary" />
                        </Link>
                         <Link href="https://www.facebook.com/karlseyram" target="_blank" aria-label="Facebook page">
                            <FacebookIcon className="h-6 w-6 fill-foreground transition-colors hover:fill-primary" />
                        </Link>
                    </div>
                </div>
            </div>
             <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Hackura. All rights reserved.</p>
            </div>
        </div>
    </footer>
  );
}
