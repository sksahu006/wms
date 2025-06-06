
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { Prisma } from "@prisma/client";


// Validation schema for creating an agreement
const createAgreementSchema = z.object({
  spaceId: z.string().cuid(),
  userId: z.string().cuid(),
  handoverDate: z.string().optional().nullable(),
  rentStartDate: z.string(),
  contactPerson: z.string(),
  rateEscalationDate: z.string().optional().nullable(),
  rateEscalationPercent: z.number().optional().nullable(),
  agreementPeriod: z.number().int().optional().nullable(),
  electricityCharges: z.number().optional().nullable(),
  waterCharges: z.number().optional().nullable(),
  remarks: z.string().optional().nullable(),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]).default("PENDING"),
  documentUrl: z.string().url().optional().nullable(),
  monthlyRentAmount: z.number().optional().nullable(),
});

// Validation schema for updating an agreement
const updateAgreementSchema = z.object({
  spaceId: z.string().cuid(),
  userId: z.string().cuid(),
  clientName: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  spaceType: z.enum(["REGULAR", "COLD", "HAZARDOUS", "OUTDOOR"]),
  areaSqft: z.number(),
  monthlyRatePerSqft: z.number().optional().nullable(),
  monthlyRentAmount: z.number(),
  handoverDate: z.string().optional().nullable(),
  rentStartDate: z.string(),
  rateEscalationDate: z.string().optional().nullable(),
  rateEscalationPercent: z.number().optional().nullable(),
  agreementPeriod: z.number().int().optional().nullable(),
  electricityCharges: z.number().optional().nullable(),
  waterCharges: z.number().optional().nullable(),
  remarks: z.string().optional().nullable(),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]).default("PENDING"),
  documentUrl: z.string().optional().nullable(),
});

// Server action to create a new agreement
export async function createAgreement(formData: FormData) {
  try {
    const documentUrl = formData.get('documentUrl') as string | null;
    console.log('FormData received:', Object.fromEntries(formData));
    console.log('Document URL:', documentUrl);

    const data = createAgreementSchema.parse({
      spaceId: formData.get("spaceId"),
      userId: formData.get("userId"),
      contactPerson: formData.get("contactPerson"),
      handoverDate: formData.get("handoverDate"),
      rentStartDate: formData.get("rentStartDate"),
      rateEscalationDate: formData.get("rateEscalationDate"),
      rateEscalationPercent: formData.get("rateEscalationPercent")
        ? Number(formData.get("rateEscalationPercent"))
        : null,
      agreementPeriod: formData.get("agreementPeriod")
        ? Number(formData.get("agreementPeriod"))
        : null,
      electricityCharges: formData.get("electricityCharges")
        ? Number(formData.get("electricityCharges"))
        : null,
      waterCharges: formData.get("waterCharges")
        ? Number(formData.get("waterCharges"))
        : null,
        monthlyRentAmount: formData.get("monthlyRentAmount")
        ? Number(formData.get("monthlyRentAmount"))
        : null,
      status: formData.get("status"),
      documentUrl,
    });

    console.log('Parsed data:', data);

    const space = await prisma.space.findUnique({
      where: { id: data.spaceId },
      include: { client: true },
    });

    if (!space) {
      throw new Error("Space not found.");
    }

    if (space.status !== "AVAILABLE") {
      throw new Error("Space is not available for agreement.");
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const monthlyRatePerSqft =
      space.rate && space.size ? space.rate / space.size : null;

    console.log('Creating agreement with data:', {
      spaceId: data.spaceId,
      userId: data.userId,
      clientName: user.name,
      documentUrl: data.documentUrl,
    });

    const agreement = await prisma.agreement.create({
      data: {
        spaceId: data.spaceId,
        userId: data.userId,
        clientName: user.name,
        contactPerson: data.contactPerson || "",
        spaceType: space.type,
        areaSqft: space.size,
        monthlyRatePerSqft,
        monthlyRentAmount: data?.monthlyRentAmount || 0,
        handoverDate: data.handoverDate
          ? new Date(data.handoverDate)
          : null,
        rentStartDate: new Date(data.rentStartDate),
        rateEscalationDate: data.rateEscalationDate
          ? new Date(data.rateEscalationDate)
          : null,
        rateEscalationPercent: data.rateEscalationPercent,
        agreementPeriod: data.agreementPeriod,
        electricityCharges: data.electricityCharges,
        waterCharges: data.waterCharges,
        remarks: data.remarks,
        status: data.status,
        documentUrl: data.documentUrl,
      },
    });

    console.log('Agreement created:', agreement);

    await prisma.space.update({
      where: { id: data.spaceId },
      data: {
        status: "OCCUPIED",
        clientId: data.userId,
      },
    });

    console.log('Space updated');

    revalidatePath("/agreements");
    return { success: true, agreement };
  } catch (error) {
    console.error('Error in createAgreement:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        error: `Database error: ${error.message} (Code: ${error.code})`,
      };
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.message}`,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create agreement",
    };
  }
}

// Server action to update an existing agreement
export async function updateAgreement(id: string, formData: FormData) {
  try {
    // Parse and validate input from frontend
    const data = updateAgreementSchema.parse({
      spaceId: formData.get("spaceId"),
      userId: formData.get("userId"),
      clientName: formData.get("clientName"),
      contactPerson: formData.get("contactPerson"),
      spaceType: formData.get("spaceType"),
      areaSqft: Number(formData.get("areaSqft")),
      monthlyRatePerSqft: formData.get("monthlyRatePerSqft")
        ? Number(formData.get("monthlyRatePerSqft"))
        : null,
      monthlyRentAmount: Number(formData.get("monthlyRentAmount")),
      handoverDate: formData.get("handoverDate"),
      rentStartDate: formData.get("rentStartDate"),
      rateEscalationDate: formData.get("rateEscalationDate"),
      rateEscalationPercent: formData.get("rateEscalationPercent")
        ? Number(formData.get("rateEscalationPercent"))
        : null,
      agreementPeriod: formData.get("agreementPeriod")
        ? Number(formData.get("agreementPeriod"))
        : null,
      electricityCharges: formData.get("electricityCharges")
        ? Number(formData.get("electricityCharges"))
        : null,
      waterCharges: formData.get("waterCharges")
        ? Number(formData.get("waterCharges"))
        : null,
      remarks: formData.get("remarks"),
      status: formData.get("status"),
      documentUrl: formData.get("documentUrl") || null,
    });

    // Validate space and user existence
    const space = await prisma.space.findUnique({
      where: { id: data.spaceId },
    });

    if (!space) {
      throw new Error("Space not found");
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the status is being changed to INACTIVE
    const previousAgreement = await prisma.agreement.findUnique({
      where: { id,isDeleted: false },
    });

    const isStatusChangedToInactive = previousAgreement?.status !== 'INACTIVE' && data.status === 'INACTIVE';

    if (isStatusChangedToInactive) {
      // Mark space as available and clear clientId
      await prisma.space.update({
        where: { id: data.spaceId },
        data: {
          status: "AVAILABLE",
          clientId: null,
        },
      });
    }

    // Update the agreement
    const agreement = await prisma.agreement.update({
      where: { id },
      data: {
        spaceId: data.spaceId,
        userId: data.userId,
        clientName: data.clientName,
        contactPerson: data.contactPerson || '',
        spaceType: data.spaceType,
        areaSqft: data.areaSqft,
        monthlyRatePerSqft: data.monthlyRatePerSqft,
        monthlyRentAmount: data.monthlyRentAmount,
        handoverDate: data.handoverDate ? new Date(data.handoverDate) : null,
        rentStartDate: new Date(data.rentStartDate),
        rateEscalationDate: data.rateEscalationDate ? new Date(data.rateEscalationDate) : null,
        rateEscalationPercent: data.rateEscalationPercent,
        agreementPeriod: data.agreementPeriod,
        electricityCharges: data.electricityCharges,
        waterCharges: data.waterCharges,
        remarks: data.remarks,
        status: data.status,
        documentUrl: data.documentUrl,
      },
    });

    revalidatePath("/agreements");
    return { success: true, agreement };
  } catch (error) {
    console.error(error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update agreement" };
  }
}


// Server action to get an agreement by ID
export async function getAgreement(id: string) {
  try {
    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: { space: true, user: true },
    });

    if (!agreement) {
      throw new Error("Agreement not found");
    }

    return { success: true, agreement };
  } catch (error) {
    console.error(error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to retrieve agreement" };
  }
}

// Server action to get all agreements with pagination info
export async function getAllAgreements(take?: number, skip?: number) {
  try {
    const session = await getServerAuth();
    if (!session?.user) {
      throw new Error("Unauthorized: Please log in to access agreements");
    }

    // Default values for pagination
    const itemsPerPage = take ?? 10;
    const itemsToSkip = skip ?? 0;

    // Determine if user is admin
    const isAdmin = session.user.role === 'ADMIN';

    // Build the where clause for non-admin users
    const whereClause = {
      isDeleted: false,
      ...(isAdmin ? {} : { userId: session?.user?.id }),
    };

    // Fetch agreements with pagination and only necessary fields
    const agreements = await prisma.agreement.findMany({
      where: whereClause,
      take: itemsPerPage,
      skip: itemsToSkip,
      select: {
        id: true,
        clientName: true,
        spaceType: true,
        areaSqft: true,
        monthlyRentAmount: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total number of agreements with the same filter
    const totalItems = await prisma.agreement.count({ where: whereClause });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = Math.floor(itemsToSkip / itemsPerPage) + 1;
    const hasNextPage = itemsToSkip + itemsPerPage < totalItems;
    const hasPreviousPage = itemsToSkip > 0;

    return {
      success: true,
      agreements,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage,
        hasNextPage,
        hasPreviousPage,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to retrieve agreements" };
  }
}


// Server action to delete an agreement
export async function deleteAgreement(id: string) {
  try {

    const session = await getServerAuth();
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only admins can delete agreements');
    }
    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: { space: true, invoices: true },
    });
    if (!agreement) {
      throw new Error('Agreement not found');
    }

    // if (agreement.invoice && agreement.invoice.status !== 'PAID') {
    //   throw new Error('Cannot delete agreement with unpaid invoices');
    // }
    if (agreement.space) {
      await prisma.space.update({
        where: { id: agreement.spaceId },
        data: {
          status: 'AVAILABLE',
          clientId: null,
        },
      });
    }
    await prisma.agreement.update({
      where: { id },
      data: { isDeleted: true },
    });
    revalidatePath('/agreements');
    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete agreement" };
  }
}
export async function getAgreementsByUser(userId: string, take?: number, skip?: number) {
  try {
    // Default pagination values
    const itemsPerPage = take ?? 10;
    const itemsToSkip = skip ?? 0;


    const agreements = await prisma.agreement.findMany({
      where: { userId ,isDeleted: false }, // ✅ this checks if no invoice exists
      take: itemsPerPage,
      skip: itemsToSkip,
      select: {
        id: true,
        clientName: true,
        spaceType: true,
        areaSqft: true,
        monthlyRentAmount: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    });


    // Count total agreements for the user
    const totalItems = await prisma.agreement.count({
      where: { userId },
    });

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = Math.floor(itemsToSkip / itemsPerPage) + 1;
    const hasNextPage = itemsToSkip + itemsPerPage < totalItems;
    const hasPreviousPage = itemsToSkip > 0;

    return {
      success: true,
      agreements,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage,
        hasNextPage,
        hasPreviousPage,
      },
    };
  } catch (error) {
    console.error("Error fetching agreements for user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch agreements",
    };
  }
}

export const getSpacesByAgreement = async (clientId: string) => {
  try {
    const agreements = await prisma.agreement.findMany({
      where: {
        userId: clientId,
        status: "ACTIVE",
        isDeleted: false, 
       
      },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            spaceCode: true,

          },
        },
      },
    });
    //console.log(agreements)

    const allSpaces = agreements.map((agreement) => ({
      ...agreement.space,
      agreementId: agreement.id,
    }));

    return {
      success: true,
      data: allSpaces,
    };
  } catch (error) {
    console.error("Error fetching spaces by agreement:", error);
    return {
      success: false,
      error: "Failed to fetch spaces for client",
    };
  }
};


//₹