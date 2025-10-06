import type { Service } from './definitions';
import { Code, LayoutGrid, ShieldCheck, Siren, FileText, ShieldAlert, Palette, Globe } from 'lucide-react';

export const services: Service[] = [
  {
    id: '1',
    slug: 'penetration-testing',
    title: 'Penetration Testing',
    shortDescription: 'Simulating real-world attacks to identify and mitigate vulnerabilities in your applications and network.',
    description: 'We perform in-depth security assessments to identify and mitigate vulnerabilities in your web applications, mobile apps, and network infrastructure. Our certified experts simulate real-world attacks to provide actionable insights.',
    icon: ShieldCheck,
    pricing: {
      type: 'Project-Based',
      amount: 'Starting at GH₵20,000'
    }
  },
  {
    id: '2',
    slug: 'security-architecture',
    title: 'Security Architecture Review',
    shortDescription: 'Ensuring security is baked into your systems from the ground up, from cloud to on-premise.',
    description: 'Our team will review your system architecture, from cloud environments to on-premise solutions, ensuring that security is baked in from the ground up. We help you build resilient and secure systems.',
    icon: LayoutGrid,
    pricing: {
      type: 'Hourly',
      amount: 'GH₵3,750/hour'
    }
  },
  {
    id: '3',
    slug: 'incident-response',
    title: 'Incident Response Retainer',
    shortDescription: 'Our team is on standby 24/7 to help you contain, eradicate, and recover from security breaches.',
    description: 'Be prepared for the worst. Our incident response team is on standby 24/7 to help you contain, eradicate, and recover from security breaches, minimizing damage and downtime.',
    icon: Siren,
     pricing: {
      type: 'Monthly Retainer',
      amount: 'Contact us for a custom quote'
    }
  },
  {
    id: '4',
    slug: 'custom-tech-solutions',
    title: 'Custom Tech Solutions',
    shortDescription: 'Building custom software and technology solutions to meet your specific business needs.',
    description: 'Beyond security, we build custom software and technology solutions to meet your business needs. From automation scripts to full-stack applications, our developers deliver high-quality code.',
    icon: Code,
    pricing: {
      type: 'Project-Based',
      amount: 'Varies based on scope'
    }
  },
   {
    id: '5',
    slug: 'academic-research-assistance',
    title: 'Insightful Minds Research Hub',
    shortDescription: 'Expert research and assignment assistance to help you excel academically, from basic inquiries to advanced projects.',
    description: 'Struggling with a tough assignment? Our research experts provide comprehensive support, from topic brainstorming and literature reviews to data analysis and final write-ups. We offer tailored assistance to ensure your work is well-researched and high-quality.',
    icon: FileText,
    pricing: {
      type: 'Tiered Flat Rate',
      amount: 'GH₵100 for Basic, Custom quotes for Advanced'
    }
  },
  {
    id: '6',
    slug: 'basic-web-pentesting',
    title: 'Basic Web Pentesting',
    shortDescription: 'A focused security check-up for your website to find and fix common vulnerabilities quickly and affordably.',
    description: 'Get a quick and affordable security health check for your website. Our basic web pentesting service focuses on identifying the most common and critical vulnerabilities, such as SQL injection and XSS, providing you with a clear report to secure your online presence.',
    icon: ShieldAlert,
    pricing: {
      type: 'Flat Fee',
      amount: 'GH₵500'
    }
  },
  {
    id: '7',
    slug: 'graphic-design',
    title: 'Graphic Designing',
    shortDescription: 'Creative and professional graphic design services to bring your brand and ideas to life, from logos to marketing materials.',
    description: 'Elevate your brand with stunning visuals. We offer a full range of graphic design services, including logo design, branding packages, marketing materials, social media graphics, and more. Our creative team works with you to bring your vision to life.',
    icon: Palette,
    pricing: {
      type: 'Negotiable',
      amount: 'Contact for a custom quote'
    }
  },
  {
    id: '8',
    slug: 'website-development',
    title: 'Website Development',
    shortDescription: 'Professional website design and development to establish your online presence.',
    description: 'From simple landing pages to complex e-commerce sites, we build beautiful, fast, and responsive websites that meet your business goals. Our development process is focused on quality, performance, and user experience.',
    icon: Globe,
    pricing: {
        type: 'Project-Based',
        amount: 'Starting at GH₵1,000'
    }
  }
];
