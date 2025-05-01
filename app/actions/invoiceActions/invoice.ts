"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";


// Schema for creating an invoice
const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required").regex(/^INV-\d+$/, "Invoice number must start with 'INV-' followed by digits"),
  clientId: z.string().cuid("Invalid client ID"),
  spaceId: z.string().cuid("Invalid space ID"),
  date: z.string().datetime({ message: "Invalid date format" }),
  amount: z.number().positive("Amount must be positive"),
  tax: z.number().nonnegative("Tax must be non-negative"),
  totalAmount: z.number().positive("Total amount must be positive"),
  dueDate: z.string().datetime({ message: "Invalid due date format" }),
});

// Schema for updating an invoice
const updateInvoiceSchema = z.object({
  id: z.string().cuid("Invalid invoice ID"),
  invoiceNumber: z.string().min(1, "Invoice number is required").regex(/^INV-\d+$/, "Invoice number must start with 'INV-' followed by digits").optional(),
  clientId: z.string().cuid("Invalid client ID").optional(),
  spaceId: z.string().cuid("Invalid space ID").optional(),
  date: z.string().datetime({ message: "Invalid date format" }).optional(),
  amount: z.number().positive("Amount must be positive").optional(),
  tax: z.number().nonnegative("Tax must be non-negative").optional(),
  totalAmount: z.number().positive("Total amount must be positive").optional(),
  dueDate: z.string().datetime({ message: "Invalid due date format" }).optional(),
  status: z.enum(["PAID", "PENDING", "OVERDUE"]).optional(),
});

// Schema for getting an invoice
const getInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
});

// Schema for listing invoices
const getInvoicesSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  clientId: z.string().cuid("Invalid client ID").optional(),
  spaceId: z.string().cuid("Invalid space ID").optional(),
  search: z.string().optional(),
  status: z.enum(["PAID", "PENDING", "OVERDUE"]).optional(),
});

// Schema for deleting an invoice
const deleteInvoiceSchema = z.object({
  id: z.string().cuid("Invalid invoice ID"),
});

// Create an invoice
export async function createInvoice(formData: FormData) {
  try {
    const data = createInvoiceSchema.parse({
      invoiceNumber: formData.get("invoiceNumber"),
      clientId: formData.get("clientId"),
      spaceId: formData.get("spaceId"),
      date: formData.get("date"),
      amount: parseFloat(formData.get("amount") as string),
      tax: parseFloat(formData.get("tax") as string),
      totalAmount: parseFloat(formData.get("totalAmount") as string),
      dueDate: formData.get("dueDate"),
    });

    // Validate totalAmount
    if (Math.abs(data.totalAmount - (data.amount + data.tax)) > 0.01) {
      throw new Error("Total amount must equal amount + tax");
    }

    // Check if client exists
    const client = await prisma.user.findUnique({
      where: { id: data.clientId },
    });
    if (!client) {
      throw new Error("Client not found");
    }

    // Check if space exists
    const space = await prisma.space.findUnique({
      where: { id: data.spaceId },
    });
    if (!space) {
      throw new Error("Space not found");
    }

    // Check if invoiceNumber is unique
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: data.invoiceNumber },
    });
    if (existingInvoice) {
      throw new Error("Invoice number already exists");
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        clientId: data.clientId,
        spaceId: data.spaceId,
        date: new Date(data.date),
        amount: data.amount,
        tax: data.tax,
        totalAmount: data.totalAmount,
        dueDate: new Date(data.dueDate),
        status: "PENDING",
      },
    });

    revalidatePath("/dashboard/invoices");
    return {
      success: true,
      data: invoice,
      message: "Invoice created successfully",
    };
  } catch (error) {
    console.error("Create invoice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}

// Get an invoice by invoiceNumber
export async function getInvoice(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: id },
      include: {
        client: { select: { id: true, name: true } },
        space: { select: { id: true, spaceCode: true } },
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    return { success: true, data: invoice };
  } catch (error) {
    console.error("Get invoice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invoice",
    };
  }
}

// Get a list of invoices with pagination, filters, and stats
export async function getInvoices({
  page = 1,
  limit = 10,
  clientId,
  spaceId,
  search,
  status,
}: {
  page?: number;
  limit?: number;
  clientId?: string;
  spaceId?: string;
  search?: string;
  status?: "PAID" | "PENDING" | "OVERDUE";
}) {
  try {
    const validated = getInvoicesSchema.parse({ page, limit, clientId, spaceId, search, status });

    const skip = (validated.page - 1) * validated.limit;

    const where: any = {};
    if (validated.clientId) {
      where.clientId = validated.clientId;
    }
    if (validated.spaceId) {
      where.spaceId = validated.spaceId;
    }
    if (validated.search) {
      where.OR = [
        { invoiceNumber: { contains: validated.search, mode: "insensitive" } },
        { client: { name: { contains: validated.search, mode: "insensitive" } } },
      ];
    }
    if (validated.status) {
      where.status = validated.status;
    }

    const [invoices, total, stats] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: validated.limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { id: true, name: true } },
          space: { select: { id: true, spaceCode: true } },
        },
      }),
      prisma.invoice.count({ where }),
      prisma.invoice.groupBy({
        by: ["status"],
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
    ]);

    // Calculate statistics
    const invoiceStats = {
      total: { amount: 0, count: 0 },
      paid: { amount: 0, count: 0 },
      pending: { amount: 0, count: 0 },
      overdue: { amount: 0, count: 0 },
    };

    stats.forEach((stat) => {
      const amount = stat._sum.totalAmount || 0;
      const count = stat._count.id || 0;
      if (stat.status === "PAID") {
        invoiceStats.paid = { amount, count };
      } else if (stat.status === "PENDING") {
        invoiceStats.pending = { amount, count };
      } else if (stat.status === "OVERDUE") {
        invoiceStats.overdue = { amount, count };
      }
      invoiceStats.total.amount += amount;
      invoiceStats.total.count += count;
    });

    return {
      success: true,
      data: {
        invoices,
        page: validated.page,
        limit: validated.limit,
        totalPages: Math.ceil(total / validated.limit),
        totalItems: total,
        stats: invoiceStats,
      },
    };
  } catch (error) {
    console.error("Get invoices error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invoices",
    };
  }
}

// Update an invoice
export async function updateInvoice(formData: FormData) {
  try {
    const data = updateInvoiceSchema.parse({
      id: formData.get("id"),
      invoiceNumber: formData.get("invoiceNumber"),
      clientId: formData.get("clientId"),
      spaceId: formData.get("spaceId"),
      date: formData.get("date"),
      amount: formData.get("amount") ? parseFloat(formData.get("amount") as string) : undefined,
      tax: formData.get("tax") ? parseFloat(formData.get("tax") as string) : undefined,
      totalAmount: formData.get("totalAmount") ? parseFloat(formData.get("totalAmount") as string) : undefined,
      dueDate: formData.get("dueDate"),
      status: formData.get("status"),
    });

    // Validate totalAmount if provided
    if (data.amount !== undefined && data.tax !== undefined && data.totalAmount !== undefined) {
      if (Math.abs(data.totalAmount - (data.amount + data.tax)) > 0.01) {
        throw new Error("Total amount must equal amount + tax");
      }
    }

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: data.id },
    });
    if (!existingInvoice) {
      throw new Error("Invoice not found");
    }

    // Check if new invoiceNumber is unique (if provided)
    if (data.invoiceNumber && data.invoiceNumber !== existingInvoice.invoiceNumber) {
      const duplicateInvoice = await prisma.invoice.findUnique({
        where: { invoiceNumber: data.invoiceNumber },
      });
      if (duplicateInvoice) {
        throw new Error("Invoice number already exists");
      }
    }

    // Check if client exists (if provided)
    if (data.clientId) {
      const client = await prisma.user.findUnique({
        where: { id: data.clientId },
      });
      if (!client) {
        throw new Error("Client not found");
      }
    }

    // Check if space exists (if provided)
    if (data.spaceId) {
      const space = await prisma.space.findUnique({
        where: { id: data.spaceId },
      });
      if (!space) {
        throw new Error("Space not found");
      }
    }

    const invoice = await prisma.invoice.update({
      where: { id: data.id },
      data: {
        invoiceNumber: data.invoiceNumber,
        clientId: data.clientId,
        spaceId: data.spaceId,
        date: data.date ? new Date(data.date) : undefined,
        amount: data.amount,
        tax: data.tax,
        totalAmount: data.totalAmount,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status,
      },
    });

    revalidatePath("/dashboard/invoices");
    return {
      success: true,
      data: invoice,
      message: "Invoice updated successfully",
    };
  } catch (error) {
    console.error("Update invoice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update invoice",
    };
  }
}

// Delete an invoice
export async function deleteInvoice(id: string) {
  try {
    const { id: validatedId } = deleteInvoiceSchema.parse({ id });

    const invoice = await prisma.invoice.findUnique({
      where: { id: validatedId },
    });
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    await prisma.invoice.delete({
      where: { id: validatedId },
    });

    revalidatePath("/dashboard/invoices");
    return { success: true, message: "Invoice deleted successfully" };
  } catch (error) {
    console.error("Delete invoice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete invoice",
    };
  }
}