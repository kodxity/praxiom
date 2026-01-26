import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const userSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    description: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password, description } = userSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Username already taken' },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                description,
                isApproved: false, // Default to not approved
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
        }
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}
