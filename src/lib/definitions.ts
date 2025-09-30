import type { LucideIcon } from 'lucide-react';

export type Ebook = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  file_name?: string; // file_name can be optional on the base type
  category: string;
};

export type CartItem = Ebook & {
  quantity: number;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type ContactRequest = {
  id:string;
  name: string;
  email: string;
  service?: string;
  message: string;
  submittedAt: Date;
};

// Represents a generated link for a purchased item
export type PurchaseLink = {
  title: string;
  download_url: string;
};

// Represents a record from the 'purchases' table
export type Purchase = {
  id: string; // This will be the payment_ref from Paystack
  created_at: string;
  user_id?: string; // Optional user ID
  ebook_id: string;
  payment_ref: string;
};

export type Review = {
    id: string;
    ebookId: string;
    reviewer: string;
    rating: number;
    comment: string;
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
};
