'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function OfferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accepted, setAccepted] = useState(false);

  const returnTo = searchParams.get('returnTo') ?? '/booking';

  const handleContinue = () => {
    const suffix = returnTo.includes('?') ? '&accepted=1' : '?accepted=1';
    router.push(`${returnTo}${suffix}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">SCR-03</p>
          <h1 className="mt-2 text-2xl font-semibold">Оферта и правила безопасности</h1>
          <p className="mt-2 text-sm text-slate-600">Перед записью необходимо принять условия посещения скалодрома.</p>
        </div>

        <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
          <p className="font-semibold text-slate-800">Условия посещения</p>
          <p className="mt-2">
            При посещении скалодрома клиент обязуется соблюдать правила безопасности, использовать только разрешённое снаряжение и следовать инструкциям инструктора.
          </p>
          <p className="mt-3">
            Бронирование является предварительным подтверждением места и может быть отменено без штрафа не позднее чем за 24 часа до начала тренировки.
          </p>
          <p className="mt-3">
            В случае отсутствия подходящего снаряжения клиент может записаться на свою ответственность, если это не противоречит правилам администрации.
          </p>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
          <input type="checkbox" className="mt-1" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
          <span>Я принимаю условия оферты и правила безопасности</span>
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={`rounded-lg px-4 py-2 font-medium text-white ${accepted ? 'bg-cyan-700' : 'cursor-not-allowed bg-slate-300'}`}
            disabled={!accepted}
            onClick={handleContinue}
          >
            Продолжить
          </button>
          <Link href="/schedule" className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700">
            Вернуться к расписанию
          </Link>
        </div>
      </div>
    </main>
  );
}
