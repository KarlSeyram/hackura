
import { services } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        <div className="md:sticky top-24 h-fit space-y-6">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">Our Services</h1>
          <p className="text-xl text-muted-foreground">
            From proactive defense to custom development, we provide expert solutions to protect and empower your business.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>

        <div className="space-y-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Link key={service.id} href={`/services/${service.slug}`} className="group block">
                <Card 
                  className="p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="flex items-start gap-6">
                    <div className="rounded-lg bg-muted p-3 text-primary transition-colors duration-300 group-hover:bg-primary/10">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                        <CardHeader className="p-0">
                          <CardTitle className="font-headline text-2xl">{service.title}</CardTitle>
                        </CardHeader>
                        <CardDescription className="mt-2 text-base">
                          {service.shortDescription}
                        </CardDescription>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
