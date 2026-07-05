'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { apiRequest } from '@/app/lib/api';

type NotificationSettings = {
  enabled: boolean;
  reminderMinutesBefore: number;
  cancellationNotifications: boolean;
};

export default function NotificationsPage() {
  const [enabled, setEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('За 24 часа');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<NotificationSettings>('/api/v1/notifications/notification-settings');
        if (data) {
          setEnabled(data.enabled);
          setReminderTime(data.reminderMinutesBefore === 60 ? 'За 1 час' : data.reminderMinutesBefore === 180 ? 'За 3 часа' : 'За 24 часа');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить настройки');
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaved(false);
      setError(null);
      const reminderMinutesBefore = reminderTime === 'За 3 часа' ? 180 : reminderTime === 'За 1 час' ? 60 : 1440;
      await apiRequest('/api/v1/notifications/notification-settings', {
        method: 'PUT',
        body: JSON.stringify({
          enabled,
          reminderMinutesBefore,
          cancellationNotifications: true,
        }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить настройки');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">SCR-09</p>
          <h1 className="mt-2 text-2xl font-semibold">Настройки уведомлений</h1>
          <p className="mt-2 text-sm text-slate-600">Настройте напоминания и выберите удобное время получения сообщений.</p>
        </div>

        <section className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Push-уведомления</p>
              <p className="text-sm text-slate-600">Получать напоминания о тренировках и отмене.</p>
            </div>
            <input type="checkbox" className="h-5 w-5" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <p className="font-semibold">Время напоминания</p>
          <select className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)}>
            <option>За 24 часа</option>
            <option>За 1 час</option>
            <option>За 3 часа</option>
          </select>
          <p className="mt-3 text-sm text-slate-600">Подтверждение придёт в виде напоминания о тренировке и уведомлений об отмене.</p>
        </section>

        {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
        {saved ? <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Настройки сохранены.</div> : null}

        <div className="flex flex-wrap gap-3">
          <button className="rounded-lg bg-cyan-700 px-4 py-2 font-medium text-white" onClick={handleSave} disabled={loading}>
            {loading ? 'Сохраняю…' : 'Сохранить'}
          </button>
          <Link href="/schedule" className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700">
            К расписанию
          </Link>
        </div>
      </div>
    </main>
  );
}
