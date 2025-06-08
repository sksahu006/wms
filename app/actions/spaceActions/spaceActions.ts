'use server';

import { prisma } from '@/lib/prisma';
import { SpaceStatus, SpaceType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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

const getSpacesByUserIdSchema = z.object({
  userId: z.string().cuid(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
});


export async function getSpacesByUserId({
  userId,
  page = 1,
  limit = 10,
  search,
}: {
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    // Validate input
    const validated = getSpacesByUserIdSchema.parse({
      userId,
      page,
      limit,
      search,
    });

    const skip = (validated.page - 1) * validated.limit;

    // Build where clause for spaces query
    const where: any = {
      clientId: validated.userId,
      status: SpaceStatus.OCCUPIED, // Only fetch spaces with active agreements
    };

    if (validated.search) {
      where.OR = [
        { spaceCode: { contains: validated.search, mode: 'insensitive' } },
        { name: { contains: validated.search, mode: 'insensitive' } },
      ];
    }

    // Fetch spaces and total count
    const [spaces, total] = await Promise.all([
      // Paginated spaces query
      prisma.space.findMany({
        where,
        skip,
        take: validated.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          warehouse: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      // Total count for pagination
      prisma.space.count({ where }),
    ]);

    return {
      success: true,
      data: {
        spaces,
        page: validated.page,
        limit: validated.limit,
        totalPages: Math.ceil(total / validated.limit),
        totalItems: total,
      },
    };
  } catch (error) {
    console.error('Get spaces by user ID error:', error);
    return { success: false, error: 'Failed to fetch spaces for user' };
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
  spaceId: string;
  spaceCode?: string;
  name?: string;
  type?: SpaceType;
  size?: number;
  height?: number;
  location?: string;
  rate?: number;
  description?: string;
  status?: SpaceStatus;
  features?: string[];
  images?: string[];
}) {
  try {
    const updatedSpace = await prisma.space.update({
      where: { id: spaceId },
      data: {
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
      include: {
        agreements: true,
        supports: true,
      },
    });

    if (!space) {
      return { success: false, error: 'Space not found' };
    }

    if (space.isDeleted) {
      return { success: false, error: 'Space is already deleted' };
    }

    if (space.status === 'OCCUPIED') {
      return { success: false, error: 'Cannot delete an occupied space' };
    }

    if (space.clientId) {
      return { success: false, error: 'Cannot delete space assigned to a client' };
    }

    if (space.agreements.length > 0) {
      return {
        success: false,
        error: 'Cannot delete space — agreements are still associated with it',
      };
    }

    if (space.supports.length > 0) {
      return {
        success: false,
        error: 'Cannot delete space — supports are still associated with it',
      };
    }

    // Safe to delete the space
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

// Validation schema for fetching warehouse spaces
const getWarehouseSpacesSchema = z.object({
  warehouseId: z.string().cuid(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  status: z.nativeEnum(SpaceStatus).optional(),
  type: z.nativeEnum(SpaceType).optional(),
  search: z.string().optional(),
});

export async function getWarehouseSpaces({
  warehouseId,
  page = 1,
  limit = 10,
  status,
  type,
  search,
}: {
  warehouseId: string;
  page?: number;
  limit?: number;
  status?: SpaceStatus;
  type?: SpaceType;
  search?: string;
}) {
  try {
    // Validate input
    const validated = getWarehouseSpacesSchema.parse({
      warehouseId,
      page,
      limit,
      status,
      type,
      search,
    });

    const skip = (validated.page - 1) * validated.limit;

    // Build where clause for spaces query
    const where: any = { warehouseId: validated.warehouseId };
    if (validated.status) {
      where.status = validated.status;
    }
    if (validated.type) {
      where.type = validated.type;
    }
    if (validated.search) {
      where.OR = [
        { spaceCode: { contains: validated.search, mode: "insensitive" } },
        { name: { contains: validated.search, mode: "insensitive" } },
      ];
    }

    // Fetch spaces and stats
    const [spaces, total, occupiedCount, availableCount, coldStorageCount] = await Promise.all([
      // Paginated spaces query
      prisma.space.findMany({
        where,
        skip,
        take: validated.limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            select: { id: true, name: true },
          },
        },
      }),
      // Total count for pagination
      prisma.space.count({ where }),
      // Count for OCCUPIED spaces (all spaces in warehouse)
      prisma.space.count({
        where: { warehouseId: validated.warehouseId, status: "OCCUPIED" },
      }),
      // Count for AVAILABLE spaces (all spaces in warehouse)
      prisma.space.count({
        where: { warehouseId: validated.warehouseId, status: "AVAILABLE" },
      }),
      // Count for COLD storage spaces (all spaces in warehouse)
      prisma.space.count({
        where: { warehouseId: validated.warehouseId, type: "COLD" },
      }),
    ]);

    // Calculate stats
    const totalSpaces = await prisma.space.count({
      where: { warehouseId: validated.warehouseId },
    });

    return {
      success: true,
      data: {
        spaces,
        page: validated.page,
        limit: validated.limit,
        totalPages: Math.ceil(total / validated.limit),
        totalItems: total,
        stats: {
          totalSpaces,
          occupiedSpaces: occupiedCount,
          availableSpaces: availableCount,
          coldStorageSpaces: coldStorageCount,
        },
      },
    };
  } catch (error) {
    console.error("Get warehouse spaces error:", error);
    return { success: false, error: "Failed to fetch warehouse spaces" };
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

const allocateSpaceSchema = z.object({
  spaceId: z.string().cuid(),
  clientId: z.string().cuid(),
});

export async function allocateSpace(formData: FormData) {
  try {
    // Parse and validate input
    const data = allocateSpaceSchema.parse({
      spaceId: formData.get("spaceId"),
      clientId: formData.get("clientId"),
    });

    // Fetch space to ensure it exists and is available
    const space = await prisma.space.findUnique({
      where: { id: data.spaceId },
    });

    if (!space) {
      throw new Error("Space not found");
    }

    if (space.status !== "AVAILABLE") {
      throw new Error("Space is not available for allocation");
    }

    // Verify client exists
    const client = await prisma.user.findUnique({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    // Update space with clientId and set status to OCCUPIED
    await prisma.space.update({
      where: { id: data.spaceId },
      data: {
        clientId: data.clientId,
        status: "OCCUPIED",
      },
    });

    revalidatePath("/dashboard/warehouse");
    return { success: true, message: "Space allocated successfully" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to allocate space",
    };
  }
}