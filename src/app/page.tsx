'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, CheckCircle2, History, FileText, BookOpenCheck, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { SIDEBAR_FIVE_STEPS } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { HD07_12_STEP_ORDER, HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { validateStep1Data } from '@/components/tao-tep/Step1ReviewConfirm';
import { ActiveUnitSession, ActivityLogEntry, getActiveUnitDefinition, getActiveUnitSession, getActivityLogs } from '@/services/telemetry/activity-log';

export default function HomePage() {
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [session, setSession] = useState<ActiveUnitSession>(() => getActiveUnitSession());
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') !== 'overview') {
        setShouldRedirect(true);
        router.replace('/bang-tinh');
      }
    }
  }, [router]);

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
    ? `Bước 1 (A1 & S_NhatKy): Khai báo Email công vụ và Chức vụ người thực hiện tại [${activeUnit.code}] ${activeUnit.nameVi}.`
    : currentStepNum <= 5 && rawStep === 1
      ? `Bước ${currentStepNum}/8 (${currentStepInfo.sheets}): Rà soát ${session.proposedPositions.length} vị trí việc làm đề xuất của [${activeUnit.code}].`
      : currentStepNum === 6
        ? `Bước 6/8 (C3_NhuCau): Tải bộ 10 biểu gốc (.xlsx) và gói phiếu khảo sát (.zip) của [${activeUnit.code}].`
        : currentStepNum === 3 || currentStepNum === 4
          ? `Bước 3 & 4/8 (B1 & B2_CT): Đo thời gian thực tế và kê khai tác động CĐS tại [${activeUnit.code}].`
          : currentStepNum === 7
            ? `Bước 7/8 (D1 & D2): Gộp phiếu khảo sát cá nhân và lập phương án biên chế của [${activeUnit.code}].`
            : `Bước 8/8 (K_KiemTra): Kiểm tra chéo 10 biểu và xuất báo cáo gửi Phòng TCNS.`;

  const continueHref = '/bang-tinh';
  const progressPercent = Math.min(100, Math.round((currentStepNum / 8) * 100));

  if (shouldRedirect) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#004776]/10 text-[#004776] text-sm font-semibold border border-[#004776]/20">
          <FileSpreadsheet className="w-4 h-4 animate-pulse" />
          <span>Đang chuyển đến Bảng tính Excel 15 sheet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1360px] mx-auto px-3.5 sm:px-5 lg:px-6 py-4 space-y-4">
      {/* Khối Workspace tổng quan hợp nhất */}
      <section className="bg-white rounded-xl border border-[var(--border)] p-4 sm:p-6 flex flex-col gap-4 shadow-2xs">
        <div className="space-y-1 border-b border-[var(--border-subtle)] pb-3.5">
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--foreground)]">
            Quy trình 08 bước lập đề án Vị trí việc làm (A1–D2)
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
            Thực hiện đầy đủ 08 bước nghiệp vụ trên 10 biểu chuẩn (1. A1_NhiemVu → 10. D2_PhuongAn) theo Hướng dẫn số 07-HD/BTCTW.
          </p>
        </div>

        {/* Khối Việc cần làm tiếp theo */}
        <div className="bg-[var(--surface-tint)] rounded-lg p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[var(--primary)]/15">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-[var(--primary)]">
              Việc cần làm tiếp theo
            </span>
            <p className="text-xs sm:text-sm font-medium text-[var(--foreground)]">
              {nextActionText}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/bang-tinh"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-white hover:bg-[#f1f5f9] text-[#004776] border border-[#cbd5e1] text-xs font-medium transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#004776]" />
              <span>Bảng tính 15 sheet</span>
            </Link>
            <Link
              href={continueHref}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <span>Tiếp tục hồ sơ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bố cục 2 cột: Đơn vị & Tiến độ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)]">
          <div className="space-y-1 sm:pr-4">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Đơn vị đang thực hiện</span>
              </span>
              <span className="font-semibold text-[var(--primary)]">[{activeUnit.code}]</span>
            </div>
            <div className="text-sm font-semibold text-[var(--foreground)]">
              {activeUnit.nameVi}
            </div>
            <div className="text-xs text-[var(--ink-muted)]">
              {hasOperator
                ? `Người thực hiện: ${session.actorTitle} (${session.actorEmail})`
                : 'Chưa khai báo Email & Chức vụ người thực hiện'}
            </div>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--ink-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ok)]" />
                <span>Tiến độ hồ sơ ({progressPercent}%)</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[var(--ink-subtle)]">
                <Clock className="w-3 h-3" />
                <span>Lưu lúc {session.lastSavedAt}</span>
              </span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-[var(--primary)]">
              Bước {currentStepNum}/8 — {currentStepInfo.shortTitle}
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--muted)] overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
              <span>Đang đề xuất {session.proposedPositions.length} vị trí việc làm</span>
              {validationErrors.length > 0 ? (
                <span className="inline-flex items-center gap-1 font-medium text-[var(--warn)]">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{validationErrors.length} mục cần bổ sung</span>
                </span>
              ) : (
                <span className="font-medium text-[var(--ok)]">Đủ điều kiện xuất 10 biểu gốc</span>
              )}
            </div>
          </div>
        </div>

        {/* Nhật ký thao tác gần đây */}
        <div className="border-t border-[var(--border-subtle)] pt-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[var(--primary)]" />
              <h2 className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                Nhật ký thao tác gần đây
              </h2>
            </div>
            <span className="text-xs text-[var(--ink-muted)] tabular-nums">
              {logs.length} bản ghi
            </span>
          </div>
          {logs.length === 0 ? (
            <p className="text-xs text-[var(--ink-muted)] py-1">
              Chưa có bản ghi thao tác nào.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)] max-h-48 overflow-y-auto pr-1">
              {logs.slice(0, 5).map((log) => (
                <li key={log.id} className="py-2 text-xs">
                  <div className="font-medium text-[var(--foreground)]">
                    <span className="font-semibold text-[var(--primary)] mr-1">[{log.unitCode}]</span>
                    <span>{log.details}</span>
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                    {log.timestamp}
                    {(log.actorTitle || log.actorEmail) ? ` · ${log.actorTitle || 'Chưa khai báo'} (${log.actorEmail})` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Căn cứ pháp lý */}
      <details className="bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        <summary className="cursor-pointer px-4 h-11 text-xs sm:text-sm font-semibold text-[var(--foreground)] flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
            <span>Căn cứ pháp lý &amp; Phạm vi {HCMUTE_UNITS.length} đơn vị</span>
          </span>
          <span className="text-xs font-medium text-[var(--primary)] shrink-0">Mở / Đóng</span>
        </summary>
        <div className="p-4 border-t border-[var(--border-subtle)] bg-white space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-[var(--border-subtle)]">
            <div>
              <strong className="text-[var(--primary)] block">Căn cứ pháp lý</strong>
              <p className="text-[var(--ink-muted)]">Hướng dẫn số 07-HD/BTCTW; Nghị định số 232/2026/NĐ-CP; Thông tư số 31/2026/TT-BGDĐT.</p>
            </div>
            <div>
              <strong className="text-[var(--primary)] block">Kỳ thống kê</strong>
              <p className="text-[var(--ink-muted)]">Kỳ thống kê B1, B2_CT: {HD07_CONSTANTS.STATISTICAL_PERIOD}. Chốt nhân sự D1: {HD07_CONSTANTS.STAFF_CUTOFF_DATE}.</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--ink-muted)]">10 biểu nghiệp vụ A1–D2 ({HD07_12_STEP_ORDER.length} biểu liên kết)</span>
            <Link href="/huong-dan" className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline">
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span>Xem Phụ lục HD 07</span>
            </Link>
          </div>
        </div>
      </details>
    </div>
  );
}
