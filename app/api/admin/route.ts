"use server"
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


// Handle POST /api/admin
const createAdminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  position: z.string().optional(),
  companyName: z.string().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'INACTIVE']).default('ACTIVE'),
});

// Validation schema for updating an admin
const updateAdminSchema = z.object({
  id: z.string().cuid('Invalid user ID'),
  name: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  companyName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            name,
            email,
            password,
            phone,
            position,
            companyName
        } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                position,
                companyName,
                role: 'ADMIN',
                status: 'ACTIVE',
            },
        });

        return NextResponse.json({ user }, { status: 201 });

    } catch (error) {
        console.error('Error creating admin:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
