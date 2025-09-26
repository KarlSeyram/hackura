import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function UploadProductPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="font-headline text-3xl font-bold tracking-tight">Upload New Product</h2>
      <Card>
        <CardHeader>
          <CardTitle>New Ebook Details</CardTitle>
          <CardDescription>
            Fill out the form below to add a new ebook to the store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g., Advanced Network Security" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="A brief but engaging description of the ebook." rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" placeholder="e.g., 49.99" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Ebook Cover Image</Label>
              <Input id="image" type="file" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="file">Ebook File (e.g., PDF, EPUB)</Label>
              <Input id="file" type="file" />
            </div>
            <Button type="submit">Upload Product</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
