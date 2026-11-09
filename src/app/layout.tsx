import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Vị trí việc làm — Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE)',
  description:
    'Hệ thống Vị trí việc làm theo quy trình 08 bước, 10 biểu chuẩn Hướng dẫn số 07-HD/BTCTW của Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE).'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col overflow-x-clip">
        <Header />
        <main className="flex-1 flex flex-col relative z-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
