import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Vị trí việc làm 360 — Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE)',
  description:
    'Hệ thống Vị trí việc làm 360 (Tạo tệp đơn vị, Phát phiếu khảo sát B2, Bấm giờ đo định mức, Nạp gộp phiếu và Rà soát 9 biểu) của Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE).'
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
