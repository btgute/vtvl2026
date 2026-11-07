'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Timer,
  CheckCircle2,
  ArrowRight,
  Building2,
  ShieldCheck,
  History,
  FileText,
  BookOpenCheck
} from 'lucide-react';
import { MilestonesBar } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS, UNIT_GROUPS } from '@/configs/hcmute-units';
import { HD07_12_STEP_ORDER, HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { ActivityLogEntry, getActivityLogs } from '@/services/telemetry/activity-log';

const FIVE_STEPS = [
  {
    step: '1',
    title: 'Bước 1: Khởi tạo tệp dữ liệu gốc của đơn vị (21 trang tính)',
    desc: 'Lựa chọn nhóm đơn vị và tên đơn vị để khởi tạo bộ biểu chuẩn theo Hướng dẫn số 07-HD/BTCTW, tích hợp danh mục vị trí việc làm theo Nghị định số 232/2026/NĐ-CP và chức danh nhà giáo theo Thông tư số 31/2026/TT-BGDĐT.',
    outputTag: '[MÃ_ĐV]_K2526_v1_YYYYMMDD.xlsx · Phieu_KhaoSat_B1_B2_...xlsx',
    href: '/tao-tep',
    btnText: 'Thực hiện Bước 1',
    primary: true
  },
  {
    step: '2',
    title: 'Bước 2: Phân phối phiếu khảo sát theo từng vị trí việc làm (.zip)',
    desc: 'Tải gói tệp nén (.zip) chứa phiếu khảo sát tách riêng cho từng vị trí việc làm của đơn vị (chỉ bao gồm các đầu việc thuộc vị trí đó, không lặp lại biểu nhân sự D1_NhanLuc nhằm tránh trùng lặp dữ liệu).',
    outputTag: 'Phieu_TungViTri_[MÃ_ĐV]_K2526_YYYYMMDD.zip',
    href: '/tao-tep#buoc-3',
    btnText: 'Thực hiện Bước 2',
    primary: false
  },
  {
    step: '3',
    title: 'Bước 3: Đo định mức thời gian thực hiện công việc (Trung bình phút/sản phẩm)',
    desc: 'Viên chức và người lao động lựa chọn vị trí việc làm đảm nhiệm, thực hiện đo thời gian xử lý công việc thực tế hoặc kê khai nhật ký thời gian để xuất phiếu định mức cá nhân chuẩn 19 cột (Biểu 3. B1_KhoiLuong).',
    outputTag: 'PhieuBamGio_[MÃ_ĐV]_[MÃ_VTVL]_YYYYMMDD.xlsx',
    href: '/bam-gio',
    btnText: 'Thực hiện Bước 3',
    primary: false
  },
  {
    step: '4',
    title: 'Bước 4: Tổng hợp phiếu khảo sát vào tệp đơn vị và xuất dự thảo Tờ trình',
    desc: 'Tổ thư ký đơn vị tải lên tệp đơn vị gốc (v1) cùng các phiếu khảo sát đã thu thập. Hệ thống tự động đối chiếu số liệu, tính toán lại quỹ giờ, nâng phiên bản (v1 → v2), ghi nhật ký tại biểu 15. S_NhatKy và kết xuất dự thảo Tờ trình.',
    outputTag: '[MÃ_ĐV]_K2526_v2_YYYYMMDD.xlsx · To_Trinh_VTVL_...txt',
    href: '/tao-tep#buoc-4',
    btnText: 'Thực hiện Bước 4',
    primary: true
  },
  {
    step: '5',
    title: 'Bước 5: Thẩm định chéo bộ biểu và hoàn thiện hồ sơ trình ký',
    desc: 'Kiểm tra tự động 6 chỉ tiêu đối soát chéo tại biểu 13. K_KiemTra, rà soát bậc nghề nghiệp (Bậc 1–5) theo Nghị định số 232/2026/NĐ-CP và điều khoản chuyển tiếp theo Thông tư số 31/2026/TT-BGDĐT trước khi gửi Phòng Tổ chức - Nhân sự.',
    outputTag: 'Bao_Cao_Ra_Soat_HD07_HCM-UTE.xlsx (Đạt 6/6 chỉ tiêu)',
    href: '/ra-soat',
    btnText: 'Thực hiện Bước 5',
    primary: true
  }
];

export default function HomePage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    setLogs(getActivityLogs());
    const handler = () => setLogs(getActivityLogs());
    window.addEventListener('vtvl-activity-updated', handler);
    return () => window.removeEventListener('vtvl-activity-updated', handler);
  }, []);

  return (
    <div className="w-full">
      <section className="bg-[var(--sheet)] border-b border-[var(--border)] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                <span>HƯỚNG DẪN SỐ 07-HD/BTCTW · NGHỊ ĐỊNH SỐ 232/2026/NĐ-CP · THÔNG TƯ SỐ 31/2026/TT-BGDĐT</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)] leading-tight">
                Hệ thống lập và thẩm định đề án vị trí việc làm — HCM-UTE
              </h1>
              <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-3xl leading-relaxed">
                Hệ thống hỗ trợ <strong>{HCMUTE_UNITS.length} đơn vị</strong> thuộc{' '}
                <strong>Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE)</strong> chuẩn hóa danh mục vị trí việc làm, thống kê khối lượng công việc kỳ{' '}
                <code className="font-mono font-semibold text-[var(--primary)]">{HD07_CONSTANTS.STATISTICAL_PERIOD}</code> và xây dựng phương án biên chế giai đoạn{' '}
                <code className="font-mono font-semibold text-[var(--primary)]">2027–2031</code>.
              </p>
            </div>

            <div className="lg:col-span-4 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="text-[11px] text-[var(--ink-muted)] font-medium">Phạm vi áp dụng</div>
                <div className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums mt-0.5">
                  {HCMUTE_UNITS.length}
                </div>
                <div className="text-[11px] text-[var(--ink-subtle)]">Đơn vị thuộc Trường</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="text-[11px] text-[var(--ink-muted)] font-medium">Quỹ giờ chuẩn PP2</div>
                <div className="text-2xl font-extrabold text-[var(--primary)] tabular-nums mt-0.5">
                  {HD07_CONSTANTS.STANDARD_PP2_HOURS}
                </div>
                <div className="text-[11px] text-[var(--ink-subtle)]">Giờ/người/năm</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                <div className="text-[11px] text-[var(--ink-muted)] font-medium">Kỳ kế hoạch</div>
                <div className="text-xl font-extrabold text-[#ED1C24] tabular-nums mt-0.5">
                  2027–31
                </div>
                <div className="text-[11px] text-[var(--ink-subtle)]">Phương án 5 năm</div>
              </div>
            </div>
          </div>

          <MilestonesBar />
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
                I. Trình tự 5 bước thực hiện tại đơn vị
              </h2>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                Đơn vị thực hiện tuần tự từ Bước 1 đến Bước 5; toàn bộ dữ liệu được xử lý bảo mật cục bộ trên trình duyệt.
              </p>
            </div>
            <Link
              href="/huong-dan"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:underline"
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>Xem hướng dẫn chi tiết cho đơn vị</span>
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs">
            {FIVE_STEPS.map((item) => (
              <div
                key={item.step}
                className="p-4 hover:bg-[var(--background)]/60 transition-colors grid grid-cols-1 sm:grid-cols-[36px_1fr_auto] gap-3.5 items-start"
              >
                <div className="w-8 h-8 rounded-lg bg-[#004776] text-white font-extrabold text-xs flex items-center justify-center tabular-nums shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">{item.title}</h3>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{item.desc}</p>
                  <div className="pt-0.5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-[var(--background)] text-[var(--ink-muted)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                      <FileText className="w-3 h-3 text-[var(--primary)]" />
                      <span>Kết quả: {item.outputTag}</span>
                    </span>
                  </div>
                </div>
                <div className="sm:self-center shrink-0">
                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-colors ${
                      item.primary
                        ? 'bg-[var(--primary)] text-white hover:opacity-95'
                        : 'bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <span>{item.btnText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
              <BookOpenCheck className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
                II. Thứ tự 12 bước hoàn thiện bảng tính theo liên kết công thức (Hướng dẫn số 07-HD/BTCTW)
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {HD07_12_STEP_ORDER.map((s) => (
                <div key={s.step} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] p-2.5 flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-[#004776] text-white font-bold text-[11px] flex items-center justify-center shrink-0 tabular-nums">
                    {s.step}
                  </span>
                  <div>
                    <code className="font-mono font-bold text-[var(--primary)]">{s.sheet}</code>
                    <p className="text-[var(--ink-muted)] mt-0.5 leading-snug">{s.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--primary)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                  Phân nhóm {HCMUTE_UNITS.length} đơn vị thuộc Trường
                </h3>
              </div>
              <Link href="/tao-tep" className="text-xs font-bold text-[var(--primary)] hover:underline">
                Chọn đơn vị →
              </Link>
            </div>
            <div className="space-y-2 text-xs">
              {UNIT_GROUPS.map((g) => (
                <div key={g.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] p-2.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-[var(--foreground)]">{g.label}</strong>
                    <span className="font-mono text-[11px] font-bold text-[var(--primary)] bg-[var(--sheet)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {g.sampleTo}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-muted)]">{g.factsText}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
              <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="text-sm font-extrabold text-[var(--foreground)]">
                Quy định nộp hồ sơ thẩm định
              </h3>
            </div>
            <div className="text-xs text-[var(--ink-muted)] space-y-2 leading-relaxed">
              <p>
                <strong>Cơ quan tiếp nhận:</strong> Phòng Tổ chức - Nhân sự (<code className="font-mono">TCNS</code>) — Trường Đại học Công nghệ Kỹ thuật TP.HCM.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[var(--foreground)]">
                <li>Tệp dữ liệu đơn vị (21 trang tính) đã tổng hợp phiếu khảo sát và đạt <strong>6/6 chỉ tiêu kiểm tra chéo</strong>.</li>
                <li>Tờ trình đề nghị thẩm định đề án vị trí việc làm và phương án biên chế giai đoạn 2027–2031 trình ký qua hệ thống E-Office.</li>
              </ul>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-2 text-center">
              <Link href="/tao-tep" className="rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] py-2 px-1 text-[11px] font-bold flex flex-col items-center gap-1">
                <FileSpreadsheet className="w-4 h-4 text-[var(--primary)]" />
                <span>Tạo &amp; gộp tệp</span>
              </Link>
              <Link href="/bam-gio" className="rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] py-2 px-1 text-[11px] font-bold flex flex-col items-center gap-1">
                <Timer className="w-4 h-4 text-[var(--primary)]" />
                <span>Đo định mức</span>
              </Link>
              <Link href="/ra-soat" className="rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] py-2 px-1 text-[11px] font-bold flex flex-col items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                <span>Thẩm định biểu</span>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--primary)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">Nhật ký thao tác gần nhất</h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--ink-muted)] tabular-nums">
                {logs.length} bản ghi
              </span>
            </div>
            {logs.length === 0 ? (
              <p className="text-xs text-[var(--ink-subtle)] py-1.5">
                Chưa phát sinh bản ghi thao tác trong phiên làm việc hiện tại.
              </p>
            ) : (
              <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {logs.slice(0, 5).map((log) => (
                  <li key={log.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--background)] px-2.5 py-1.5 text-xs">
                    <span className="font-mono font-bold text-[var(--primary)] mr-1">[{log.unitCode}]</span>
                    <span className="text-[var(--foreground)]">{log.details}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
