
import type { LucideIcon } from 'lucide-react';

export type Ebook = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  file_name?: string; // file_name can be optional on the base type
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
  id: string;
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

// Represents a record from the 'purchases' table joined with 'ebooks'
export type PurchaseWithEbook = {
  id: string;
  payment_ref: string;
  created_at: string;
  ebooks: {
    id: string;
    title: string;
    file_name: string;
  } | null; // ebooks can be null if the join fails or no ebook is associated
};
