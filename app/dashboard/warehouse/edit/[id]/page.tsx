'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getWarehouseById, updateWarehouse } from '@/app/actions/warehouseActions/warehouseActions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';

const warehouseSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    location: z.string().min(1, 'Location is required'),
    storageType: z.string().min(1, 'Storage Type is required'),
    capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

export default function EditWarehousePage() {
    const router = useRouter();
    const { toast } = useToast();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<WarehouseFormData>({
        resolver: zodResolver(warehouseSchema),
    });
    const { data: session } = useSession();
    const managerId = session?.user?.id;

    useEffect(() => {
        async function fetchWarehouse() {
            if (!id) return;
            const res = await getWarehouseById(id);
            if (res?.success && res?.warehouse) {
                console.log(res)
                reset(res?.warehouse);
            } else {
                toast({ title: 'Error', description: 'Failed to load warehouse', variant: 'destructive' });
                router.push('/dashboard/warehouse');
            }
            setLoading(false);
        }

        fetchWarehouse();
    }, [id, reset, router, toast]);

    const onSubmit = async (data: WarehouseFormData) => {
        const formData = new FormData();
        Object.entries({ ...data, managerId }).forEach(([key, value]) => {
            formData.append(key, value?.toString() ?? '');
        });
        const res = await updateWarehouse(id, formData);

        if (res?.success) {
            toast({
                title: 'Warehouse Updated',
                description: 'Warehouse has been updated successfully.',
            });
            router.push('/dashboard/warehouse');
        } else {
            console.log(res)
            toast({
                variant: 'destructive',
                title: 'Error',
                description: res?.error || 'Failed to update warehouse',
            });
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/warehouse">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Warehouse</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Edit Warehouse</CardTitle>
                        <CardDescription>Update the details of the warehouse</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Warehouse Code</Label>
                                <Input id="code" {...register('code')} />
                                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Warehouse Name</Label>
                                <Input id="name" {...register('name')} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" {...register('location')} />
                                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="storageType">Storage Type</Label>
                                <Select
                                    onValueChange={(value) => setValue('storageType', value)}
                                    defaultValue={watch('storageType')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a storage type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cold">Cold</SelectItem>
                                        <SelectItem value="Hazardous">Hazardous</SelectItem>
                                        <SelectItem value="Dry">Dry</SelectItem>
                                        <SelectItem value="Secure">Secure</SelectItem>
                                        <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.storageType && (
                                    <p className="text-sm text-destructive">{errors.storageType.message}</p>
                                )}
                            </div>

                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity (Units)</Label>
                                <Input id="capacity" type="number" {...register('capacity')} />
                                {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" asChild>
                            <Link href="/dashboard/warehouse">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Warehouse'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
