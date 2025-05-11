"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";


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
  agreementId: z.string().cuid("Invalid agreement ID").optional(),
  documentUrl: z.string().optional(),
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
  documentUrl: z.string().optional(),
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
      agreementId: formData.get("agreementId"), // Assuming agreementId is part of the form data
      documentUrl: formData.get("documentUrl"),
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

    // Check if agreement exists (if applicable)
    const agreement = data.agreementId
      ? await prisma.agreement.findUnique({
        where: { id: data.agreementId },
      })
      : null;

    if (data.agreementId && !agreement) {
      throw new Error("Agreement not found");
    }

    // Create the invoice and link it to the agreement (if applicable)
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
        agreement: data.agreementId ? { connect: { id: data.agreementId } } : undefined,
        documentUrl: data.documentUrl
      },
    });

    // Optionally update the agreement or perform any other action
    if (agreement) {

      await prisma.agreement.update({
        where: { id: agreement.id },
        data: {
          invoice: {
            connect: { id: invoice.id },
          },
        },
      });
    }

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
const getInvoicesSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  clientId: z.string().optional(),
  spaceId: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["PAID", "PENDING", "OVERDUE"]).optional(),
})

export async function getInvoices({
  page = 1,
  limit = 10,
  clientId,
  spaceId,
  search,
  status,
}: {
  page?: number
  limit?: number
  clientId?: string
  spaceId?: string
  search?: string
  status?: "PAID" | "PENDING" | "OVERDUE"
}) {
  try {
    // 1. Authenticate and authorize the request
    const session = await getServerAuth()
    if (!session?.user) {
      throw new Error("Unauthorized: Please log in to access invoices")
    }

    // 2. Get the user's actual role from database (never trust session alone)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // 3. Validate input
    const validated = getInvoicesSchema.parse({ page, limit, clientId, spaceId, search, status })
    const skip = (validated.page - 1) * validated.limit

    // 4. Build secure query conditions
    const where: any = {
      // For customers, only show their own invoices
      ...(user.role === 'CUSTOMER' && { clientId: user.id }),
      // For admins, allow filtering by clientId if provided
      ...(user.role === 'ADMIN' && validated.clientId && { clientId: validated.clientId }),
      // Common filters
      ...(validated.spaceId && { spaceId: validated.spaceId }),
      ...(validated.search && {
        OR: [
          { invoiceNumber: { contains: validated.search, mode: "insensitive" } },
          { client: { name: { contains: validated.search, mode: "insensitive" } } },
        ]
      }),
      ...(validated.status && { status: validated.status }),
    }

    // 5. Execute queries
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
        where,
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
    ])

    // 6. Calculate statistics
    const invoiceStats = {
      total: { amount: 0, count: 0 },
      paid: { amount: 0, count: 0 },
      pending: { amount: 0, count: 0 },
      overdue: { amount: 0, count: 0 },
    }

    stats.forEach((stat) => {
      const amount = stat._sum.totalAmount || 0
      const count = stat._count.id || 0
      if (stat.status === "PAID") {
        invoiceStats.paid = { amount, count }
      } else if (stat.status === "PENDING") {
        invoiceStats.pending = { amount, count }
      } else if (stat.status === "OVERDUE") {
        invoiceStats.overdue = { amount, count }
      }
      invoiceStats.total.amount += amount
      invoiceStats.total.count += count
    })

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
    }
  } catch (error) {
    console.error("Get invoices error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invoices",
    }
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
      documentUrl: formData.get("documentUrl"),
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
        documentUrl: data.documentUrl
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