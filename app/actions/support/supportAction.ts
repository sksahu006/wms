"use server"

type SupportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"; // Define the SupportStatus type

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

// Create Support Ticket
export async function createSupportTicket(formData: FormData) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        throw new Error("Unauthorized")
      }
  
      const title = formData.get("title") as string
      const category = formData.get("category") as string
      const priority = formData.get("priority") as string
      const spaceId = formData.get("spaceId") as string | null
      const description = formData.get("description") as string
      const document = formData.get("attachments") as File | null
  
      if (!title || !category || !priority || !description) {
        throw new Error("Missing required fields")
      }
  
      let documentPath: string | undefined
      if (document && document.size > 0) {
        documentPath = document.name // Placeholder – replace with upload logic
      }
  
      const supportTicket = await prisma.support.create({
        data: {
          subject: title,
          message: description,
          category,
          priority,
          spaceId: spaceId || undefined,
          document: documentPath,
          clientId: session.user.id,
        },
      })
  
      revalidatePath("/dashboard/support")
  
      return { success: true, ticketId: supportTicket.id }
    } catch (error) {
      console.error("Error creating support ticket:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create ticket",
      }
    }
  }  

// Read Support Tickets
export async function getSupportTickets(
    page: number = 1,
    pageSize: number = 10,
    filter: string = "all",
    search: string = ""
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }
  
      const skip = (page - 1) * pageSize;
  
      // Build where clause
      const where: any = {};

      // Apply clientId condition if user is a customer
      if (session.user.role === "CUSTOMER") {
        where.clientId = session.user.id;
      }
  
      // Apply status filter
      if (filter === "open") {
        where.status = { in: ["OPEN", "IN_PROGRESS"] };
      } else if (filter === "resolved") {
        where.status = "RESOLVED";
      }
  
      // Apply search
      if (search) {
        where.OR = [
          { id: { contains: search, mode: "insensitive" } },
          { subject: { contains: search, mode: "insensitive" } },
        ];
      }
  
      // Fetch paginated tickets
      const tickets = await prisma.support.findMany({
        where,
        include: {
          space: {
            select: {
              spaceCode: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      });
  
      // Fetch statistics
      const totalTickets = await prisma.support.count({
        where: {
          clientId: session.user.id,
        },
      });
  
      const openTickets = await prisma.support.count({
        where: {
          clientId: session.user.id,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      });
  
      const resolvedTickets = await prisma.support.count({
        where: {
          clientId: session.user.id,
          status: "RESOLVED",
        },
      });
  
      // Calculate pagination for filtered results
      const filteredCount = await prisma.support.count({ where });
  
      return {
        success: true,
        tickets,
        pagination: {
          page,
          pageSize,
          total: filteredCount,
          totalPages: Math.ceil(filteredCount / pageSize),
        },
        stats: {
          totalTickets,
          openTickets,
          resolvedTickets,
        },
      };
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch tickets",
      };
    }
  }

// Read Single Support Ticket
export async function getSupportTicket(id: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error("Unauthorized")
        }

        const ticket = await prisma.support.findUnique({
          where: {
            id,
          },
          include: {
            space: {
              select: {
                spaceCode: true,
                name: true,
              },
            },
            client: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        })

        if (!ticket) {
          
            return { success: false, error: "Ticket not found" }
        }

        return { success: true, ticket }
    } catch (error) {
        console.error("Error fetching support ticket:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch ticket"
        }
    }
}

// Update Support Ticket
export async function updateSupportTicket(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error("Unauthorized")

    const status = formData.get("status") as SupportStatus
    const priority = formData.get("priority") as string
    const comment = formData.get("comment") as string

    if (!status || !priority || !comment) {
      throw new Error("Missing required fields")
    }

    await prisma.support.update({
      where: { id },
      data: {
        status: status as SupportStatus,
        priority,
        message: comment, 
      },
    })

    revalidatePath(`/support/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating support ticket:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update ticket",
    }
  }
}


// Delete Support Ticket
export async function deleteSupportTicket(id: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            throw new Error("Unauthorized")
        }

        await prisma.support.delete({
            where: {
                id,
                clientId: session.user.id,
            },
        })

        revalidatePath("/dashboard/support")
        return { success: true }
    } catch (error) {
        console.error("Error deleting support ticket:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete ticket"
        }
    }
}