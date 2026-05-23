import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation || reservation.status !== "pending") {
    return NextResponse.json({ error: "Not found or already processed" }, { status: 400 });
  }

  const stock = await prisma.stock.findFirst({
    where: {
      productId: reservation.productId,
      warehouseId: reservation.warehouseId,
    },
  });

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id },
      data: { status: "released" },
    }),
    prisma.stock.update({
      where: { id: stock!.id },
      data: { reserved: stock!.reserved - reservation.quantity },
    }),
  ]);

  return NextResponse.json({ success: true });
}