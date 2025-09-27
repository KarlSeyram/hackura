import type { Ebook, Service, ContactRequest } from './definitions';
import { createAdminClient } from '@/lib/supabase/server';
import { PlaceHolderImages } from './placeholder-images';

export async function getEbooks() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("ebooks")
      .select("id, title, description, price, image_url");

    if (error) {
      console.error("Error fetching ebooks:", error);
      // If there's an error (like invalid credentials), fall back to mock data
      return ebooks;
    }

    // The data from supabase has image_url, but our Ebook type expects imageUrl.
    // We need to map the data to match the Ebook type.
    const fetchedEbooks: Ebook[] = data.map(ebook => ({
      id: ebook.id,
      title: ebook.title,
      description: ebook.description,
      price: ebook.price,
      imageUrl: ebook.image_url,
      imageHint: '', // imageHint is not in the DB, default to empty string
    }));

    return fetchedEbooks;
  } catch (e) {
    console.error("An unexpected error occurred while fetching ebooks:", e);
    return ebooks; // Fallback in case of any other unexpected error
  }
}


export const ebooks: Ebook[] = [
    {
      id: '1',
      title: 'Advanced Penetration Testing',
      description: 'A deep dive into advanced exploitation techniques, vulnerability analysis, and post-exploitation strategies used by ethical hackers.',
      price: 59.99,
      imageUrl: PlaceHolderImages[0].imageUrl,
      imageHint: PlaceHolderImages[0].imageHint,
    },
    {
      id: '2',
      title: 'Mastering Network Security',
      description: 'Learn to design, implement, and manage secure network architectures. Covers firewalls, IDS/IPS, VPNs, and secure network protocols.',
      price: 49.99,
      imageUrl: PlaceHolderImages[1].imageUrl,
      imageHint: PlaceHolderImages[1].imageHint,
    },
    {
      id: '3',
      title: 'Automate with Python',
      description: 'Unlock the power of Python for automating security tasks. From scripting network scans to building custom security tools.',
      price: 39.99,
      imageUrl: PlaceHolderImages[2].imageUrl,
      imageHint: PlaceHolderImages[2].imageHint,
    },
    {
      id: '4',
      title: 'Cryptography & Data Protection',
      description: 'An essential guide to modern cryptography, including symmetric/asymmetric encryption, hashing algorithms, and data-at-rest protection.',
      price: 45.0,
      imageUrl: PlaceHolderImages[3].imageUrl,
      imageHint: PlaceHolderImages[3].imageHint,
    },
     {
      id: '5',
      title: 'Cloud Security Fundamentals',
      description: 'Secure your cloud infrastructure. This book covers best practices for AWS, Azure, and GCP, focusing on identity management and secure configurations.',
      price: 55.0,
      imageUrl: PlaceHolderImages[4].imageUrl,
      imageHint: PlaceHolderImages[4].imageHint,
    },
    {
      id: '6',
      title: 'AI in Cybersecurity',
      description: 'Explore the revolutionary impact of artificial intelligence and machine learning on threat detection, malware analysis, and security operations.',
      price: 65.0,
      imageUrl: PlaceHolderImages[5].imageUrl,
      imageHint: PlaceHolderImages[5].imageHint,
    },
    {
      id: '7',
      title: 'Digital Forensics & Incident Response',
      description: 'Master the techniques for investigating security breaches. Learn about data acquisition, evidence preservation, and post-incident analysis.',
      price: 52.99,
      imageUrl: PlaceHolderImages[6].imageUrl,
      imageHint: PlaceHolderImages[6].imageHint,
    },
    {
      id: '8',
      title: 'The Blockchain Security Guide',
      description: 'A comprehensive overview of blockchain technology and the unique security challenges of decentralized applications and smart contracts.',
      price: 48.50,
      imageUrl: PlaceHolderImages[7].imageUrl,
      imageHint: PlaceHolderImages[7].imageHint,
    }
];

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
