'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, History, FileText, BookOpenCheck, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { WorkflowSidebar, SIDEBAR_FIVE_STEPS } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS, UNIT_GROUPS } from '@/configs/hcmute-units';
import { HD07_12_STEP_ORDER, HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { validateStep1Data } from '@/components/tao-tep/Step1ReviewConfirm';
import { ActiveUnitSession, ActivityLogEntry, getActiveUnitDefinition, getActiveUnitSession, getActivityLogs } from '@/services/telemetry/activity-log';

export default function HomePage() {
  const [session, setSession] = useState<ActiveUnitSession>(() => getActiveUnitSession());
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    const sync = () => {
      setSession(getActiveUnitSession());
      setLogs(getActivityLogs());
    };
    sync();
    window.addEventListener('vtvl-unit-session-updated', sync);
    window.addEventListener('vtvl-activity-updated', sync);
    window.addEventListener('storage', sync);
    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('hcmute_vtvl_realtime');
      bc.onmessage = sync;
    }
    return () => {
      window.removeEventListener('vtvl-unit-session-updated', sync);
      window.removeEventListener('vtvl-activity-updated', sync);
      window.removeEventListener('storage', sync);
      bc?.close();
    };
  }, []);

  const activeUnit = getActiveUnitDefinition(session.unitCode);
  const rawStep = session.activeStep || 1;
  const currentStepNum = rawStep === 2 ? 6 : rawStep === 4 ? 7 : rawStep === 5 ? 8 : rawStep === 1 ? (session.wizardStage === 3 ? 2 : session.wizardStage >= 4 ? 5 : 1) : rawStep;
  const currentStepInfo = SIDEBAR_FIVE_STEPS.find((s) => s.num === currentStepNum) || SIDEBAR_FIVE_STEPS[0];
  const hasOperator = Boolean(session.actorEmail.trim() && session.actorTitle.trim());

  const validationErrors = useMemo(
    () => validateStep1Data(activeUnit, session.actorEmail, session.actorTitle, session.proposedPositions),
    [activeUnit, session.actorEmail, session.actorTitle, session.proposedPositions]
  );

  const nextActionText = !hasOperator
    ? `Bước 1 (Biểu A1 & S_NhatKy): Khai báo Email công vụ và Chức vụ người thực hiện tại đơn vị ${activeUnit.nameVi}.`
    : currentStepNum <= 5 && rawStep === 1
      ? `Bước ${currentStepNum}/8 (${currentStepInfo.sheets}): Rà soát danh mục ${session.proposedPositions.length} vị trí việc làm đề xuất và xác nhận để xuất bộ 10 biểu gốc (A1–D2).`
      : currentStepNum === 6
        ? `Bước 6/8 (Biểu 8. C3_NhuCau): Tải bộ 10 biểu gốc (.xlsx) và gói phiếu khảo sát (.zip) của ${activeUnit.nameVi}.`
        : currentStepNum === 3 || currentStepNum === 4
          ? `Bước 3 & 4/8 (Biểu 3. B1 & 4. B2_CT): Bấm giờ đo thời gian thực tế và kê khai tác động CĐS tại ${activeUnit.nameVi}.`
          : currentStepNum === 7
            ? `Bước 7/8 (Biểu 9. D1 & 10. D2): Gộp phiếu khảo sát cá nhân và lập phương án biên chế 2027–2031 của ${activeUnit.nameVi}.`
            : `Bước 8/8 (Biểu 13. K_KiemTra): Kiểm tra chéo 10 biểu (A1–D2) và xuất báo cáo gửi Phòng Tổ chức - Nhân sự.`;

  const continueHref = '/bang-tinh';
  const progressPercent = Math.min(100, Math.round((currentStepNum / 8) * 100));

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <WorkflowSidebar activeStep={currentStepNum} unitCode={activeUnit.code} />

        <div className="flex-1 w-full space-y-6 min-w-0">
          {/* Vùng tổng quan hợp nhất (Lớp 2: Nền trắng không viền bao ngoài + Lớp 3: Nền xanh nhạt cho Việc cần làm tiếp theo) */}
          <section className="surface-canvas rounded-2xl p-5 sm:p-7 flex flex-col gap-6">
            <div className="space-y-1.5 border-b border-[var(--border-subtle)] pb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]">
                Hệ thống Vị trí việc làm — HCM-UTE (Hướng dẫn số 07-HD/BTCTW)
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Quy trình 08 bước &amp; 10 biểu nghiệp vụ (A1–D2) lập đề án Vị trí việc làm
              </h1>
              <p className="text-sm text-[var(--ink-muted)]">
                Thực hiện đầy đủ 08 bước nghiệp vụ trên 10 biểu chuẩn (1. A1_NhiemVu → 10. D2_PhuongAn) kèm bảng kiểm tra tự động K_KiemTra.
              </p>
            </div>

            {/* Khối Việc cần làm tiếp theo: Dùng nền xanh rất nhạt (Lớp 3), không cần viền xanh */}
            <div className="order-2 sm:order-3 surface-tint rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  Việc cần làm tiếp theo
                </div>
                <p className="text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  {nextActionText}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/bang-tinh"
                  className="btn-touch w-full sm:w-auto justify-center inline-flex items-center gap-1.5 min-h-[48px] px-5 rounded-xl bg-white hover:bg-[#f1f5f9] text-[#004776] border border-[#004776]/40 text-sm font-bold shadow-2xs shrink-0 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0 text-[#004776]" />
                  <span>Bảng tính Excel 15 sheet</span>
                </Link>
                <Link
                  href={continueHref}
                  className="btn-touch w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-[48px] px-5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-deep)] text-white text-sm font-bold shadow-2xs shrink-0 transition-colors"
                >
                  <span>Tiếp tục hồ sơ</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </Link>
              </div>
            </div>

            {/* Bố cục hai cột hợp nhất: Đơn vị đang thực hiện & Tiến độ hồ sơ hiện tại (phân tách bằng divider dọc) */}
            <div className="order-3 sm:order-2 grid grid-cols-1 sm:grid-cols-2 gap-6 py-1 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)]">
              <div className="space-y-1.5 sm:pr-4">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[var(--primary)]" />
                    <span>Đơn vị đang thực hiện</span>
                  </span>
                  <span className="font-mono font-bold text-[var(--primary)]">[{activeUnit.code}]</span>
                </div>
                <div className="text-base font-bold text-[var(--foreground)]">
                  {activeUnit.nameVi}
                </div>
                <div className="text-xs text-[var(--ink-muted)]">
                  {hasOperator
                    ? `Người thực hiện: ${session.actorTitle} (${session.actorEmail})`
                    : 'Chưa khai báo Email & Chức vụ người thực hiện'}
                </div>
              </div>

              <div className="pt-4 sm:pt-0 sm:pl-6 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--ok)]" />
                    <span>Tiến độ hồ sơ hiện tại ({progressPercent}%)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--ink-subtle)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Lưu lúc {session.lastSavedAt}</span>
                  </span>
                </div>
                <div className="text-base font-bold text-[var(--primary)]">
                  Bước {currentStepNum}/8 — {currentStepInfo.shortTitle} ({currentStepInfo.sheets})
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--muted)] overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
                  <span>
                    Đang đề xuất <strong>{session.proposedPositions.length} vị trí việc làm</strong> · Quy trình 08 bước HD 07
                  </span>
                  {validationErrors.length > 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[var(--warn)]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{validationErrors.length} mục cần bổ sung</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-[var(--ok)]">Đủ điều kiện xuất 10 biểu gốc</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Lộ trình 08 bước & 10 biểu nghiệp vụ (A1–D2) theo Hướng dẫn số 07-HD/BTCTW */}
          <section className="surface-canvas rounded-2xl p-5 sm:p-6 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-[var(--primary)]" />
                <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                  Quy trình 08 bước &amp; 10 biểu nghiệp vụ (1. A1_NhiemVu → 10. D2_PhuongAn)
                </h2>
              </div>
              <Link href="/huong-dan" className="text-xs font-bold text-[var(--primary)] hover:underline">
                Xem Phụ lục I–VIII &amp; tải biểu mẫu gốc →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SIDEBAR_FIVE_STEPS.map((st) => {
                const isCur = st.num === currentStepNum;
                return (
                  <Link
                    key={st.num}
                    href={st.href}
                    className={`rounded-xl border p-3.5 flex flex-col justify-between gap-2 transition-colors ${
                      isCur
                        ? 'border-[var(--primary)] bg-[var(--surface-tint)]'
                        : 'border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`w-6 h-6 rounded-full text-xs font-extrabold inline-flex items-center justify-center ${isCur ? 'bg-[var(--primary)] text-white' : 'bg-[var(--sheet)] text-[var(--primary)] border border-[var(--border)]'}`}>
                          {st.num}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[var(--primary)] truncate">{st.sheets}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-snug pt-0.5">
                        Bước {st.num} — {st.shortTitle}
                      </div>
                    </div>
                    <div className="text-[11px] text-[var(--ink-muted)] truncate">
                      {st.subTasks[0]?.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Nhật ký thao tác gần đây — Không đóng khung viền lớn, dùng tiêu đề section + divider */}
          <section className="surface-canvas rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--primary)]" />
                <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                  Nhật ký thao tác gần đây
                </h2>
              </div>
              <span className="text-xs font-semibold text-[var(--ink-muted)] tabular-nums">
                {logs.length} bản ghi
              </span>
            </div>
            {logs.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)] py-1">
                Chưa có bản ghi thao tác nào.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)] max-h-56 overflow-y-auto pr-1">
                {logs.slice(0, 5).map((log) => (
                  <li key={log.id} className="py-2.5 first:pt-1 last:pb-1 text-sm">
                    <div className="font-semibold text-[var(--foreground)]">
                      <span className="font-mono font-bold text-[var(--primary)] mr-1.5">[{log.unitCode}]</span>
                      <span>{log.details}</span>
                    </div>
                    <div className="text-xs text-[var(--ink-muted)] mt-0.5">
                      {log.timestamp}
                      {(log.actorTitle || log.actorEmail) ? ` · Người thao tác: ${log.actorTitle || 'Chưa khai báo'} (${log.actorEmail})` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Khu vực Hướng dẫn, Căn cứ pháp lý và Phạm vi 51 đơn vị (Lớp 3: nền phụ, không viền) */}
          <details className="surface-secondary rounded-xl overflow-hidden">
            <summary className="cursor-pointer px-5 min-h-[48px] text-sm font-bold text-[var(--foreground)] flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>Hướng dẫn, Căn cứ pháp lý &amp; Phạm vi {HCMUTE_UNITS.length} đơn vị thuộc HCM-UTE</span>
              </span>
              <span className="text-xs font-semibold text-[var(--primary)] shrink-0 ml-2">Mở / Đóng</span>
            </summary>
            <div className="p-5 border-t border-[var(--border-subtle)] space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-[var(--border-subtle)]">
                <div className="space-y-1">
                  <strong className="text-[var(--primary)] block">Căn cứ pháp lý hiện hành (2026)</strong>
                  <p className="text-[var(--ink-muted)]">Hướng dẫn số 07-HD/BTCTW; Nghị định số 232/2026/NĐ-CP; Thông tư số 31/2026/TT-BGDĐT; Hướng dẫn số 02 (1907/HD-ĐHCNKT).</p>
                </div>
                <div className="space-y-1">
                  <strong className="text-[var(--primary)] block">Mốc số liệu thống kê chuẩn</strong>
                  <p className="text-[var(--ink-muted)]">Kỳ thống kê khối lượng (Biểu B1, B2_CT): {HD07_CONSTANTS.STATISTICAL_PERIOD}. Chốt nhân sự hiện có (Biểu D1): {HD07_CONSTANTS.STAFF_CUTOFF_DATE}.</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] mb-2">4 khối đơn vị thuộc HCM-UTE ({HCMUTE_UNITS.length} đơn vị)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {UNIT_GROUPS.map((g) => (
                    <div key={g.id} className="border-l-2 border-[var(--primary)]/40 pl-3 py-0.5">
                      <strong className="text-[var(--foreground)] block">{g.label}</strong>
                      <span className="text-xs text-[var(--ink-muted)]">{g.factsText}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs text-[var(--ink-muted)]">Quy trình 08 bước, 10 biểu nghiệp vụ (A1–D2) &amp; 12 bước liên kết công thức Excel ({HD07_12_STEP_ORDER.length} biểu)</span>
                <Link href="/huong-dan" className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--primary)] hover:underline">
                  <BookOpenCheck className="w-4 h-4" />
                  <span>Xem trang trợ giúp &amp; tải Bộ Phụ lục HD 07</span>
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
