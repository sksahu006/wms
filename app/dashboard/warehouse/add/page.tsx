'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createWarehouse } from '@/app/actions/warehouseActions/warehouseActions';
import { useSession } from 'next-auth/react';

// Define schema (same as server-side)
const warehouseSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  storageType: z.string().min(1, 'Storage Type is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

export default function AddWarehousePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession(); // Get user session
  const managerId = session?.user?.id; // Assuming user.id is the cuid

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      code: '',
      name: '',
      location: '',
      storageType: '',
      capacity: 0,
    },
  });

  const onSubmit = async (data: WarehouseFormData) => {
    const formData = new FormData();
    Object.entries({ ...data, managerId }).forEach(([key, value]) => {
      formData.append(key, value?.toString() ?? '');
    });

    const res = await createWarehouse(formData);

    if (res?.success) {
      toast({
        title: 'Warehouse Added',
        description: 'Warehouse has been added successfully.',
      });
      router.push('/dashboard/warehouse');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: res?.error || 'Failed to create warehouse',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/warehouse">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add Warehouse</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Warehouse Information</CardTitle>
            <CardDescription>Fill in the details to add a new warehouse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Warehouse Code</Label>
                <Input id="code" placeholder="WH-001" {...register('code')} />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Warehouse Name</Label>
                <Input id="name" placeholder="Main Warehouse" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Industrial Area, Block B"
                  {...register('location')}
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="storageType">Storage Type</Label>
                <Input id="storageType" placeholder="Cold, Hazardous, etc." {...register('storageType')} />
                {errors.storageType && <p className="text-sm text-destructive">{errors.storageType.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Units)</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="1000"
                  {...register('capacity')}
                />
                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
              </div>
            </div>
          </CardContent>
          {/* <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/warehouse">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting || !managerId}>
              {isSubmitting ? 'Adding...' : 'Add Warehouse'}
            </Button>
          </CardFooter> */}
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              asChild
              className="border-none text-white bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700"
            >
              <Link href="/dashboard/warehouse">Cancel</Link>
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !managerId}
              className={`border-none text-white ${isSubmitting || !managerId
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Warehouse'}
            </Button>
          </CardFooter>

        </form>
      </Card>
    </div>
  );
}