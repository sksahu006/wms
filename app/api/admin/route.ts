import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';


// Handle POST /api/admin
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
