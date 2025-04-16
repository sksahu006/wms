"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Role, Status } from "@/lib/generated/prisma";
import { sendEmail } from "@/lib/email"; // Assume you have an email sending utility

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
    // Commenting out file extraction for now
    // const businessLicenseFile = formData.get("businessLicense") as File | null;
    // const taxCertificateFile = formData.get("taxCertificate") as File | null;

    // Log extracted values for debugging
    console.log("Extracted form data:", {
      companyName,
      contactName,
      position,
      email,
      phone,
      address,
      businessType,
      taxId,
      requirements,
      // businessLicenseFile,
      // taxCertificateFile,
    });

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

    // Create user in Prisma
    await prisma.user.create({
      data: {
        email,
        name: contactName,
        companyName,
        contactName,
        position,
        phone,
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
  status: Status = Status.ACTIVE
) {
  try {
    // Calculate the number of records to skip
    const skip = (page - 1) * pageSize;

    // Fetch paginated clients
    const clients = await prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
        status: status,
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
      },
      skip,
      take: pageSize,
      orderBy: {
        name: "asc",
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

    // Send email based on status
    if (email) {
      if (status === "ACTIVE") {
        await sendEmail({
          to: email,
          subject: "Your Account Has Been Verified",
          text: `Your account has been verified. You can now log in using your email: ${email}`,
        });
      } else if (status === "INACTIVE") {
        await sendEmail({
          to: email,
          subject: "Your Account Registration Request",
          text: `We regret to inform you that your account registration request has been rejected.`,
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
