import type { Metadata } from 'next';
import './globals.css';
import AuthGuard from './components/auth-guard';

export const metadata: Metadata = {
  title: 'Вертикаль',
  description: 'Веб-интерфейс для записи на тренировки',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
