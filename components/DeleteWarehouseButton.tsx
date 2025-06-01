'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteWarehouse } from '@/app/actions/warehouseActions/warehouseActions';
import { useToast } from '@/hooks/use-toast';

type DeleteWarehouseButtonProps = {
  warehouseId: string;
  onDelete?: () => void; // Callback to notify parent of deletion
};

export default function DeleteWarehouseButton({ warehouseId, onDelete }: DeleteWarehouseButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsPending(true);
    try {
      const result = await deleteWarehouse(warehouseId);
      setIsPending(false);

      if (result.success) {
        setOpen(false);
        toast({
          title: 'Success',
          description: 'Warehouse deleted successfully',
          duration: 3000,
        });
        // Trigger parent callback and refresh
        if (onDelete) onDelete();
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to delete warehouse',
          duration: 3000,
        });
      }
    } catch (error) {
      setIsPending(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-800"
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Are you sure you want to delete this warehouse? This action will mark it and its spaces as deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
            type="button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}