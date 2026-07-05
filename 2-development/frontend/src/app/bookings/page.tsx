'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { apiRequest } from '@/app/lib/api';

type BookingItem = {
  id: number;
  status: string;
  booked_at: string;
  slot_id: number;
  training_amount: number;
  rental_amount: number;
  total_amount: number;
  rental_option: string;
  slot?: { id: number } | null;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest<BookingItem[]>('/api/v1/bookings');
        setBookings(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить бронирования');
      } finally {
        setLoading(false);
      }
    };

    void loadBookings();
  }, []);

  const upcoming = useMemo(() => bookings.filter((item) => item.status === 'confirmed' || item.status === 'pending'), [bookings]);
  const history = useMemo(() => bookings.filter((item) => item.status !== 'confirmed' && item.status !== 'pending'), [bookings]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">SCR-06</p>
          <h1 className="mt-2 text-2xl font-semibold">Мои бронирования</h1>
          <p className="mt-2 text-sm text-slate-600">Список активных и архивных записей с возможностью открыть детали.</p>
        </div>

        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">Предстоящие</h2>
          <div className="mt-4 flex flex-col gap-3">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">Загрузка броней…</div>
            ) : upcoming.length > 0 ? (
              upcoming.map((item) => (
                <Link key={item.id} href={`/bookings/${item.id}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">Бронирование #{item.id}</p>
                      <p className="text-sm text-slate-600">{new Date(item.booked_at).toLocaleString('ru-RU')}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">{item.status}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">Пока нет предстоящих броней.</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">История</h2>
          <div className="mt-4 flex flex-col gap-3">
            {loading ? null : history.length > 0 ? (
              history.map((item) => (
                <Link key={item.id} href={`/bookings/${item.id}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">Бронирование #{item.id}</p>
                      <p className="text-sm text-slate-600">{new Date(item.booked_at).toLocaleString('ru-RU')}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{item.status}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">История броней пуста.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
