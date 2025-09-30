
import 'dotenv/config';
import type { Ebook, Service, ContactRequest, Review } from './definitions';
import { createAdminClient } from '@/lib/supabase/server';

export async function getEbooks(): Promise<Ebook[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ebooks")
    .select("id, title, description, price, image_url, category")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching ebooks from Supabase:", error.message);
    // Return empty array on error to prevent site crash
    return [];
  }

  // The data from supabase has image_url, but our Ebook type expects imageUrl.
  // We need to map the data to match the Ebook type.
  const fetchedEbooks: Ebook[] = data.map((ebook, index) => ({
    id: ebook.id,
    title: ebook.title,
    description: ebook.description, 
    price: ebook.price,
    imageUrl: ebook.image_url,
    imageHint: '', // Return an empty string as a fallback
    category: ebook.category || 'General',
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

export const contactRequests: ContactRequest[] = [];

const allReviews: Review[] = [
    { id: '1', ebookId: '1', reviewer: 'Alice', rating: 5, comment: 'This book was a game-changer! Highly recommended for anyone serious about ethical hacking.' },
    { id: '2', ebookId: '1', reviewer: 'Bob', rating: 4, comment: 'Great content, but a bit dense in some chapters. Overall, a valuable resource.' },
    { id: '3', ebookId: '2', reviewer: 'Charlie', rating: 5, comment: 'The best guide on network security I have ever read. Clear, concise, and practical.' },
];

export async function getReviewsForEbook(ebookId: string): Promise<Review[]> {
    // In a real app, this would fetch from a database.
    return allReviews.filter(review => review.ebookId === ebookId);
}

export async function submitReview(ebookId: string, rating: number, comment: string, reviewer: string) {
    // In a real app, you would save this to a database.
    console.log('New review submitted:', { ebookId, rating, comment, reviewer });
    const newReview: Review = {
        id: String(allReviews.length + 1),
        ebookId,
        reviewer,
        rating,
        comment,
    };
    allReviews.push(newReview); // For demonstration purposes
    return { success: true, message: 'Thank you for your review!' };
}
