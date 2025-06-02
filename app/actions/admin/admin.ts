'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma, Role, Status } from '@prisma/client';

// Schema for adding an admin
const AddAdminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  position: z.string().optional(),
  companyName: z.string().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'INACTIVE']).default('ACTIVE'),
});

// Schema for updating an admin
const UpdateAdminSchema = z.object({
  id: z.string().cuid('Invalid admin ID'),
  name: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  companyName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// Schema for pagination and search
const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(5),
  searchTerm: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
});

// Fetch admins (ACTIVE by default)
export async function getAllAdmins({
  page = 1,
  pageSize = 5,
  searchTerm = '',
  status = 'ACTIVE',
}: {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
} = {}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const { page: parsedPage, pageSize: parsedPageSize, searchTerm: parsedSearch } = PaginationSchema.parse({
      page,
      pageSize,
      searchTerm,
    });

    const skip = (parsedPage - 1) * parsedPageSize;

    const where = {
      role: Role.ADMIN,
      status: status as Status,
      isDeleted: false,
      ...(parsedSearch && {
        OR: [
          { name: { contains: parsedSearch, mode: 'insensitive' as Prisma.QueryMode } },
          { email: { contains: parsedSearch, mode: 'insensitive' as Prisma.QueryMode } },
        ],
      }),
    };

    const [admins, totalAdmins] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          position: true,
          companyName: true,
          status: true,
          created: true,
        },
        skip,
        take: parsedPageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      admins,
      pagination: {
        page: parsedPage,
        pageSize: parsedPageSize,
        total: totalAdmins,
        totalPages: Math.ceil(totalAdmins / pageSize),
      },
    };
  } catch (error) {
    console.error('Error fetching admins:', error);
    return {
      success: false,
      error: 'Failed to fetch admins',
      admins: [],
      pagination: { page: 1, pageSize: 5, total: 0, totalPages: 0 },
    };
  }
}

// Add a new admin
export async function addAdmin(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: formData.get('phone') as string,
      position: formData.get('position') as string,
      companyName: formData.get('companyName') as string,
      status: 'ACTIVE' as Status,
    };

    const validatedData = AddAdminSchema.parse(data);

    const existingAdmin = await prisma.user.findUnique({ where: { email: validatedData.email } });
    if (existingAdmin) {
      return { success: false, error: 'Email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const admin = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        position: validatedData.position,
        companyName: validatedData.companyName,
        role: Role.ADMIN,
        status: validatedData.status,
        created: new Date(),
        isDeleted: false,
      },
    });

    // await prisma.auditLog.create({
    //   data: {
    //     action: 'CREATE_ADMIN',
    //     userId: session.user.id,
    //     details: `Created new admin with email: ${validatedData.email}`,
    //     createdAt: new Date(),
    //   },
    // });

  
    revalidatePath('/dashboard/adminactions');
    return { success: true, message: 'Admin added successfully.', adminId: admin.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((e) => e.message).join(', ') };
    }
    console.error('Error adding admin:', error);
    return { success: false, error: 'Failed to add admin' };
  }
}

// Update an admin
export async function updateAdmin(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const data = {
      id: formData.get('id') as string,
      name: formData.get('name') as string | undefined,
      email: formData.get('email') as string | undefined,
      phone: formData.get('phone') as string | undefined,
      position: formData.get('position') as string | undefined,
      companyName: formData.get('companyName') as string | undefined,
      status: formData.get('status') as 'ACTIVE' | 'INACTIVE' | undefined,
    };

    const validatedData = UpdateAdminSchema.parse(data);

    const existingAdmin = await prisma.user.findUnique({
      where: { id: validatedData.id, role: Role.ADMIN },
    });
    if (!existingAdmin) {
      return { success: false, error: 'Admin not found.' };
    }

    if (validatedData.email && validatedData.email !== existingAdmin.email) {
      const emailExists = await prisma.user.findUnique({ where: { email: validatedData.email } });
      if (emailExists) {
        return { success: false, error: 'Email already in use.' };
      }
    }

    const updatedAdmin = await prisma.user.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        position: validatedData.position,
        companyName: validatedData.companyName,
        status: validatedData.status,
      },
    });

    // await prisma.auditLog.create({
    //   data: {
    //     action: 'UPDATE_ADMIN',
    //     userId: session.user.id,
    //     details: `Updated admin with ID: ${validatedData.id}, new status: ${validatedData.status || 'unchanged'}`,
    //     createdAt: new Date(),
    //   },
    // });

    revalidatePath('/dashboard/adminactions');
   // revalidatePath(`/dashboard/adminactions/${updatedAdmin.id}/admin`);
    return { success: true, message: 'Admin updated successfully.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map((e) => e.message).join(', ') };
    }
    console.error('Error updating admin:', error);
    return { success: false, error: 'Failed to update admin' };
  }
}

// Get admin details for view page
export async function getAdminDetails(adminId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId, role: Role.ADMIN, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        companyName: true,
        status: true,
        created: true,
        // auditLogs: {
        //   select: {
        //     id: true,
        //     action: true,
        //     details: true,
        //     createdAt: true,
        //   },
        //   orderBy: { createdAt: 'desc' },
        //   take: 10,
        // },
      },
    });

    if (!admin) {
      return { success: false, error: 'Admin not found' };
    }

    return { success: true, admin };
  } catch (error) {
    console.error('Error fetching admin details:', error);
    return { success: false, error: 'Failed to fetch admin details' };
  }
}