'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  History,
  FileText,
  BookOpenCheck
} from 'lucide-react';
import { WorkflowSidebar, InfoTip, SIDEBAR_FIVE_STEPS } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS, UNIT_GROUPS } from '@/configs/hcmute-units';
import { HD07_12_STEP_ORDER, HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { ActivityLogEntry, getActivityLogs } from '@/services/telemetry/activity-log';

const STEP_OUTPUTS: Record<number, string> = {
  1: '[MÃ_ĐV]_K2526_v1_YYYYMMDD.xlsx (Cấu hình Tên VTVL cụ thể & Bậc nghề nghiệp)',
  2: 'Phieu_TungViTri_[MÃ_ĐV]_K2526_YYYYMMDD.zip (Gói phiếu tách theo vị trí)',
  3: 'PhieuBamGio_[MÃ_ĐV]_[MÃ_VTVL]_YYYYMMDD.xlsx (Định mức phút/SP chuẩn 19 cột)',
  4: '[MÃ_ĐV]_K2526_v2_YYYYMMDD.xlsx · To_Trinh_VTVL_...txt (Hồ sơ tổng hợp)',
  5: 'Bao_Cao_Tham_Dinh_VTVL_HCM-UTE.xlsx (Đạt 6/6 chỉ tiêu kiểm tra chéo K_KiemTra)'
};

export default function HomePage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    setLogs(getActivityLogs());
    const handler = () => setLogs(getActivityLogs());
    window.addEventListener('vtvl-activity-updated', handler);
    return () => window.removeEventListener('vtvl-activity-updated', handler);
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
      {/* Banner tóm tắt cực gọn kèm nút "!" tra cứu nhanh */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
              Hệ thống lập và thẩm định đề án vị trí việc làm — HCM-UTE
            </h1>
            <InfoTip title="Thông tin kỳ thống kê & căn cứ pháp lý">
              <p><strong>Phạm vi:</strong> {HCMUTE_UNITS.length} đơn vị thuộc Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE).</p>
              <p><strong>Kỳ thống kê khối lượng (B1, B2_CT):</strong> {HD07_CONSTANTS.STATISTICAL_PERIOD}.</p>
              <p><strong>Chốt nhân sự hiện có (D1):</strong> {HD07_CONSTANTS.STAFF_CUTOFF_DATE}.</p>
              <p><strong>Căn cứ:</strong> Hướng dẫn 07-HD/BTCTW, Nghị định 232/2026/NĐ-CP, Thông tư 31/2026/TT-BGDĐT &amp; Hướng dẫn số 02 (1907/HD-ĐHCNKT).</p>
            </InfoTip>
          </div>
          <p className="text-xs text-[var(--ink-muted)]">
            Thầy/Cô chọn từng bước trên <strong>Thanh tiến trình 1 → 5 bên trái</strong> để thực hiện tuần tự từ khởi tạo tệp đến thẩm định hồ sơ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-center">
            <span className="text-[10px] text-[var(--ink-muted)] block">Phạm vi</span>
            <strong className="text-sm font-extrabold text-[var(--foreground)]">{HCMUTE_UNITS.length} đơn vị</strong>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-center">
            <span className="text-[10px] text-[var(--ink-muted)] block">Khung Trường</span>
            <strong className="text-sm font-extrabold text-[var(--primary)]">38 VTVL (04 nhóm)</strong>
          </div>
          <Link
            href="/tao-tep?step=1"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-2xs hover:opacity-95"
          >
            <span>Bắt đầu Bước 1</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Sidebar tiến trình 1 -> 2 -> 3 -> 4 -> 5 bên trái */}
        <div className="lg:col-span-3">
          <WorkflowSidebar activeStep={1} />
        </div>

        {/* Nội dung chính tinh gọn */}
        <div className="lg:col-span-9 space-y-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--background)]/50">
              <div className="flex items-center">
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
                  Lộ trình 5 bước thực hiện tại đơn vị
                </h2>
                <InfoTip title="Quy định nộp hồ sơ về Phòng TCNS">
                  <p>1. Tệp dữ liệu đơn vị 21 trang tính (<code className="font-mono">v2</code>) đã gộp phiếu và đạt <strong>6/6 chỉ tiêu kiểm tra chéo</strong>.</p>
                  <p>2. Tờ trình đề nghị thẩm định đề án vị trí việc làm trình ký qua E-Office.</p>
                </InfoTip>
              </div>
              <Link href="/huong-dan" className="text-xs font-bold text-[var(--primary)] hover:underline inline-flex items-center gap-1">
                <BookOpenCheck className="w-3.5 h-3.5" />
                <span>Chi tiết phân công vai trò</span>
              </Link>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {SIDEBAR_FIVE_STEPS.map((s) => (
                <div key={s.num} className="p-3.5 hover:bg-[var(--background)]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#004776] text-white font-extrabold text-xs flex items-center justify-center shrink-0 tabular-nums">
                      {s.num}
                    </span>
                    <div className="flex items-center min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">{s.title}</h3>
                      <InfoTip title={`Sản phẩm đầu ra Bước ${s.num}`}>
                        <p className="font-mono text-[11px] text-[var(--primary)]">{STEP_OUTPUTS[s.num]}</p>
                      </InfoTip>
                    </div>
                  </div>
                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--background)] hover:border-[var(--primary)] border border-[var(--border)] text-xs font-bold text-[var(--primary)] shrink-0 self-start sm:self-center"
                  >
                    <span>Mở Bước {s.num}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[var(--primary)]" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-[var(--foreground)]">
                    4 khối đơn vị thuộc HCM-UTE ({HCMUTE_UNITS.length} đơn vị)
                  </h3>
                </div>
                <Link href="/tao-tep?step=1" className="text-xs font-bold text-[var(--primary)] hover:underline">
                  Chọn đơn vị →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {UNIT_GROUPS.map((g) => (
                  <Link
                    key={g.id}
                    href="/tao-tep?step=1"
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] hover:border-[var(--primary)] p-2.5 transition-colors"
                  >
                    <strong className="text-[var(--foreground)] block">{g.label}</strong>
                    <span className="text-[11px] text-[var(--ink-muted)]">{g.factsText}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[var(--primary)]" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-[var(--foreground)]">Nhật ký thao tác gần đây</h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--ink-muted)] tabular-nums">
                  {logs.length} bản ghi
                </span>
              </div>
              {logs.length === 0 ? (
                <p className="text-xs text-[var(--ink-subtle)] py-2">
                  Chưa có bản ghi thao tác trong phiên làm việc hiện tại.
                </p>
              ) : (
                <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {logs.slice(0, 4).map((log) => (
                    <li key={log.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--background)] px-2.5 py-1.5 text-xs truncate">
                      <span className="font-mono font-bold text-[var(--primary)] mr-1">[{log.unitCode}]</span>
                      <span className="text-[var(--foreground)]">{log.details}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <details className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs">
            <summary className="cursor-pointer px-4 py-3 text-xs sm:text-sm font-extrabold text-[var(--foreground)] flex items-center justify-between bg-[var(--background)]/50">
              <span className="inline-flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--primary)]" />
                <span>Xem thứ tự 12 bước liên kết công thức trong tệp Excel (Hướng dẫn số 07-HD/BTCTW)</span>
              </span>
              <span className="text-[11px] font-bold text-[var(--primary)]">Bấm để mở / đóng</span>
            </summary>
            <div className="p-4 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
          </details>
        </div>
      </div>
    </div>
  );
}
