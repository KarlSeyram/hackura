
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdBannerProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export default function AdBanner({ title, description, ctaText, ctaLink }: AdBannerProps) {
  return (
    <div className="relative w-full rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <Badge variant="secondary" className="absolute -top-2 left-4">Sponsored</Badge>
      <div className="flex-1 text-center md:text-left">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Button asChild className="flex-shrink-0">
        <a href={ctaLink} target="_blank" rel="noopener noreferrer">
          {ctaText}
        </a>
      </Button>
    </div>
  );
}
