import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId, action } = await req.json();

    if (action === 'approve') {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isApproved: true }
        });
        return NextResponse.json(user);
    }

    return new NextResponse("Invalid action", { status: 400 });
}
