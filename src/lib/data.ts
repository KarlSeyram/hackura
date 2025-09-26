import type { Ebook, Service, ContactRequest } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

export const ebooks: Ebook[] = [
  {
    id: '1',
    title: 'Ethical Hacking: A-Z',
    description:
      'Master ethical hacking and penetration testing from scratch. A comprehensive guide for beginners and intermediates.',
    price: 49.99,
    imageUrl: PlaceHolderImages.find(img => img.id === 'ebook-1')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'ebook-1')?.imageHint || '',
  },
  {
    id: '2',
    title: 'Advanced Network Security',
    description:
      'Deep dive into network security protocols, firewall configurations, and intrusion detection systems.',
    price: 69.99,
    imageUrl: PlaceHolderImages.find(img => img.id === 'ebook-2')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'ebook-2')?.imageHint || '',
  },
  {
    id: '3',
    title: 'Python for CyberOps',
    description: 'Automate security tasks and build powerful tools with Python. Learn scripting for the modern SOC.',
    price: 39.99,
    imageUrl: PlaceHolderImages.find(img => img.id === 'ebook-3')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'ebook-3')?.imageHint || '',
  },
  {
    id: '4',
    title: 'Cryptography Fundamentals',
    description:
      'Understand the core concepts of modern cryptography, from symmetric encryption to public key infrastructure.',
    price: 59.99,
    imageUrl: PlaceHolderImages.find(img => img.id === 'ebook-4')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'ebook-4')?.imageHint || '',
  },
  {
    id: '5',
    title: 'Cloud Security Engineering',
    description:
      'Secure your AWS, Azure, and GCP environments. A practical guide to cloud-native security.',
    price: 79.99,
    imageUrl: PlaceHolderImages.find(img => img.id === 'ebook-5')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'ebook-5')?.imageHint || '',
  },
  {
    id: '6',
    title: 'AI in Cybersecurity',
    description:
      'Explore how machine learning and AI are revolutionizing threat detection and response.',
    price: 89.99,
    imageUrl: PlaceHolderImages.find(img => img.id === 'ebook-6')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'ebook-6')?.imageHint || '',
  },
   {
    id: '7',
    title: 'Digital Forensics & Incident Response',
    description:
      'A complete guide to investigating security breaches and managing incidents effectively.',
    price: 65.99,
    imageUrl: PlaceHolderImages.find(img => img.id === 'ebook-7')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'ebook-7')?.imageHint || '',
  },
  {
    id: '8',
    title: 'Intro to Blockchain Security',
    description:
      'Learn the fundamentals of blockchain technology and how to secure decentralized applications.',
    price: 45.99,
    imageUrl: PlaceHolderImages.find(img => img.id === 'ebook-8')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'ebook-8')?.imageHint || '',
  },
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
