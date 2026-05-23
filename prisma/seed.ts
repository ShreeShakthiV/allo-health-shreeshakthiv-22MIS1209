import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create warehouses
  const warehouse1 = await prisma.warehouse.create({
    data: { name: "Chennai Warehouse" },
  });
  const warehouse2 = await prisma.warehouse.create({
    data: { name: "Mumbai Warehouse" },
  });

  // Create products with stock
  const products = [
    { name: "Wireless Headphones", price: 2999 },
    { name: "Bluetooth Speaker", price: 1999 },
    { name: "Smart Watch", price: 4999 },
  ];

  for (const p of products) {
    const product = await prisma.product.create({ data: p });

    await prisma.stock.create({
      data: {
        productId: product.id,
        warehouseId: warehouse1.id,
        total: 10,
        reserved: 0,
      },
    });

    await prisma.stock.create({
      data: {
        productId: product.id,
        warehouseId: warehouse2.id,
        total: 5,
        reserved: 0,
      },
    });
  }

  console.log("✅ Seed done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());