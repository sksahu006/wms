"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma, Role, Status } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { ClientDetails } from "@/lib/types";
import { getServerAuth } from "@/lib/auth";

// Schema for form validation
const UpdateSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  businessType: z.string().optional(),
  taxId: z.string().optional(),
  requirements: z.string().optional(),
  businessLicense: z.string().optional(),
  taxCertificate: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),

});

// Schema for form validation
const RegisterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact person name is required"),
  position: z.string().min(1, "Position is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Business address is required"),
  businessType: z.string().min(1, "Business type is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  requirements: z.string().min(1, "Storage requirements are required"),
  businessLicense: z.string().nullable(), // Allow null for optional fields
  taxCertificate: z.string().nullable(), // Allow null for optional fields
});
type SpaceStatusString = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "RESERVED";


// Mock function to simulate file upload (replace with actual storage logic, e.g., S3)
// For now, this function remains in case you decide to re-enable file uploads later.
async function uploadFile(file: File): Promise<string | null> {
  // Simulate uploading file and returning a URL
  // In production, use a service like AWS S3, Supabase Storage, or Cloudinary
  return file ? `https://example.com/uploads/${file.name}` : null;
}


export async function registerUser(formData: FormData) {
  try {
    // Extract form fields
    const companyName = formData.get("companyName") as string;
    const contactName = formData.get("contactName") as string;
    const position = formData.get("position") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const businessType = formData.get("businessType") as string;
    const taxId = formData.get("taxId") as string;
    const requirements = formData.get("requirements") as string;
    const password = formData.get("password") as string;
    // Commenting out file extraction for now
    // const businessLicenseFile = formData.get("businessLicense") as File | null;
    // const taxCertificateFile = formData.get("taxCertificate") as File | null;

    // Validate form data
    const validatedData = RegisterSchema.parse({
      companyName,
      contactName,
      position,
      email,
      phone,
      address,
      businessType,
      taxId,
      requirements,
      businessLicense: null, // Set after upload
      taxCertificate: null, // Set after upload
    });

    // Log validated data for debugging

    // Handle file uploads (commented out for now)
    // const businessLicense = businessLicenseFile
    //   ? await uploadFile(businessLicenseFile)
    //   : null;
    // const taxCertificate = taxCertificateFile
    //   ? await uploadFile(taxCertificateFile)
    //   : null;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "A user with this email already exists.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user in Prisma
    await prisma.user.create({
      data: {
        email,
        name: contactName,
        companyName,
        contactName,
        position,
        phone,
        password: hashedPassword,
        address,
        businessType,
        taxId,
        requirements,
        // For now, storing null for file fields
        businessLicense: null,
        taxCertificate: null,
        role: "CUSTOMER",
        emailVerified: null, // Set emailVerified to null (not verified)
      },
    });

    const text = `
Hi there,

Thank you for registering with us. Your account has been successfully created and is currently pending approval.

You will receive an email once your account has been reviewed and verified by our team.

If you have any questions in the meantime, feel free to reach out.

Best regards,  
The [Your Company Name] Team
`;
    const html = `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #2c3e50;">👋 Welcome to [Your Company Name]</h2>
  <p style="font-size: 16px; color: #555;">
    Thank you for registering with us. Your account has been <strong>successfully created</strong> and is currently <strong>pending approval</strong>.
  </p>
  <p style="font-size: 16px; color: #555;">
    You’ll receive a confirmation email once our team has reviewed and verified your account.
  </p>
  <p style="font-size: 16px; color: #555;">
    If you have any questions, feel free to reply to this email or contact our support team.
  </p>
  <hr style="margin: 20px 0;" />
  <p style="font-size: 14px; color: #999;">
    Best regards,<br/>
    The [Your Company Name] Team
  </p>
</div>
`;

    await sendEmail({
      to: email,
      subject: "Your Account Will Be Verified Soon",
      text,
      html,
    });

    // Revalidate any cached paths (optional, if needed)
    revalidatePath("/register");

    return {
      success: true,
      message: "Registration successful. You will be notified once approved.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration.",
      details: error,
    };
  }
}

export async function getClients(
  page: number = 1,
  pageSize: number = 10,
  status: Status = Status.ACTIVE,
  searchTerm: string = ""
) {
  try {
    // Calculate the number of records to skip
    const skip = (page - 1) * pageSize;

    // Fetch paginated clients
    const clients = await prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
        status: status,
        name: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        contactName: true,
        phone: true,
        address: true,
        businessType: true,
        created: true,
        spaces: true,
      },
      skip,
      take: pageSize,
      orderBy: {
        created: "desc",
      },
    });

    const totalClients = await prisma.user.count({
      where: {
        role: Role.CUSTOMER,
        status: status,
      },
    });

    return {
      success: true,
      clients,
      pagination: {
        page,
        pageSize,
        total: totalClients,
        totalPages: Math.ceil(totalClients / pageSize),
      },
    };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { success: false, error: "Failed to fetch clients" };
  }
}
export async function getClientById(id: string) {
  try {
    const session = await getServerAuth();
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only admins can view client details');
    }

    const client = await prisma.user.findUnique({
      where: { id, isDeleted: false, status: 'PENDING' },
      select: {
        id: true,
        name: true,
        contactName: true,
        position: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        businessType: true,
        taxId: true,
        requirements: true,
        businessLicense: true,
        taxCertificate: true,
        created: true,
        companyName: true,
      },
    });

    if (!client) {
      throw new Error('Client not found or not pending');
    }

    return { success: true, data: client };
  } catch (error) {
    console.error('Get client error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch client',
    };
  }
}

export async function updateUser(formData: FormData): Promise<void> {
  try {
    // Extract form fields
    const id = formData.get("id") as string;
    const status = formData.get("status") as Status;
    const email = formData.get("email") as string | null; // Get email if available

    // Validate form data
    const validatedData = UpdateSchema.parse({
      id,
      status,
      email,
    });

    // Update user in Prisma
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status,
        emailVerified: status === "ACTIVE" ? new Date() : null, // Set emailVerified if active
      },
    });
    revalidatePath("/dashboard/clients/pending");

    const verifiedText = `
Hi there,

Good news! Your account has been successfully verified.

You can now log in using your registered email: ${email}

We're excited to have you on board. If you have any questions, feel free to reach out.

Best regards,  
The [Your Company Name] Team
`;

    const verifiedHtml = `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #2c3e50;">✅ Your Account Has Been Verified</h2>
  <p style="font-size: 16px; color: #555;">
    Good news! Your account has been <strong>successfully verified</strong>.
  </p>
  <p style="font-size: 16px; color: #555;">
    You can now log in using your registered email: <strong>${email}</strong>
  </p>
  <p style="font-size: 16px; color: #555;">
    We're excited to have you with us! If you have any questions, feel free to reply to this email.
  </p>
  <hr style="margin: 20px 0;" />
  <p style="font-size: 14px; color: #999;">Best regards,<br/>The [Your Company Name] Team</p>
</div>
`;

    const rejectedText = `
Hi there,

We appreciate your interest in joining us. However, after careful review, we regret to inform you that your account registration request has been rejected.

If you believe this was a mistake or would like further clarification, feel free to contact our support team.

Best regards,  
The [Your Company Name] Team
`;
    const rejectedHtml = `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #e74c3c;">⚠️ Registration Request Update</h2>
  <p style="font-size: 16px; color: #555;">
    Thank you for your interest in joining <strong>[Your Company Name]</strong>. After careful review, we regret to inform you that your registration request has been <strong>rejected</strong>.
  </p>
  <p style="font-size: 16px; color: #555;">
    If you feel this was a mistake or would like to reapply, please don't hesitate to get in touch with us.
  </p>
  <hr style="margin: 20px 0;" />
  <p style="font-size: 14px; color: #999;">Best regards,<br/>The [Your Company Name] Team</p>
</div>
`;

    // Send email based on status
    if (email) {
      if (status === "ACTIVE") {
        await sendEmail({
          to: email,
          subject: "Your Account Has Been Verified",
          text: verifiedText,
          html: verifiedHtml,
        });
      } else if (status === "INACTIVE") {
        await sendEmail({
          to: email,
          subject: "Your Account Registration Request",
          text: rejectedText,
          html: rejectedHtml,
        });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      throw new Error(error.errors.map((e) => e.message).join(", "));
    }
    console.error("Update error:", error);
    throw new Error("An unexpected error occurred during update.");
  }
}

const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export async function getUsers({ page = 1, pageSize = 15, search = "" }) {
  try {
    const {
      page: parsedPage,
      pageSize: parsedPageSize,
      search: parsedSearch,
    } = paginationSchema.parse({ page, pageSize, search });
    const usersss = await prisma.user.findMany({ where: { role: Role.CUSTOMER, status: Status.ACTIVE } });
    //console.log(usersss);

    const skip = (parsedPage - 1) * parsedPageSize;

    const where = parsedSearch
      ? {
        status: Status.ACTIVE, // Use the Status enum
        OR: [
          {
            name: {
              contains: parsedSearch,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            email: {
              contains: parsedSearch,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        ],
        role: Role.CUSTOMER,
      }
      : { role: Role.CUSTOMER, status: Status.ACTIVE }; // Default condition for active customers

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          agreements: true,
        },
        skip,
        take: parsedPageSize,
        orderBy: { name: "asc" },
      }),
      prisma.user.count({ where }), // Simple count query
    ]);

    return {
      success: true,
      data: users,
      pagination: {
        page: parsedPage,
        pageSize: parsedPageSize,
        total,
        totalPages: Math.ceil(total / parsedPageSize),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to fetch users",
      data: [],
      pagination: { page: 0, pageSize: 0, total: 0, totalPages: 0 },
    };
  }
}

export async function getSpaces({ page = 1, pageSize = 10, search = "", SpaceStatus, clientId }: { page?: number; pageSize?: number; search?: string; SpaceStatus?: SpaceStatusString, clientId?: string }) {
  try {
    const {
      page: parsedPage,
      pageSize: parsedPageSize,
      search: parsedSearch,
    } = paginationSchema.parse({ page, pageSize, search });

    const skip = (parsedPage - 1) * parsedPageSize;

    const searchCondition = parsedSearch
      ? {
        OR: [
          {
            name: {
              contains: parsedSearch,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            spaceCode: {
              contains: parsedSearch,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            description: {
              contains: parsedSearch,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        ],
      }
      : {};
    const statusCondition = SpaceStatus === "AVAILABLE"
      ? { status: { equals: "AVAILABLE" as SpaceStatusString } } // Use proper typing for status
      : {};

    const clientIdCondition = clientId
      ? { clientId: { equals: clientId } }
      : {};
    const where = {
      ...searchCondition,
      ...statusCondition,
      ...clientIdCondition
    };

    const [spaces, total] = await Promise.all([
      prisma.space.findMany({
        where,
        select: {
          id: true,
          spaceCode: true,
          name: true,
          description: true,
          status: true,
          images: true,
          type: true,
          size: true,
          rate: true,

        },
        skip,
        take: parsedPageSize,
        orderBy: { spaceCode: "asc" },
      }),
      prisma.space.count({ where }),
    ]);

    return {
      success: true,
      data: spaces,
      pagination: {
        page: parsedPage,
        pageSize: parsedPageSize,
        total,
        totalPages: Math.ceil(total / parsedPageSize),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to fetch spaces",
      data: [],
      pagination: { page: 0, pageSize: 0, total: 0, totalPages: 0 },
    };
  }
}


export async function getClientDetails(clientId: string): Promise<{
  success: boolean;
  client: ClientDetails | null;
  error?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: clientId },
    });

    if (!user) return { success: false, client: null, error: 'Client not found' };

    const client: ClientDetails = {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      contact: user.contactName,
      position: user.position,
      companyName: user.companyName,
      phone: user.phone,
      address: user.address,
      joinedDate: user.created.toISOString().split('T')[0],
      businessType: user.businessType,
      taxId: user.taxId,
      requirements: user.requirements, // or `remarks` if that's more appropriate
    };

    return { success: true, client };
  } catch (error) {
    console.error('[getClientDetails]', error);
    return { success: false, client: null, error: 'Something went wrong' };
  }
}
export async function updateClient(data: {
  id: string;
  companyName: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  taxId: string;
  status: string;
  requirements?: string;
}) {
  try {
    // Validate input data
    const validatedData = UpdateSchema.parse(data);

    const {
      id,
      name,
      companyName,
      position,
      email,
      phone,
      address,
      businessType,
      taxId,
      status,
      requirements,

    } = validatedData;

    // Perform database update (assumes Prisma is set up with a `client` model)
    const updatedClient = await prisma.user.update({
      where: { id },
      data: {
        name,
        companyName,
        position,
        email,
        phone,
        address,
        businessType,
        taxId,
        status,
        requirements,

      },
    });

    return { success: true, client: updatedClient };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update client",
    };
  }
}

export async function getPendingClientsCount() {
  try {
    const pendingClientsCount = await prisma.user.count({
      where: {
        role: Role.CUSTOMER,
        status: Status.PENDING,
      },
    });
    return { success: true, pendingClientsCount };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch pending clients count" };
  }
}