'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { apiRequest } from '@/app/lib/api';

interface LoginErrors {
  email?: string;
  password?: string;
  form?: string;
}

const AUTH_STORAGE_KEY = 'vertical-auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  const validate = () => {
    const nextErrors: LoginErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Некорректный формат email';
    }

    if (!password.trim()) {
      nextErrors.password = 'Введите пароль';
    } else if (password.length < 6) {
      nextErrors.password = 'Пароль должен содержать минимум 6 символов';
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
    setStatus('Проверяем данные...');

    try {
      await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setStatus('Вход выполнен. Переходим к расписанию.');
      window.setTimeout(() => router.push('/schedule'), 400);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Неверный email или пароль.' });
      setStatus(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">SCR-02</p>
          <h1 className="mt-2 text-2xl font-semibold">Вход в приложение</h1>
          <p className="mt-2 text-sm text-slate-600">Введите email и пароль, чтобы открыть личный кабинет и перейти к записи.</p>
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
            <span>Пароль</span>
            <div className="flex items-center gap-2">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`flex-1 rounded-lg border px-3 py-2 ${errors.password ? 'border-rose-400' : 'border-slate-300'}`}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button type="button" className="text-sm font-medium text-cyan-700" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            {errors.password ? <span className="text-sm text-rose-600">{errors.password}</span> : null}
          </label>

          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/register" className="font-semibold text-cyan-700">
              Нет аккаунта? Зарегистрироваться
            </Link>
            <Link href="/auth/login" className="text-slate-500">
              Забыли пароль?
            </Link>
          </div>

          {errors.form ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{errors.form}</div> : null}
          {status ? <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{status}</div> : null}

          <button className="rounded-lg bg-cyan-700 px-4 py-2 font-medium text-white">Войти</button>
        </form>
      </div>
    </main>
  );
}
