'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiRequest } from '@/app/lib/api';

type BookingDetails = {
  id: number;
  status: string;
  booked_at: string;
  slot_id: number;
  rental_option: string;
  training_amount: number;
  rental_amount: number;
  total_amount: number;
};

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest<BookingDetails>(`/api/v1/bookings/${params.id}`);
        setBooking(data ?? null);
        setIsCancelled((data?.status ?? '') === 'cancelled' || (data?.status ?? '') === 'cancelled_by_gym');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить детали бронирования');
      } finally {
        setLoading(false);
      }
    };

    void loadBooking();
  }, [params.id]);

  const handleCancel = async () => {
    if (!booking || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await apiRequest<{ status: string }>(`/api/v1/bookings/${booking.id}`, {
        method: 'DELETE',
      });
      setIsCancelled((data?.status ?? 'cancelled') === 'cancelled' || (data?.status ?? 'cancelled') === 'cancelled_by_gym');
      setBooking((current) => (current ? { ...current, status: data?.status ?? current.status } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отменить запись');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCancel = !isCancelled && booking?.status === 'confirmed';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">SCR-07</p>
          <h1 className="mt-2 text-2xl font-semibold">Детали бронирования</h1>
          <p className="mt-2 text-sm text-slate-600">Подробная информация о записи и доступные действия.</p>
        </div>

        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">Загрузка данных…</div>
        ) : booking ? (
          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Дата и время</p>
                <p className="font-semibold">{new Date(booking.booked_at).toLocaleString('ru-RU')}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${isCancelled ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isCancelled ? 'Отменена' : 'Активна'}
              </span>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div><span className="font-medium text-slate-800">Статус:</span> {booking.status}</div>
              <div><span className="font-medium text-slate-800">Снаряжение:</span> {booking.rental_option === 'full' ? 'Полный прокат' : 'Без проката'}</div>
              <div><span className="font-medium text-slate-800">Сумма:</span> {booking.total_amount} ₽</div>
              <div><span className="font-medium text-slate-800">Бронирование:</span> #{booking.id}</div>
            </div>
          </section>
        ) : null}

        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
          Отмена записи возможна бесплатно за 24 часа до начала тренировки.
        </div>

        {isCancelled ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Запись отменена. При необходимости можно оформить новую бронь на другое время.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button className={`rounded-lg px-4 py-2 font-medium text-white ${canCancel && !isCancelled ? 'bg-rose-600' : 'cursor-not-allowed bg-slate-300'}`} disabled={!canCancel || isCancelled || isSubmitting} onClick={handleCancel}>
            {isSubmitting ? 'Отменяю…' : isCancelled ? 'Отмена выполнена' : 'Отменить запись'}
          </button>
          <Link href="/bookings" className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700">
            Назад к списку
          </Link>
        </div>
      </div>
    </main>
  );
}
