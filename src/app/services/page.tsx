import { services } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code, LayoutGrid, ShieldCheck, Siren } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const iconMap: { [key: string]: React.FC<LucideProps> } = {
  'shield-check': ShieldCheck,
  'layout-grid': LayoutGrid,
  siren: Siren,
  code: Code,
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Our Services</h1>
        <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
          Expert solutions in cybersecurity and technology to protect and empower your business.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {services.map(service => {
          const IconComponent = iconMap[service.icon];
          return (
            <Card key={service.id} className="flex flex-col items-start p-6 transition-all hover:shadow-md">
              <div className="mb-4 rounded-lg bg-primary/10 p-3 text-primary">
                {IconComponent && <IconComponent className="h-8 w-8" />}
              </div>
              <CardHeader className="p-0">
                <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardDescription className="mt-2 text-base flex-1">
                {service.description}
              </CardDescription>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
