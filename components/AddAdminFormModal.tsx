'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


import { Plus } from 'lucide-react';
import { addAdmin } from '@/app/actions/admin/admin';

export default function AddAdminFormModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await addAdmin(formData);

    if (response.success) {
      //toast.success(response.message, { duration: 3000 });
      setOpen(false);
      router.refresh();
    } else {
     // toast.error(response.error, { duration: 3000 });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input id="position" name="position" disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" disabled={isLoading} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Admin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}