import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { del } from "@vercel/blob";

// GET — list transition images for a problem (ordered)
export async function GET(
    _req: Request,
    props: { params: Promise<{ id: string; problemId: string }> }
) {
    const params = await props.params;
    try {
        const images = await prisma.transitionImage.findMany({
            where: { problemId: params.problemId },
            orderBy: { order: "asc" },
        });
        return NextResponse.json(images);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST — add a new transition image
export async function POST(
    req: Request,
    props: { params: Promise<{ id: string; problemId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await props.params;

    try {
        const { url } = await req.json();
        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "url is required" }, { status: 400 });
        }

        // Get next order value
        const maxOrder = await prisma.transitionImage.aggregate({
            where: { problemId: params.problemId },
            _max: { order: true },
        });
        const nextOrder = (maxOrder._max.order ?? -1) + 1;

        const image = await prisma.transitionImage.create({
            data: {
                problemId: params.problemId,
                url,
                order: nextOrder,
            },
        });

        return NextResponse.json(image);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH — reorder images (receives array of { id, order })
export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string; problemId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { items } = await req.json();
        if (!Array.isArray(items)) {
            return NextResponse.json({ error: "items array required" }, { status: 400 });
        }

        await prisma.$transaction(
            items.map((item: { id: string; order: number }) =>
                prisma.transitionImage.update({
                    where: { id: item.id },
                    data: { order: item.order },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE — delete a transition image by id (query param ?imageId=xxx)
export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string; problemId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const imageId = searchParams.get("imageId");
        if (!imageId) {
            return NextResponse.json({ error: "imageId query param required" }, { status: 400 });
        }

        // Fetch image to get blob URL for cleanup
        const image = await prisma.transitionImage.findUnique({ where: { id: imageId } });
        if (!image) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        // Delete from DB
        await prisma.transitionImage.delete({ where: { id: imageId } });

        // Try to delete from Vercel Blob (best-effort)
        try {
            await del(image.url);
        } catch {
            // Non-critical — blob may have already been deleted
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
