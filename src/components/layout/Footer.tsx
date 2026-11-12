import React from 'react';
import Link from 'next/link';
import { Globe, Mail } from 'lucide-react';
import { DotPattern } from '@/components/ui/DotPattern';

export function Footer() {
  return (
    <footer className="relative z-20 w-full bg-[#004776] text-white border-t border-white/10 py-4 mt-6 overflow-hidden">
      <DotPattern
        width={18}
        height={18}
        cr={1}
        className="text-white/10 [mask-image:radial-gradient(ellipse_at_bottom,white,transparent_70%)]"
      />
      <div className="relative z-10 w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/90">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center">
            <img
              src="/horizontal-ute-logo-white.png"
              alt="HCM-UTE Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <span className="hidden md:inline text-white/40">|</span>
          <span className="hidden md:inline font-semibold">
            Hệ thống Vị trí việc làm — Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE)
          </span>
        </div>
        <div className="flex items-center gap-4 text-white/80 font-semibold">
          <span>© 2026 HCM-UTE</span>
          <a
            href="https://hcmute.edu.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
            title="Cổng thông tin HCM-UTE"
          >
            <Globe className="w-4 h-4" />
          </a>
          <a
            href="mailto:tcns@hcmute.edu.vn"
            className="hover:text-white transition-colors"
            title="Thư điện tử hỗ trợ nghiệp vụ"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
