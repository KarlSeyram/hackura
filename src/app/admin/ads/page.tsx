
'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, Pen, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateAd, deleteAd } from '@/lib/actions';
import { createAdminClient } from '@/lib/supabase/server';
import type { Ad } from '@/lib/definitions';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditMode ? 'Save Changes' : 'Create Ad'}
    </Button>
  );
}

type FormState = {
  message: string;
  errors?: {
    title?: string[];
    link?: string[];
    image_url?: string[];
  }
};

function AdForm({ ad, onFinished }: { ad?: Ad, onFinished: () => void }) {
  const { toast } = useToast();
  const isEditMode = !!ad;
  
  const initialState: FormState = { message: '', errors: {} };
  const [state, dispatch] = useFormState(createOrUpdateAd, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      } else {
        toast({ title: 'Success!', description: state.message });
        onFinished();
      }
    }
  }, [state, toast, onFinished]);
  
  return (
      <form action={dispatch} className="space-y-4">
        <input type="hidden" name="id" value={ad?.id} />
        <div className="space-y-2">
          <Label htmlFor="title">Ad Title</Label>
          <Input id="title" name="title" defaultValue={ad?.title} placeholder="e.g., Summer Sale" required />
          {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={ad?.description} placeholder="A short, catchy description." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="link">Link URL</Label>
          <Input id="link" name="link" type="url" defaultValue={ad?.link} placeholder="https://example.com/promotion" required />
          {state?.errors?.link && <p className="text-sm text-destructive">{state.errors.link[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input id="image_url" name="image_url" type="url" defaultValue={ad?.image_url} placeholder="https://example.com/image.png" />
           {state?.errors?.image_url && <p className="text-sm text-destructive">{state.errors.image_url[0]}</p>}
        </div>
        <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <SubmitButton isEditMode={isEditMode}/>
        </DialogFooter>
      </form>
  );
}


function AdItem({ ad, onDeleted }: { ad: Ad, onDeleted: () => void }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteAd(ad.id);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onDeleted();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  }
  
  return (
    <Card className="flex flex-col sm:flex-row gap-4 p-4">
      {ad.image_url && (
        <div className="relative w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 rounded-md overflow-hidden">
          <Image src={ad.image_url} alt={ad.title} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold">{ad.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate">{ad.link}</a>
      </div>
      <div className="flex sm:flex-col gap-2 flex-shrink-0">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon"><Pen className="h-4 w-4" /></Button>
            </DialogTrigger>
             <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Ad</DialogTitle>
                    <DialogDescription>Make changes to your ad below.</DialogDescription>
                </DialogHeader>
                <AdForm ad={ad} onFinished={() => setIsEditDialogOpen(false)} />
             </DialogContent>
          </Dialog>

        <Button variant="destructive" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the ad titled "{ad.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}


export default function AdsManagementPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Use a simple key to force re-fetching
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchAds() {
      setIsLoading(true);
      // This is a client component, so we must fetch data via an action or API route.
      // For simplicity, we'll create an ad-hoc server action inside this file.
      const getAds = async () => {
          'use server';
          const { createAdminClient } = await import('@/lib/supabase/server');
          const supabase = createAdminClient();
          const { data } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
          return data || [];
      }
      const adsData = await getAds();
      setAds(adsData);
      setIsLoading(false);
    }
    fetchAds();
  }, [refreshKey]);
  
  const handleFormFinished = () => {
    setIsFormOpen(false);
    setRefreshKey(key => key + 1); // Trigger a refresh
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="font-headline text-3xl font-bold tracking-tight">Manage Ads</h2>
          <p className="text-muted-foreground">Create, edit, and delete advertisements.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button>Create New Ad</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Ad</DialogTitle>
                    <DialogDescription>Fill out the form below to create a new ad.</DialogDescription>
                </DialogHeader>
                <AdForm onFinished={handleFormFinished} />
            </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : ads.length > 0 ? (
          ads.map(ad => <AdItem key={ad.id} ad={ad} onDeleted={() => setRefreshKey(key => key + 1)} />)
        ) : (
          <Card className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">No ads found. Create one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
