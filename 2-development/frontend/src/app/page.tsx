import Link from 'next/link';

const cards = [
  { href: '/auth/register', title: 'Регистрация', description: 'Создание аккаунта клиента' },
  { href: '/auth/login', title: 'Вход', description: 'Авторизация в приложении' },
  { href: '/schedule', title: 'Расписание', description: 'Просмотр доступных тренировок' },
  { href: '/booking', title: 'Бронирование', description: 'Оформление записи на слот' },
  { href: '/bookings', title: 'Мои бронирования', description: 'Список активных и отменённых броней' },
  { href: '/info', title: 'Инфо-центр', description: 'Правила посещения и контакты' },
  { href: '/notifications', title: 'Уведомления', description: 'Настройки напоминаний' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Вертикаль</p>
          <h1 className="text-3xl font-semibold">Мобильный клиент для записи на тренировки</h1>
          <p className="max-w-2xl text-base text-slate-600">
            Первый шаг интерфейса соответствует аналитике: регистрация, вход, расписание, бронирование и управление бронями.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-xl border border-slate-200 p-5 transition hover:border-cyan-500 hover:bg-cyan-50"
            >
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
