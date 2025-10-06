'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { uploadProduct, uploadProductFromGoogleDrive } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CloudUpload } from 'lucide-react';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Upload Product
    </Button>
  );
}

type FormErrors = {
  title?: string[];
  description?: string[];
  price?: string[];
  category?: string[];
  image?: string[];
  file?: string[];
};

type FormState = {
  message: string;
  errors: FormErrors;
};


const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export default function UploadProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [isDrivePickerLoading, setIsDrivePickerLoading] = useState(false);

  const [imageDriveFile, setImageDriveFile] = useState<{ id: string; name: string; accessToken: string; } | null>(null);
  const [ebookDriveFile, setEbookDriveFile] = useState<{ id: string; name: string; accessToken: string; } | null>(null);

  const initialState: FormState = { message: '', errors: {} };
  
  const [state, formAction] = useFormState((prevState: FormState, formData: FormData) => {
    if (imageDriveFile || ebookDriveFile) {
        if(imageDriveFile) formData.set('image-drive-id', imageDriveFile.id);
        if(imageDriveFile) formData.set('image-drive-name', imageDriveFile.name);
        if(imageDriveFile) formData.set('image-drive-token', imageDriveFile.accessToken);
        if(ebookDriveFile) formData.set('file-drive-id', ebookDriveFile.id);
        if(ebookDriveFile) formData.set('file-drive-name', ebookDriveFile.name);
        if(ebookDriveFile) formData.set('file-drive-token', ebookDriveFile.accessToken);
        return uploadProductFromGoogleDrive(prevState, formData);
    } else {
        return uploadProduct(prevState, formData);
    }
  }, initialState);


  useEffect(() => {
    if (gapiLoaded && gisLoaded && GOOGLE_CLIENT_ID && typeof window !== 'undefined' && window.google) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: DRIVE_SCOPES,
        callback: '', // defined later
      });
      setTokenClient(client);
    }
  }, [gapiLoaded, gisLoaded]);

  const handleOpenPicker = (fileType: 'image' | 'file') => {
    if (!tokenClient || !GOOGLE_API_KEY || typeof window === 'undefined' || !window.google || !window.gapi) {
        toast({
            variant: 'destructive',
            title: 'Configuration Error',
            description: 'Google Drive integration is not configured or ready. Please try again in a moment.'
        })
        return;
    };
    setIsDrivePickerLoading(true);

    tokenClient.callback = async (resp: any) => {
        if (resp.error !== undefined) {
            setIsDrivePickerLoading(false);
            throw resp;
        }
        
        const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
        if(fileType === 'image'){
             view.setMimeTypes("image/png,image/jpeg,image/jpg,image/webp");
        } else {
            view.setMimeTypes("application/pdf,application/epub+zip,application/zip");
        }

        const picker = new window.google.picker.PickerBuilder()
            .setAppId(null) // Not needed for OAuth 2.0
            .setOAuthToken(resp.access_token)
            .addView(view)
            .setDeveloperKey(GOOGLE_API_KEY)
            .setCallback((data: any) => {
                if (data.action === window.google.picker.Action.PICKED) {
                    const doc = data.docs[0];
                    const fileInfo = { id: doc.id, name: doc.name, accessToken: resp.access_token };
                    if (fileType === 'image') {
                        setImageDriveFile(fileInfo);
                    } else {
                        setEbookDriveFile(fileInfo);
                    }
                }
                setIsDrivePickerLoading(false);
            })
            .build();
        picker.setVisible(true);
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
  }

   useEffect(() => {
    if (state.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success!',
          description: state.message,
        });
        formRef.current?.reset();
        setImageDriveFile(null);
        setEbookDriveFile(null);
        router.push('/admin/dashboard');
        router.refresh();
      }
    }
  }, [state, toast, router]);


  return (
    <>
      <Script src="https://apis.google.com/js/api.js" async onLoad={() => {
          if (typeof window !== 'undefined' && window.gapi) {
            window.gapi.load('picker', () => setGapiLoaded(true));
          }
      }} />
      <Script src="https://accounts.google.com/gsi/client" async onLoad={() => setGisLoaded(true)} />

      <div className="flex-1 space-y-4">
        <h2 className="font-headline text-3xl font-bold tracking-tight">Upload New Product</h2>
        <Card>
          <CardHeader>
            <CardTitle>New Ebook Details</CardTitle>
            <CardDescription>
              Fill out the form below to add a new ebook to the store. You can upload from your device or Google Drive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g., Advanced Network Security" />
                {state.errors?.title?.[0] && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="A brief but engaging description of the ebook." rows={5} />
                {state.errors?.description?.[0] && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ({paystackCurrency})</Label>
                <Input id="price" name="price" type="number" placeholder="e.g., 49.99" step="0.01" />
                {state.errors?.price?.[0] && <p className="text-sm text-destructive">{state.errors.price[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g., Offensive Security" />
                {state.errors?.category?.[0] && <p className="text-sm text-destructive">{state.errors.category[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Ebook Cover Image</Label>
                {imageDriveFile ? (
                  <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted">
                    <CloudUpload className="h-4 w-4 text-green-500" />
                    <span className="flex-1 truncate">{imageDriveFile.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => setImageDriveFile(null)}>Change</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
                    <Button type="button" variant="outline" onClick={() => handleOpenPicker('image')} disabled={!gapiLoaded || !gisLoaded || isDrivePickerLoading}>
                      {isDrivePickerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
                      <span className="ml-2 hidden sm:inline">Drive</span>
                    </Button>
                  </div>
                )}
                 {state.errors?.image?.[0] && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Ebook File (PDF, EPUB, ZIP)</Label>
                {ebookDriveFile ? (
                  <div className="flex items-center gap-2 text-sm p-2 border rounded-md bg-muted">
                    <CloudUpload className="h-4 w-4 text-green-500" />
                    <span className="flex-1 truncate">{ebookDriveFile.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => setEbookDriveFile(null)}>Change</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input id="file" name="file" type="file" accept=".pdf,.epub,.zip" />
                    <Button type="button" variant="outline" onClick={() => handleOpenPicker('file')} disabled={!gapiLoaded || !gisLoaded || isDrivePickerLoading}>
                       {isDrivePickerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
                       <span className="ml-2 hidden sm_inline">Drive</span>
                    </Button>
                  </div>
                )}
                {state.errors?.file?.[0] && <p className="text-sm text-destructive">{state.errors.file[0]}</p>}
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
