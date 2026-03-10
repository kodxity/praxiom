import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, rateLimitResponse, getIp } from '@/lib/rateLimit';

const baseSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(32, 'Username cannot exceed 32 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username may only contain letters, numbers, underscores, and hyphens'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    displayName: z.string().min(1, 'Full name is required').max(100),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    isTeacher: z.boolean().optional().default(false),
    schoolId: z.string().optional().or(z.literal('')),
    groupIds: z.array(z.string()).optional().default([]), // students: multiple group ids
    message: z.string().max(500).optional().or(z.literal('')),  // intro message → description
});

export async function POST(req: Request) {
    // 5 registration attempts per hour per IP
    const ip = getIp(req);
    if (!checkRateLimit(`register:ip:${ip}`, { windowMs: 60 * 60_000, max: 5 })) {
        return rateLimitResponse();
    }

    try {
        const body = await req.json();
        const parsed = baseSchema.parse(body);

        const { username, password, displayName, isTeacher } = parsed;
        const email = parsed.email || undefined;
        const schoolId = parsed.schoolId || undefined;
        const groupIds = parsed.groupIds || [];
        const description = parsed.message?.trim() || null;

        // --- Validate email domain against school (students only; teachers use any email) ---
        if (schoolId && !isTeacher) {
            const school = await prisma.school.findUnique({ where: { id: schoolId } });
            if (school?.emailDomain) {
                if (!email) {
                    return NextResponse.json(
                        { message: `An @${school.emailDomain} email is required for ${school.shortName}` },
                        { status: 400 }
                    );
                }
                if (!email.endsWith(`@${school.emailDomain}`)) {
                    return NextResponse.json(
                        { message: `Email must end with @${school.emailDomain} for ${school.shortName}` },
                        { status: 400 }
                    );
                }
            }
        }

        // --- Teachers must also have a full name ---
        if (isTeacher && displayName.trim().length < 2) {
            return NextResponse.json({ message: 'Teachers must provide their full name' }, { status: 400 });
        }

        // --- Check uniqueness ---
        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername) {
            return NextResponse.json({ message: 'Username already taken' }, { status: 409 });
        }

        if (email) {
            const existingEmail = await prisma.user.findUnique({ where: { email } });
            if (existingEmail) {
                return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
            }
        }

        const hashedPassword = await hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                displayName,
                email: email || null,
                isTeacher: isTeacher ?? false,
                isApproved: false,
                schoolId: schoolId || null,
                description: description || null,
            },
        });

        // If student selected groups, create join requests for each
        if (!isTeacher && groupIds.length > 0) {
            await Promise.all(groupIds.map(gid => 
                prisma.groupJoinRequest.create({
                    data: { groupId: gid, userId: newUser.id },
                })
            ));
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}
