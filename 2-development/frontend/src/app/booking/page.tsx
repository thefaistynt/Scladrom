'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

import { apiRequest } from '@/app/lib/api';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [guests, setGuests] = useState(1);
  const [gear, setGear] = useState<'self' | 'rent'>('self');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const slotId = Number(searchParams.get('slotId') ?? '0');
  const availableSpots = Math.max(1, Number(searchParams.get('availableSpots') ?? '1'));
  const accepted = searchParams.get('accepted') === '1';

  const maxGuests = useMemo(() => Math.max(1, availableSpots), [availableSpots]);
  const rentalPrice = gear === 'rent' ? 600 : 0;
  const trainingPrice = 2000;
  const total = trainingPrice * guests + rentalPrice;

  const handleSubmit = async () => {
    if (!accepted) {
      const returnTo = `/booking?slotId=${slotId}&availableSpots=${availableSpots}`;
      router.push(`/offer?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = await apiRequest<{ id: number }>('/api/v1/bookings', {
        method: 'POST',
        body: JSON.stringify({
          slot_id: slotId,
          seats_count: guests,
          rental_option: gear === 'rent' ? 'full' : 'self',
          offer_accepted: true,
        }),
      });

      if (!payload?.id) {
        throw new Error('Не удалось подтвердить запись');
      }

      router.push(`/bookings/${payload.id}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось подтвердить запись');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">SCR-05</p>
          <h1 className="mt-2 text-2xl font-semibold">Бронирование</h1>
          <p className="mt-2 text-sm text-slate-600">Выберите количество мест, вариант снаряжения и подтвердите запись.</p>
        </div>

        {accepted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Оферта принята. Можно продолжить подтверждение записи.
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Сначала нужно принять оферту, затем запись будет подтверждена в системе.
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Тренировка</p>
              <p className="font-semibold">Опытный формат • 12:30</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Инструктор</p>
              <p className="font-semibold">Илья</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Количество мест</h2>
            <span className="text-sm text-slate-500">Доступно: {maxGuests}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button type="button" className="rounded-lg border border-slate-300 px-3 py-2" onClick={() => setGuests((value) => Math.max(1, value - 1))}>
              −
            </button>
            <span className="min-w-8 text-center font-semibold">{guests}</span>
            <button
              type="button"
              aria-label="Увеличить количество мест"
              className="rounded-lg border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={guests >= maxGuests}
              onClick={() => setGuests((value) => Math.min(maxGuests, value + 1))}
            >
              +
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <h2 className="font-semibold">Снаряжение</h2>
          <div className="mt-3 flex flex-col gap-2">
            <label className="rounded-lg border border-slate-200 p-3">
              <input type="radio" name="gear" checked={gear === 'self'} onChange={() => setGear('self')} className="mr-2" />
              Своё снаряжение
            </label>
            <label className="rounded-lg border border-slate-200 p-3">
              <input type="radio" name="gear" checked={gear === 'rent'} onChange={() => setGear('rent')} className="mr-2" />
              Полный прокат
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Стоимость тренировки</span>
            <span>{trainingPrice.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
            <span>Прокат</span>
            <span>{rentalPrice.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-semibold">
            <span>Итого</span>
            <span>{total.toLocaleString('ru-RU')} ₽</span>
          </div>
        </section>

        {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</div> : null}

        <div className="flex flex-wrap gap-3">
          <button type="button" className="rounded-lg bg-cyan-700 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300" disabled={isSubmitting} onClick={handleSubmit}>
            {accepted ? (isSubmitting ? 'Подтверждаю…' : 'Подтвердить запись') : 'Принять оферту'}
          </button>
          <Link href="/schedule" className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700">
            Вернуться к расписанию
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">Загрузка…</div>}>
      <BookingContent />
    </Suspense>
  );
}
