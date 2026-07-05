'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { apiRequest } from '@/app/lib/api';

type VisitingRules = {
  title: string;
  address: string;
  schedule: string;
  what_to_bring: string[];
  safety_rules: string[];
};

export default function InfoPage() {
  const [rules, setRules] = useState<VisitingRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<VisitingRules>('/api/v1/info/visiting-rules');
        setRules(data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    void loadRules();
  }, []);
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">SCR-08</p>
          <h1 className="mt-2 text-2xl font-semibold">Инфо-центр и правила</h1>
          <p className="mt-2 text-sm text-slate-600">Справочная информация перед походом на тренировку.</p>
        </div>

        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

        {loading ? (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 text-sm text-slate-600">Загрузка информации…</div>
        ) : rules ? (
          <div className="grid gap-4">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold">Адрес и контакты</h2>
              <p className="mt-2 text-sm text-slate-600">{rules.address}</p>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold">Режим работы</h2>
              <p className="mt-2 text-sm text-slate-600">{rules.schedule}</p>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold">Что взять с собой</h2>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                {rules.what_to_bring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold">Правила посещения</h2>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                {rules.safety_rules.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <Link href="/schedule" className="text-sm font-medium text-cyan-700">Вернуться к расписанию</Link>
        </div>
      </div>
    </main>
  );
}
