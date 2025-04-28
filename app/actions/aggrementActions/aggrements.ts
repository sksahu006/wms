
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";


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
});

// Server action to create a new agreement
export async function createAgreement(formData: FormData) {
  try {
    // Parse and validate input from frontend
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
      remarks: formData.get("remarks"),
      status: formData.get("status"),
    });

    // Fetch space data with associated client
    const space = await prisma.space.findUnique({
      where: { id: data.spaceId },
      include: { client: true },
    });

    if (!space) {
      throw new Error("Space not found");
    }

    // Fetch user data to verify existence
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Calculate monthly rate per sqft
    const monthlyRatePerSqft = space.rate && space.size ? space.rate / space.size : null;

    // Create the agreement
    const agreement = await prisma.agreement.create({
      data: {
        spaceId: data.spaceId,
        userId: data.userId,
        clientName: user.name,
        contactPerson: data.contactPerson || '',
        spaceType: space.type,
        areaSqft: space.size,
        monthlyRatePerSqft,
        monthlyRentAmount: space.rate || 0,
        handoverDate: data.handoverDate ? new Date(data.handoverDate) : null,
        rentStartDate: new Date(data.rentStartDate),
        rateEscalationDate: data.rateEscalationDate ? new Date(data.rateEscalationDate) : null,
        rateEscalationPercent: data.rateEscalationPercent,
        agreementPeriod: data.agreementPeriod,
        electricityCharges: data.electricityCharges,
        waterCharges: data.waterCharges,
        remarks: data.remarks,
        status: data.status,
      },
    });

    revalidatePath("/agreements");
    return { success: true, agreement };
  } catch (error) {
    console.error(error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create agreement" };
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
      // Default values for pagination
      const itemsPerPage = take ?? 10;
      const itemsToSkip = skip ?? 0;
  
      // Fetch agreements with pagination and only necessary fields
      const agreements = await prisma.agreement.findMany({
        take: itemsPerPage,
        skip: itemsToSkip,
        select: { // Only select the necessary fields
          id: true,
          clientName: true,
          spaceType: true,
          areaSqft: true,
          monthlyRentAmount: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      });
  
      // Get total number of agreements
      const totalItems = await prisma.agreement.count();
  
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
    await prisma.agreement.delete({
      where: { id },
    });

    revalidatePath("/agreements");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete agreement" };
  }
}