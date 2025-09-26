import type { LucideIcon } from 'lucide-react';

export type Ebook = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
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
  message: string;
  submittedAt: Date;
};
