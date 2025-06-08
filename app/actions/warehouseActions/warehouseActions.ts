'use server';

import { getServerAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const warehouseSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  storageType: z.string().min(1, 'Storage Type is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  managerId: z.string().cuid('Invalid manager ID'),
});

export type WarehouseInput = z.infer<typeof warehouseSchema>;

// 👉 Create
export async function createWarehouse(formData: FormData) {
  const values = Object.fromEntries(formData.entries())

  const parsed = warehouseSchema.safeParse({
    code: values.code,
    name: values.name,
    location: values.location,
    storageType: values.storageType,
    capacity: values.capacity,
    managerId: values.managerId,
  })

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    const warehouse = await prisma.warehouse.create({ data: parsed.data })
    revalidatePath('/dashboard/warehouse')
    return { success: true, warehouse }
  } catch (error) {
    console.error('Create error:', error)
    return { success: false, error: 'Failed to create warehouse' }
  }
}

// 👉 Read all
export async function getAllWarehouses({
  page = 1,
  limit = 10,
  search = '',
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const skip = (page - 1) * limit;

  try {
    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        skip,
        take: limit,
        where: {
          isDeleted: false,
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          manager: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              spaces: {
                where: {
                  status: 'OCCUPIED',
                },
              },
            },
          },
          spaces: true, // Optional: remove this if you don't need all space details
        },
      }),
      prisma.warehouse.count({
        where: {
          isDeleted: false,
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        warehouses,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  } catch (error) {
    console.error('Pagination fetch error:', error);
    return { success: false, error: 'Failed to fetch warehouses with pagination' };
  }
}



// 👉 Read one by ID
export async function getWarehouseById(id: string) {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id, isDeleted: false },
      include: { manager: true, spaces: true },
    });

    if (!warehouse) return { success: false, error: 'Warehouse not found' };

    return { success: true, warehouse };
  } catch (error) {
    console.error('Fetch single error:', error);
    return { success: false, error: 'Failed to fetch warehouse' };
  }
}

// 👉 Update
export async function updateWarehouse(id: string, formData: FormData) {
  const values = Object.fromEntries(formData.entries());

  const parsed = warehouseSchema.safeParse({
    code: values.code,
    name: values.name,
    location: values.location,
    storageType: values.storageType,
    capacity: values.capacity,
    managerId: values.managerId,
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const updated = await prisma.warehouse.update({
      where: { id, isDeleted: false },
      data: parsed.data,
    });

    revalidatePath('/warehouses');
    return { success: true, warehouse: updated };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, error: 'Failed to update warehouse' };
  }
}

// 👉 Delete
export async function deleteWarehouse(id: string) {
  try {
    const session = await getServerAuth();
    if (!session || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized: Only admins can delete warehouses',
      };
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id, isDeleted: false },
      include: {
        spaces: {
          include: {
            agreements: {
              where: {
                status: { in: ['PENDING', 'ACTIVE'] },
              },
            },
          },
        },
      },
    });

    if (!warehouse) {
      return { success: false, error: 'Warehouse not found' };
    }

    // Check for spaces with active or pending agreements
    const hasActiveAgreements = warehouse.spaces.some(
      (space) => space.agreements.length > 0
    );
    if (hasActiveAgreements) {
      return {
        success: false,
        error: 'Cannot delete warehouse with spaces linked to active or pending agreements',
      };
    }

    // Soft delete the warehouse
    await prisma.warehouse.delete({
      where: { id },
      // data: { isDeleted: true },
    });

    // Soft delete associated spaces (if any)
    await prisma.space.updateMany({
      where: { warehouseId: id },
      data: { isDeleted: true },
    });

    revalidatePath('/dashboard/warehouse');
    return { success: true, message: 'Warehouse deleted successfully' };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: 'Failed to delete warehouse' };
  }
}
