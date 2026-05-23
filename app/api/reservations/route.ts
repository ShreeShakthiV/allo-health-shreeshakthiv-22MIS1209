import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { productId, warehouseId, quantity } = await req.json();

    const lockKey = `lock:${productId}:${warehouseId}`;
    const lock = await redis.set(lockKey, "1", { nx: true, ex: 10 });

    if (!lock) {
      return NextResponse.json(
        { error: "Too many requests, try again" },
        { status: 429 }
      );
    }

    try {
      const stock = await prisma.stock.findFirst({
        where: { productId, warehouseId },
      });

      if (!stock) {
        return NextResponse.json({ error: "Stock not found" }, { status: 404 });
      }

      const available = stock.total - stock.reserved;
      if (available < quantity) {
        return NextResponse.json({ error: "Not enough stock" }, { status: 409 });
      }

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const [reservation] = await prisma.$transaction([
        prisma.reservation.create({
          data: { productId, warehouseId, quantity, expiresAt },
        }),
        prisma.stock.update({
          where: { id: stock.id },
          data: { reserved: stock.reserved + quantity },
        }),
      ]);

      return NextResponse.json(reservation, { status: 201 });
    } finally {
      await redis.del(lockKey);
    }
  } catch (err) {
    console.error("Reservation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}