
'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { submitReviewAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Submit Review
    </Button>
  );
}

interface ReviewFormProps {
    ebookId: string;
}

type FormErrors = {
  ebookId?: string[];
  rating?: string[];
  comment?: string[];
  reviewer?: string[];
};

type FormState = {
  message: string;
  errors: FormErrors;
};


export function ReviewForm({ ebookId }: ReviewFormProps) {
  const initialState: FormState = { 
    message: '', 
    errors: {}
  };
  const [state, dispatch] = useFormState(submitReviewAction, initialState);
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

   useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors ?? {}).length > 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success!',
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <form action={dispatch} className="space-y-6">
       <input type="hidden" name="ebookId" value={ebookId} />
       <input type="hidden" name="rating" value={rating} />
      
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'h-6 w-6 cursor-pointer transition-colors',
                (hoverRating || rating) >= star
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground'
              )}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
         {state.errors?.rating && <p className="text-sm text-destructive">{state.errors.rating[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reviewer">Your Name</Label>
        <Input id="reviewer" name="reviewer" placeholder="e.g., Jane Doe" />
        {state.errors?.reviewer && <p className="text-sm text-destructive">{state.errors.reviewer[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Review</Label>
        <Textarea
          id="comment"
          name="comment"
          placeholder="Share your thoughts on this ebook..."
          rows={4}
        />
         {state.errors?.comment && <p className="text-sm text-destructive">{state.errors.comment[0]}</p>}
      </div>
      
      <SubmitButton />
    </form>
  );
}
