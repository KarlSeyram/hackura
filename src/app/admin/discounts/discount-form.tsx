
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createOrUpdateDiscount } from '@/lib/actions';
import type { Discount } from '@/lib/definitions';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditMode ? 'Save Changes' : 'Create Discount'}
    </Button>
  );
}

type FormState = {
  message: string;
  errors?: {
    code?: string[];
    discount_percent?: string[];
  }
};

interface DiscountFormProps {
    discount?: Discount;
    onFinished?: () => void;
}

export function DiscountForm({ discount, onFinished }: DiscountFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const isEditMode = !!discount;
  
  const initialState: FormState = { message: '' };
  const [state, dispatch] = useFormState(createOrUpdateDiscount, initialState);
  
  const isSubmitted = useRef(false);

  // Separate state for the date picker
  const [date, setDate] = useState<Date | undefined>(
    discount?.expires_at ? new Date(discount.expires_at) : undefined
  );


   useEffect(() => {
    if (isSubmitted.current && state?.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({
          variant: 'destructive',
          title: isEditMode ? 'Update Failed' : 'Create Failed',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success!',
          description: state.message,
        });
        if(onFinished) onFinished();
        formRef.current?.reset();
      }
      isSubmitted.current = false; 
    }
  }, [state, toast, isEditMode, onFinished]);
  
  const handleFormAction = (formData: FormData) => {
    isSubmitted.current = true;
    formData.set('id', discount?.id || '');
    if (date) {
        formData.set('expires_at', date.toISOString());
    } else {
        formData.set('expires_at', '');
    }
    dispatch(formData);
  }
  
  return (
      <form ref={formRef} action={handleFormAction} className="space-y-6">
        <input type="hidden" name="id" value={discount?.id} />

        <div className="space-y-2">
            <Label htmlFor="code">Discount Code</Label>
            <Input id="code" name="code" defaultValue={discount?.code} placeholder="e.g., LAUNCH20" />
            {state?.errors?.code && <p className="text-sm text-destructive">{state.errors.code[0]}</p>}
        </div>

        <div className="space-y-2">
            <Label htmlFor="discount_percent">Discount Percent (%)</Label>
            <Input id="discount_percent" name="discount_percent" type="number" defaultValue={discount?.discount_percent} placeholder="e.g., 20" />
            {state?.errors?.discount_percent && <p className="text-sm text-destructive">{state.errors.discount_percent[0]}</p>}
        </div>

         <div className="space-y-2">
            <Label htmlFor="expires_at">Expires At (Optional)</Label>
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
        </div>

        <div className="flex items-center space-x-2">
            <Checkbox id="is_active" name="is_active" defaultChecked={discount?.is_active ?? true} />
            <Label htmlFor="is_active">Activate this discount code</Label>
        </div>

        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <SubmitButton isEditMode={isEditMode}/>
        </DialogFooter>
      </form>
  );
}
