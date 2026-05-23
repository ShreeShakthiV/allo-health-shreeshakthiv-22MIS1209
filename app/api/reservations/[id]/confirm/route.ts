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

  if (!reservation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (reservation.status !== "pending") {
    return NextResponse.json({ error: "Already processed" }, { status: 400 });
  }

  if (new Date() > reservation.expiresAt) {
    return NextResponse.json({ error: "Reservation expired" }, { status: 410 });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: "confirmed" },
  });

  return NextResponse.json(updated);
}