
import 'dotenv/config';
import type { Ebook, Service, ContactRequest } from './definitions';
import { createAdminClient } from '@/lib/supabase/server';

export async function getEbooks(): Promise<Ebook[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ebooks")
    .select("id, title, description, price, image_url")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ebooks from Supabase:", error.message);
    // In production, you might want to throw a more user-friendly error or handle it gracefully.
    // For debugging, throwing the actual error is helpful.
    throw new Error(`Failed to fetch ebooks from the database. Supabase error: ${error.message}`);
  }

  // The data from supabase has image_url, but our Ebook type expects imageUrl.
  // We need to map the data to match the Ebook type.
  const fetchedEbooks: Ebook[] = data.map(ebook => ({
    id: ebook.id,
    title: ebook.title,
    description: ebook.description, 
    price: ebook.price,
    imageUrl: ebook.image_url,
    imageHint: '', // Return an empty string as a fallback
  }));

  return fetchedEbooks;
}


export const services: Service[] = [
  {
    id: '1',
    title: 'Penetration Testing',
    description: 'We perform in-depth security assessments to identify and mitigate vulnerabilities in your web applications, mobile apps, and network infrastructure. Our certified experts simulate real-world attacks to provide actionable insights.',
    icon: 'shield-check',
  },
  {
    id: '2',
    title: 'Security Architecture Review',
    description: 'Our team will review your system architecture, from cloud environments to on-premise solutions, ensuring that security is baked in from the ground up. We help you build resilient and secure systems.',
    icon: 'layout-grid',
  },
  {
    id: '3',
    title: 'Incident Response Retainer',
    description: 'Be prepared for the worst. Our incident response team is on standby 24/7 to help you contain, eradicate, and recover from security breaches, minimizing damage and downtime.',
    icon: 'siren',
  },
  {
    id: '4',
    title: 'Custom Tech Solutions',
    description: 'Beyond security, we build custom software and technology solutions to meet your business needs. From automation scripts to full-stack applications, our developers deliver high-quality code.',
    icon: 'code',
  },
];

export const contactRequests: ContactRequest[] = [
    {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        message: 'I am interested in a penetration test for my e-commerce website. Could you provide a quote?',
        submittedAt: new Date('2023-10-26T10:00:00Z'),
    },
    {
        id: '2',
        name: 'Bob Williams',
        email: 'bob.w@example.com',
        message: 'We need help with a security architecture review for our new cloud platform. What is your availability?',
        submittedAt: new Date('2023-10-25T14:30:00Z'),
    },
    {
        id: '3',
        name: 'Charlie Brown',
        email: 'charlie.b@example.com',
        message: 'I have a question about your custom tech solutions. Can we schedule a call to discuss our project?',
        submittedAt: new Date('2023-10-24T09:15:00Z'),
    },
];


