import type { LucideProps, LucideIcon } from 'lucide-react';
import type { FC } from 'react';

export type Ebook = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  file_name: string; 
  category: string;
  isDisabled: boolean;
};

export type CartItem = Ebook & {
  quantity: number;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: LucideIcon;
  pricing: {
    type: string;
    amount: string;
  };
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
  final_price: number;
  discount_code?: string;
};

export type Review = {
    id: string;
    ebookId: string;
    reviewer: string;
    rating: number;
    comment: string;
};

export type Discount = {
    id: string;
    code: string;
    discount_percent: number;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
};

export type Ad = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link: string;
  created_at: string;
  admin_id: string | null;
};
