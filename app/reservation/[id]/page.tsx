"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

type Reservation = {
  id: string;
  productId: string;
  quantity: number;
  status: string;
  expiresAt: string;
};

export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/reservations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setReservation(data);
        const secondsLeft = Math.floor(
          (new Date(data.expiresAt).getTime() - Date.now()) / 1000
        );
        setTimeLeft(Math.max(0, secondsLeft));
      });
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  async function handleConfirm() {
    const res = await fetch(`/api/reservations/${id}/confirm`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setStatus("confirmed");
  }

  async function handleCancel() {
    const res = await fetch(`/api/reservations/${id}/release`, { method: "POST" });
    if (!res.ok) {
      setError("Failed to cancel");
      return;
    }
    setStatus("released");
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!reservation) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Loading reservation...</p>
    </div>
  );

  return (
    <main className="max-w-lg mx-auto p-6 mt-12">
      <div className="border rounded-xl p-8 shadow-sm bg-white">
        <h1 className="text-2xl font-bold mb-6">Your Reservation</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">
            ⚠️ {error}
          </div>
        )}

        {status === "confirmed" && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Payment confirmed! Order placed successfully.
          </div>
        )}

        {status === "released" && (
          <div className="bg-yellow-100 text-yellow-700 px-4 py-3 rounded mb-4">
            🔁 Reservation cancelled. Stock has been released.
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-500">Reservation ID</span>
            <span className="font-mono text-sm">{reservation.id.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Quantity</span>
            <span className="font-semibold">{reservation.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="font-semibold capitalize">{status || reservation.status}</span>
          </div>
        </div>

        {!status && (
          <>
            <div className={`text-center text-4xl font-bold mb-6 ${timeLeft < 60 ? "text-red-500" : "text-blue-600"}`}>
              ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
            {timeLeft === 0 && (
              <p className="text-center text-red-500 mb-4">Reservation expired!</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={timeLeft === 0}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition"
              >
                ✅ Confirm Purchase
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-100 text-red-600 py-3 rounded-lg hover:bg-red-200 font-semibold transition"
              >
                ❌ Cancel
              </button>
            </div>
          </>
        )}

        {status && (
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition mt-2"
          >
            ← Back to Products
          </button>
        )}
      </div>
    </main>
  );
}