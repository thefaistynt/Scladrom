'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RatingPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">SCR-10</p>
          <h1 className="mt-2 text-2xl font-semibold">Оценка инструктора</h1>
          <p className="mt-2 text-sm text-slate-600">Поделитесь впечатлением после тренировки, чтобы улучшить сервис.</p>
        </div>

        <section className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Тренировка</p>
          <p className="mt-1 font-semibold">Опытный формат • 08.07.2026, 12:30</p>
          <p className="mt-2 text-sm text-slate-600">Инструктор: Илья</p>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <p className="font-semibold">Оценка</p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`rounded-full px-3 py-2 text-sm font-semibold ${rating >= value ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-700'}`}
                onClick={() => setRating(value)}
                disabled={submitted}
              >
                ★ {value}
              </button>
            ))}
          </div>
        </section>

        <label className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 text-sm">
          <span className="font-semibold">Комментарий</span>
          <textarea
            className="min-h-28 rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Расскажите, что понравилось или что можно улучшить"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={submitted}
          />
        </label>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Спасибо! Отзыв успешно отправлен.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={`rounded-lg px-4 py-2 font-medium text-white ${rating > 0 && !submitted ? 'bg-cyan-700' : 'cursor-not-allowed bg-slate-300'}`}
            disabled={rating === 0 || submitted}
            onClick={() => setSubmitted(true)}
          >
            Отправить
          </button>
          <Link href="/bookings" className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700">
            К броням
          </Link>
        </div>
      </div>
    </main>
  );
}
