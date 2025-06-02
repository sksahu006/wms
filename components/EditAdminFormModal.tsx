'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateAdmin } from '@/app/actions/admin/admin';
import { Edit } from 'lucide-react';
//import { toast } from 'react-hot-toast';


type Admin = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  companyName: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
};

export default function EditAdminFormModal({ admin }: { admin: Admin }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await updateAdmin(formData);

    if (response.success) {
     // toast.success(response.message, { duration: 3000 });
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
        <span className="flex w-full cursor-pointer"> <Edit className='size-6 text-green-950'/> edit</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={admin.id} />
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={admin.name || ''} disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={admin.email || ''} disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={admin.phone || ''} disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Input id="position" name="position" defaultValue={admin.position || ''} disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" defaultValue={admin.companyName || ''} disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={admin.status}
              disabled={isLoading}
              className="w-full border rounded-md p-2"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Admin'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}