'use server';

import { prisma } from '@/lib/prisma';
import { SpaceStatus, SpaceType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// 1. Create a new space in a warehouse
export async function createSpace({
    warehouseId,
    spaceCode,
    name,
    type,
    size,
    height,
    location,
    rate,
    description,
    status,
    features,
    images,
  }: {
    warehouseId: string;
    spaceCode: string;
    name?: string;
    type: SpaceType;
    size: number;
    height?: number;
    location?: string;
    rate?: number;
    description?: string;
    status: SpaceStatus;
    features?: string[];
    images?: string[];
  }) {
    try {
      const newSpace = await prisma.space.create({
        data: {
          warehouseId,
          spaceCode,
          name,
          type,
          size,
          height,
          location,
          rate,
          description,
          status,
          features: features || [],
          images: images || [],
        },
      });
  
      revalidatePath(`/dashboard/warehouse/${warehouseId}`);
      return { success: true, data: newSpace };
    } catch (error) {
      console.error('Create space error:', error);
      return { success: false, error: 'Failed to create space' };
    }
  }

// 2. Get space by ID
export async function getSpaceById(spaceId: string) {
  try {
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        warehouse: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!space) {
      return { success: false, error: 'Space not found' };
    }

    return { success: true, data: space };
  } catch (error) {
    console.error('Get space by ID error:', error);
    return { success: false, error: 'Failed to fetch space' };
  }
}

// 3. Update space information
export async function updateSpace({
  spaceId,
  spaceCode,
  type,
  size,
  status,
}: {
  spaceId: string;
  spaceCode?: string;
  type?: SpaceType;
  size?: number;
  status?: SpaceStatus;
}) {
  try {
    const updatedSpace = await prisma.space.update({
      where: { id: spaceId },
      data: {
        spaceCode,
        type,
        size,
        status,
      },
    });

    revalidatePath(`/dashboard/warehouse/${updatedSpace.warehouseId}`);
    return { success: true, data: updatedSpace };
  } catch (error) {
    console.error('Update space error:', error);
    return { success: false, error: 'Failed to update space' };
  }
}

// 4. Delete a space
export async function deleteSpace(spaceId: string) {
  try {
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
    });

    if (!space) {
      return { success: false, error: 'Space not found' };
    }

    // Check if space is occupied before deletion
    if (space.status === 'OCCUPIED') {
      return { success: false, error: 'Cannot delete an occupied space' };
    }

    const deletedSpace = await prisma.space.delete({
      where: { id: spaceId },
    });

    revalidatePath(`/dashboard/warehouse/${deletedSpace.warehouseId}`);
    return { success: true, data: deletedSpace };
  } catch (error) {
    console.error('Delete space error:', error);
    return { success: false, error: 'Failed to delete space' };
  }
}

// 5. Get all spaces in a warehouse with pagination
export async function getWarehouseSpaces({
  warehouseId,
  page = 1,
  limit = 10,
  status,
}: {
  warehouseId: string;
  page?: number;
  limit?: number;
  status?: SpaceStatus;
}) {
  const skip = (page - 1) * limit;

  try {
    const [spaces, total] = await Promise.all([
      prisma.space.findMany({
        where: {
          warehouseId,
          status,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.space.count({
        where: {
          warehouseId,
          status,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        spaces,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  } catch (error) {
    console.error('Get warehouse spaces error:', error);
    return { success: false, error: 'Failed to fetch warehouse spaces' };
  }
}

// 6. Assign/Unassign client to space (bonus function)
export async function updateSpaceClient({
  spaceId,
  clientId,
}: {
  spaceId: string;
  clientId: string | null;
}) {
  try {
    const updatedSpace = await prisma.space.update({
      where: { id: spaceId },
      data: {
        clientId,
        status: clientId ? 'OCCUPIED' : 'AVAILABLE',
      },
    });

    revalidatePath(`/dashboard/warehouse/${updatedSpace.warehouseId}`);
    return { success: true, data: updatedSpace };
  } catch (error) {
    console.error('Update space client error:', error);
    return { success: false, error: 'Failed to update space client' };
  }
}