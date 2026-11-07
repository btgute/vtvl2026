import React from 'react';
import Link from 'next/link';
import { Globe, Mail, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-20 w-full flex flex-col bg-[#0072BC] text-white overflow-hidden border-t border-white/10 text-left mt-12">
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-7xl border-x border-white/10 hidden xl:block z-30"
        aria-hidden="true"
      />
      <section className="relative z-10 w-full py-9 sm:py-11">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
              Trình tự thực hiện nghiệp vụ
            </h3>
            <ul className="flex flex-col space-y-2 text-xs sm:text-sm text-white/85">
              <li>
                <Link href="/huong-dan" className="hover:text-white hover:underline">
                  Hướng dẫn toàn trình dành cho đơn vị
                </Link>
              </li>
              <li>
                <Link href="/tao-tep" className="hover:text-white hover:underline">
                  Bước 1–2: Khởi tạo tệp đơn vị và phiếu khảo sát
                </Link>
              </li>
              <li>
                <Link href="/bam-gio" className="hover:text-white hover:underline">
                  Bước 3: Đo định mức thời gian thực hiện
                </Link>
              </li>
              <li>
                <Link href="/tao-tep#buoc-4" className="hover:text-white hover:underline">
                  Bước 4: Tổng hợp phiếu và xuất dự thảo Tờ trình
                </Link>
              </li>
              <li>
                <Link href="/ra-soat" className="hover:text-white hover:underline">
                  Bước 5: Thẩm định và kiểm tra chéo bộ biểu
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
              Phạm vi 51 đơn vị thuộc Trường
            </h3>
            <ul className="flex flex-col space-y-2 text-xs sm:text-sm text-white/85">
              <li>
                <Link href="/tao-tep" className="hover:text-white hover:underline">
                  Khối Khoa và Viện đào tạo (16 đơn vị)
                </Link>
              </li>
              <li>
                <Link href="/tao-tep" className="hover:text-white hover:underline">
                  Khối Phòng và Ban chức năng (14 đơn vị)
                </Link>
              </li>
              <li>
                <Link href="/tao-tep" className="hover:text-white hover:underline">
                  Khối Trung tâm và Phân hiệu (16 đơn vị)
                </Link>
              </li>
              <li>
                <Link href="/tao-tep" className="hover:text-white hover:underline">
                  Khối Quản trị và Đảng – Đoàn thể (5 đơn vị)
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
              Cổng thông tin điện tử HCM-UTE
            </h3>
            <ul className="flex flex-col space-y-2 text-xs sm:text-sm text-white/85">
              <li>
                <a
                  href="https://hcmute.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white hover:underline"
                >
                  <span>Cổng thông tin Trường (HCM-UTE)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://tcns.hcmute.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white hover:underline"
                >
                  <span>Phòng Tổ chức - Nhân sự (TCNS)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://bmc.hcmute.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white hover:underline"
                >
                  <span>Phòng Quản trị thương hiệu và Truyền thông</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://online.hcmute.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white hover:underline"
                >
                  <span>Hệ thống quản trị đào tạo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3 col-span-2 lg:col-span-1">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
              Cơ quan thường trực thẩm định
            </h3>
            <div className="flex flex-col space-y-1.5 text-xs text-white/85 leading-relaxed">
              <p className="font-semibold text-white">
                Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE)
              </p>
              <p className="text-white/80">
                Ho Chi Minh City University of Technology and Engineering
              </p>
              <p className="text-white/80">
                Đơn vị tiếp nhận hồ sơ: Phòng Tổ chức - Nhân sự (TCNS)
              </p>
              <p className="text-white/75">
                Địa chỉ: 01 Võ Văn Ngân, Phường Thủ Đức, TP.HCM
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 w-full py-4 bg-[#06366E] border-t border-white/10">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/horizontal-ute-logo-white.png"
              alt="HCM-UTE Logo"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/85">
            <span>
              © 2026 Hệ thống Vị trí việc làm — Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE).
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://hcmute.edu.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white"
                title="Cổng thông tin HCM-UTE"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="mailto:tcns@hcmute.edu.vn"
                className="text-white/80 hover:text-white"
                title="Thư điện tử hỗ trợ nghiệp vụ"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
