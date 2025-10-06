
import { notFound } from 'next/navigation';
import { services } from '@/lib/services-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = services.find(s => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  const IconComponent = service.icon;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
             <Button asChild variant="ghost">
                <Link href="/services" className="flex items-center gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back to All Services
                </Link>
             </Button>
        </div>

      <div className="space-y-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="rounded-lg bg-muted p-4 text-primary">
                <IconComponent className="h-12 w-8" />
            </div>
            <div className="flex-1">
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">{service.title}</h1>
            </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Service Description</CardTitle>
                </CardHeader>
                <CardContent className="text-lg text-muted-foreground space-y-6">
                    <p>{service.description}</p>
                </CardContent>
            </Card>
          </div>
          <div>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-6 w-6" />
                        Pricing
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{service.pricing.amount}</p>
                    <p className="text-sm text-muted-foreground">{service.pricing.type}</p>
                </CardContent>
             </Card>
          </div>
        </div>
        
        <div className="text-center py-8">
             <h2 className="text-2xl font-bold mb-4">Ready to secure your business?</h2>
             <p className="text-muted-foreground mb-6">Let's discuss how we can tailor our services to your needs.</p>
             <Button asChild size="lg">
                <Link href="/contact">Get a Custom Quote</Link>
            </Button>
        </div>

      </div>
    </div>
  );
}

// Generate static paths for all services
export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}
