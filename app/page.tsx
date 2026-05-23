"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Stock = {
  id: string;
  total: number;
  reserved: number;
  warehouse: { id: string; name: string };
};

type Product = {
  id: string;
  name: string;
  price: number;
  stocks: Stock[];
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  async function handleReserve(productId: string, warehouseId: string) {
    setReserving(productId + warehouseId);
    setError(null);
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setReserving(null);
      return;
    }
    router.push(`/reservation/${data.id}`);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 text-lg">Loading products...</p>
    </div>
  );

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Allo Shop</h1>
      <p className="text-gray-500 mb-8">Reserve items before they run out!</p>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">
          ⚠️ {error}
        </div>
      )}

      <div className="grid gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-xl p-6 shadow-sm bg-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-green-600 font-bold text-lg">₹{product.price}</p>
              </div>
            </div>
            <div className="space-y-3">
              {product.stocks.map((stock) => {
                const available = stock.total - stock.reserved;
                return (
                  <div key={stock.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="font-medium">{stock.warehouse.name}</p>
                      <p className="text-sm text-gray-500">
                        {available} available / {stock.total} total
                      </p>
                    </div>
                    <button
                      onClick={() => handleReserve(product.id, stock.warehouse.id)}
                      disabled={available === 0 || reserving === product.id + stock.warehouse.id}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      {reserving === product.id + stock.warehouse.id
                        ? "Reserving..."
                        : available === 0
                        ? "Out of Stock"
                        : "Reserve"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}