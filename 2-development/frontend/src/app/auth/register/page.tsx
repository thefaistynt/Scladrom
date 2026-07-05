'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { apiRequest } from '@/app/lib/api';

interface RegisterErrors {
  email?: string;
  fullName?: string;
  password?: string;
  confirmPassword?: string;
  birthDate?: string;
  ageConfirmed?: string;
  form?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  const validate = () => {
    const nextErrors: RegisterErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Некорректный формат email';
    }

    if (!fullName.trim()) {
      nextErrors.fullName = 'Введите имя и фамилию';
    }

    if (!password.trim()) {
      nextErrors.password = 'Введите пароль';
    } else if (password.length < 8) {
      nextErrors.password = 'Пароль должен содержать минимум 8 символов';
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Подтвердите пароль';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (!birthDate) {
      nextErrors.birthDate = 'Введите дату рождения';
    } else {
      const parsedBirthDate = new Date(birthDate);
      if (Number.isNaN(parsedBirthDate.getTime())) {
        nextErrors.birthDate = 'Некорректная дата рождения';
      } else {
        const today = new Date();
        let age = today.getFullYear() - parsedBirthDate.getFullYear();
        const monthDiff = today.getMonth() - parsedBirthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedBirthDate.getDate())) {
          age -= 1;
        }

        if (age < 18) {
          nextErrors.birthDate = 'Нужно быть старше 18 лет';
        }
      }
    }

    if (!ageConfirmed) {
      nextErrors.ageConfirmed = 'Нужно подтвердить возраст';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus(null);
      return;
    }

    setErrors({});
    setStatus('Создаём аккаунт...');

    try {
      await apiRequest('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          full_name: fullName.trim(),
          password,
          birth_date: birthDate,
          accepted_terms: ageConfirmed,
        }),
      });

      setStatus('Аккаунт создан. Можно перейти ко входу.');
      window.setTimeout(() => router.push('/auth/login'), 600);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Не удалось создать аккаунт.' });
      setStatus(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">SCR-01</p>
          <h1 className="mt-2 text-2xl font-semibold">Создайте аккаунт</h1>
          <p className="mt-2 text-sm text-slate-600">Нужно подтвердить, что вам 18+ и вы принимаете правила посещения.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm">
            <span>Email</span>
            <input
              className={`rounded-lg border px-3 py-2 ${errors.email ? 'border-rose-400' : 'border-slate-300'}`}
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email ? <span className="text-sm text-rose-600">{errors.email}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span>Имя и фамилия</span>
            <input
              className={`rounded-lg border px-3 py-2 ${errors.fullName ? 'border-rose-400' : 'border-slate-300'}`}
              placeholder="Иван Иванов"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            {errors.fullName ? <span className="text-sm text-rose-600">{errors.fullName}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span>Дата рождения</span>
            <input
              type="date"
              className={`rounded-lg border px-3 py-2 ${errors.birthDate ? 'border-rose-400' : 'border-slate-300'}`}
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
            {errors.birthDate ? <span className="text-sm text-rose-600">{errors.birthDate}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span>Пароль</span>
            <input
              type="password"
              className={`rounded-lg border px-3 py-2 ${errors.password ? 'border-rose-400' : 'border-slate-300'}`}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {errors.password ? <span className="text-sm text-rose-600">{errors.password}</span> : null}
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span>Подтвердите пароль</span>
            <input
              type="password"
              className={`rounded-lg border px-3 py-2 ${errors.confirmPassword ? 'border-rose-400' : 'border-slate-300'}`}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {errors.confirmPassword ? <span className="text-sm text-rose-600">{errors.confirmPassword}</span> : null}
          </label>

          <label className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${errors.ageConfirmed ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'}`}>
            <input type="checkbox" className="mt-1" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} />
            <span>Мне исполнилось 18 лет</span>
          </label>
          {errors.ageConfirmed ? <span className="-mt-2 text-sm text-rose-600">{errors.ageConfirmed}</span> : null}

          {errors.form ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errors.form}</div> : null}
          {status ? <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{status}</div> : null}

          <button className="rounded-lg bg-cyan-700 px-4 py-2 font-medium text-white">Зарегистрироваться</button>
        </form>

        <p className="text-sm text-slate-600">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="font-semibold text-cyan-700">
            Войти
          </Link>
        </p>
      </div>
    </main>
  );
}
