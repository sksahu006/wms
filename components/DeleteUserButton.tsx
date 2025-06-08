'use client';

import { deleteUser } from '@/app/actions/clientActions/customer';
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

type DeleteUserButtonProps = {
    userId: string;
};

export default function DeleteUserButton({ userId }: DeleteUserButtonProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        setIsPending(true);
        const result = await deleteUser(userId);
        setIsPending(false);

        if (result.success) {
            setOpen(false);
            router.refresh();
        } else {
            alert(`Failed to delete user: ${result.error}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="link"
                    className="text-red-600 hover:text-red-800 font-semibold"
                    disabled={isPending}
                >
                    Delete <Trash2 className="text-red-400 size-4 ml-1" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-lg shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        Confirm Deletion
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        Are you sure you want to delete this user? All associated data must be removed first.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
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
