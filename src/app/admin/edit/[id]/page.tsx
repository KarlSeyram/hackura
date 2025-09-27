'use client';

import { notFound } from 'next/navigation';
import { ebooks } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import React from 'react';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);
  const product = ebooks.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="font-headline text-3xl font-bold tracking-tight">Edit Product</h2>
      <Card>
        <CardHeader>
          <CardTitle>Editing: {product.title}</CardTitle>
          <CardDescription>
            Make changes to the product details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" defaultValue={product.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" defaultValue={product.description} rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" defaultValue={product.price} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Ebook Cover Image</Label>
              <Input id="image" type="file" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="file">Ebook File (e.g., PDF, EPUB)</Label>
              <Input id="file" type="file" />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
