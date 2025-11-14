"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { Loader2, PlusCircle, Trash, Pen } from "lucide-react";
import Image from "next/image";
import type { Ad } from "@/lib/definitions";
import { createOrUpdateAd, deleteAd } from "./actions";

/**
 * AdForm component for creating or editing an ad.
 * @param {object} props - Component props.
 * @param {Ad | null} props.ad - The ad to edit, or null to create a new one.
 * @param {() => void} props.onFinished - Callback function to run after form submission is finished.
 */
function AdForm({ ad, onFinished }: { ad: Ad | null; onFinished: () => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    if (ad?.id) {
      formData.set("id", ad.id);
    }
    if (ad?.image_url) {
      formData.set("existing_image_url", ad.image_url);
    }

    // Call the server action
    const result = await createOrUpdateAd(formData);

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      onFinished(); // Close dialog and refresh list
    } else {
      setError(result.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={ad?.title ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={ad?.description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="link">Link URL</Label>
        <Input
          id="link"
          name="link"
          type="url"
          defaultValue={ad?.link ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input id="image" name="image" type="file" accept="image/*" />
        {ad?.image_url && (
          <p className="text-xs text-muted-foreground">
            Leave blank to keep the current image.
          </p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {ad ? "Save Changes" : "Create Ad"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AdsPage() {
  const { toast } = useToast();
  const supabase = createBrowserClient();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [adToDelete, setAdToDelete] = useState<Ad | null>(null);

  const fetchAds = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching ads",
        description: error.message,
      });
      setAds([]);
    } else {
      setAds(data as Ad[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleEdit = (ad: Ad) => {
    setSelectedAd(ad);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!adToDelete) return;
    setIsDeleting(true);
    const result = await deleteAd(adToDelete.id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      fetchAds(); // Refresh the list
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setAdToDelete(null);
    setIsDeleting(false);
  };

  const handleFormFinished = () => {
    setIsDialogOpen(false);
    setSelectedAd(null);
    fetchAds(); // Refresh ads list after create/update
  };

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-3xl font-bold tracking-tight">
            Manage Advertisements
          </h2>
          <p className="text-muted-foreground">
            Create, edit, and delete ads for your website.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedAd(null);
            setIsDialogOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Ad
        </Button>
      </div>

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAd ? "Edit Ad" : "Create New Ad"}
            </DialogTitle>
          </DialogHeader>
          <AdForm ad={selectedAd} onFinished={handleFormFinished} />
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog open={!!adToDelete} onOpenChange={(open) => !open && setAdToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ad titled "{adToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/80">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Ads List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Ads</CardTitle>
          <CardDescription>A list of all active ads.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : ads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <Card key={ad.id} className="overflow-hidden">
                  {ad.image_url && (
                    <div className="relative aspect-video w-full">
                      <Image
                        src={ad.image_url}
                        alt={ad.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{ad.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {ad.description ?? "No description."}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ad)}
                    >
                      <Pen className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                       onClick={() => setAdToDelete(ad)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No ads have been created yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
