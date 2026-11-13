import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DotPattern } from '@/components/ui/DotPattern';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#004776'
};

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
      <body className="min-h-screen flex flex-col overflow-x-clip relative">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <DotPattern
            width={22}
            height={22}
            cr={1.25}
            className="text-[#006cee]/25 [mask-image:radial-gradient(ellipse_85%_60%_at_50%_0%,white_35%,transparent_100%)]"
          />
        </div>
        <Header />
        <main className="flex-1 flex flex-col relative z-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
