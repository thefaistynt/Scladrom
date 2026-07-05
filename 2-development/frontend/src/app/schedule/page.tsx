'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { apiRequest } from '@/app/lib/api';

type SlotItem = {
  id: number;
  start_time: string;
  end_time: string;
  capacity: number;
  available_spots: number;
  instructor_name: string;
  format_name: string;
  zone_name?: string | null;
  price?: number | null;
  status: string;
};

function getDateOptions() {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      day: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
      date: String(date.getDate()).padStart(2, '0'),
      fullDate: date.toISOString().slice(0, 10),
    };
  });
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate().toString().padStart(2, '0'));
  const dates = useMemo(() => getDateOptions(), []);
  const [selectedFormat, setSelectedFormat] = useState('Все');
  const [selectedInstructor, setSelectedInstructor] = useState('Все');
  const [selectedTime, setSelectedTime] = useState('Все');
  const [onlyFree, setOnlyFree] = useState(false);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiRequest<SlotItem[]>('/api/v1/slots');
        setSlots(data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить расписание');
      } finally {
        setLoading(false);
      }
    };

    void loadSlots();
  }, []);

  const filteredSlots = useMemo(() => {
    const selectedDay = dates.find((date) => date.date === selectedDate);

    return slots.filter((slot) => {
      const startDate = new Date(slot.start_time);
      const slotDay = startDate.toISOString().slice(0, 10);
      const timeOfDay = startDate.getHours() < 12 ? 'Утро' : startDate.getHours() < 18 ? 'День' : 'Вечер';
      const formatMatch = selectedFormat === 'Все' || slot.format_name === selectedFormat;
      const instructorMatch = selectedInstructor === 'Все' || slot.instructor_name === selectedInstructor;
      const timeMatch = selectedTime === 'Все' || timeOfDay === selectedTime;
      const freeMatch = !onlyFree || slot.available_spots > 0;

      return slotDay === selectedDay?.fullDate && formatMatch && instructorMatch && timeMatch && freeMatch;
    });
  }, [dates, onlyFree, selectedDate, selectedFormat, selectedInstructor, selectedTime, slots]);

  const instructorOptions = useMemo(() => Array.from(new Set(slots.map((slot) => slot.instructor_name))), [slots]);
  const formatOptions = useMemo(() => Array.from(new Set(slots.map((slot) => slot.format_name))), [slots]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">SCR-04</p>
              <h1 className="mt-2 text-2xl font-semibold">Расписание тренировок</h1>
              <p className="mt-2 text-sm text-slate-600">Выбирайте подходящий слот по дате, формату, инструктору и доступным местам.</p>
            </div>
            <div className="rounded-lg bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700">7 дней вперёд</div>
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
            {dates.map((date) => (
              <button
                key={date.date}
                type="button"
                className={`min-w-[72px] rounded-xl border px-3 py-3 text-center ${selectedDate === date.date ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-white text-slate-700'}`}
                onClick={() => setSelectedDate(date.date)}
              >
                <div className="text-xs uppercase tracking-[0.2em]">{date.day}</div>
                <div className="mt-1 text-lg font-semibold">{date.date}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-2 text-sm">
              <span>Формат</span>
              <select className="rounded-lg border border-slate-300 px-3 py-2" value={selectedFormat} onChange={(event) => setSelectedFormat(event.target.value)}>
                <option>Все</option>
                {formatOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span>Инструктор</span>
              <select className="rounded-lg border border-slate-300 px-3 py-2" value={selectedInstructor} onChange={(event) => setSelectedInstructor(event.target.value)}>
                <option>Все</option>
                {instructorOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span>Время суток</span>
              <select className="rounded-lg border border-slate-300 px-3 py-2" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                <option>Все</option>
                <option>Утро</option>
                <option>День</option>
                <option>Вечер</option>
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <input type="checkbox" checked={onlyFree} onChange={(event) => setOnlyFree(event.target.checked)} />
              <span>Только свободные места</span>
            </label>
          </div>
        </div>

        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">Загрузка расписания…</div>
        ) : filteredSlots.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {filteredSlots.map((slot) => {
              const startDate = new Date(slot.start_time);
              const endDate = new Date(slot.end_time);
              const timeLabel = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}–${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
              const isFull = slot.available_spots <= 0;

              return (
                <Link key={slot.id} href={`/booking?slotId=${slot.id}&availableSpots=${slot.available_spots}`} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-cyan-700">{timeLabel}</span>
                    <span className={`rounded-full px-2 py-1 text-xs ${isFull ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isFull ? 'Полный' : `${slot.available_spots} мест`}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold">{slot.format_name}</h2>
                  <p className="mt-1 text-sm text-slate-600">Инструктор: {slot.instructor_name}</p>
                  <p className="mt-2 text-sm text-slate-600">Свободно: {slot.available_spots}/{slot.capacity}</p>
                  <div className="mt-4 text-sm font-medium text-cyan-700">Открыть бронирование →</div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold">Пока нет доступных тренировок</h2>
            <p className="mt-2 text-sm text-slate-600">Попробуйте снять фильтры или выбрать другую дату.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <Link href="/bookings" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">Мои бронирования</Link>
          <Link href="/info" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">Инфо-центр</Link>
          <Link href="/notifications" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">Настройки уведомлений</Link>
        </div>
      </div>
    </main>
  );
}
