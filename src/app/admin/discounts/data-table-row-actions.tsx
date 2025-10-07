
'use client';

import { useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pen, Power, PowerOff, Trash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { useToast } from '@/hooks/use-toast';
import { deleteDiscount, toggleDiscountStatus } from '@/lib/actions';
import type { Discount } from '@/lib/definitions';
import { DiscountForm } from './discount-form';


interface DataTableRowActionsProps<TData extends Discount> {
  row: Row<TData>;
}

export function DataTableRowActions<TData extends Discount>({ row }: DataTableRowActionsProps<TData>) {
  const { toast } = useToast();
  const discount = row.original;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteDiscount(discount.id);
    if (result.success) {
      toast({
        title: 'Success',
        description: `Discount code "${discount.code}" has been deleted.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: result.message,
      });
    }
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  };

  const handleToggle = async () => {
    setIsToggling(true);
    const result = await toggleDiscountStatus(discount.id, discount.is_active);
     if (result.success) {
      toast({
        title: 'Success',
        description: `Discount "${discount.code}" has been ${discount.is_active ? 'deactivated' : 'activated'}.`,
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.message,
      });
    }
    setIsToggling(false);
  };

  return (
    <>
      <div className="flex justify-end">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Pen className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
              </DialogTrigger>
              <DropdownMenuItem onClick={handleToggle} disabled={isToggling}>
                {discount.is_active ? (
                  <><PowerOff className="mr-2 h-4 w-4" /> Deactivate</>
                ) : (
                  <><Power className="mr-2 h-4 w-4" /> Activate</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                onSelect={(e) => e.preventDefault()}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogContent>
             <DialogHeader>
              <DialogTitle>Edit Discount: {discount.code}</DialogTitle>
              <DialogDescription>
                Make changes to the discount code below.
              </DialogDescription>
            </DialogHeader>
            <DiscountForm discount={discount} onFinished={() => setIsEditDialogOpen(false)}/>
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the discount code
              <span className="font-semibold"> {discount.code}</span>.
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
    </>
  );
}
