import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { description } = await req.json();

    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { description }
    });

    return NextResponse.json(user);
}
