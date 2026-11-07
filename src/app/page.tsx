'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  History,
  FileText,
  BookOpenCheck,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { WorkflowSidebar, SIDEBAR_FIVE_STEPS } from '@/components/layout/MilestonesBar';
import { HCMUTE_UNITS, UNIT_GROUPS } from '@/configs/hcmute-units';
import { HD07_12_STEP_ORDER, HD07_CONSTANTS } from '@/configs/hcmute-hd07-catalog';
import { validateStep1Data } from '@/components/tao-tep/Step1ReviewConfirm';
import {
  ActiveUnitSession,
  ActivityLogEntry,
  getActiveUnitDefinition,
  getActiveUnitSession,
  getActivityLogs
} from '@/services/telemetry/activity-log';

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
    return () => {
      window.removeEventListener('vtvl-unit-session-updated', sync);
      window.removeEventListener('vtvl-activity-updated', sync);
    };
  }, []);

  const activeUnit = getActiveUnitDefinition(session.unitCode);
  const currentStepNum = session.activeStep || 1;
  const currentStepInfo = SIDEBAR_FIVE_STEPS.find((s) => s.num === currentStepNum) || SIDEBAR_FIVE_STEPS[0];
  const hasOperator = Boolean(session.actorEmail.trim() && session.actorTitle.trim());

  const validationErrors = useMemo(
    () => validateStep1Data(activeUnit, session.actorEmail, session.actorTitle, session.proposedPositions),
    [activeUnit, session.actorEmail, session.actorTitle, session.proposedPositions]
  );

  const nextActionText = !hasOperator
    ? `Khai báo Email công vụ và Chức vụ người thực hiện tại đơn vị ${activeUnit.nameVi} (Chặng 2/5).`
    : currentStepNum === 1
      ? `Rà soát danh mục ${session.proposedPositions.length} vị trí việc làm đề xuất (Chặng ${session.wizardStage}/5) và xác nhận để xuất bộ biểu.`
      : currentStepNum === 2
        ? `Tải bộ biểu gốc 22 trang tính (.xlsx) và gói phiếu khảo sát (.zip) của ${activeUnit.nameVi}.`
        : currentStepNum === 3
          ? `Thực hiện bấm giờ hoặc nhập khung giờ định mức thực tế cho các vị trí tại ${activeUnit.nameVi}.`
          : currentStepNum === 4
            ? `Tải lên và gộp các phiếu khảo sát cá nhân vào tệp tổng hợp của ${activeUnit.nameVi}.`
            : `Kiểm tra chéo 6 chỉ tiêu thẩm định và xuất báo cáo hoàn chỉnh nộp về Phòng Tổ chức - Nhân sự.`;

  const continueHref =
    currentStepNum === 3
      ? '/bam-gio'
      : currentStepNum === 5
        ? '/ra-soat'
        : `/tao-tep?step=${currentStepNum}`;

  const progressPercent = Math.min(100, Math.round(((currentStepNum - 1) * 20) + (session.wizardStage * 4)));

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-3">
          <WorkflowSidebar activeStep={currentStepNum} unitCode={activeUnit.code} />
        </div>

        <div className="lg:col-span-9 space-y-5 min-w-0">
          {/* Khối tổng quan chính — Giảm khung lồng nhau, dùng đường phân cách mảnh */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-7 shadow-2xs flex flex-col gap-5">
            <div className="space-y-1.5 border-b border-[var(--border-subtle)] pb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]">
                Hệ thống Vị trí việc làm — HCM-UTE
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Lập đề án vị trí việc làm của đơn vị
              </h1>
              <p className="text-sm text-[var(--ink-muted)]">
                Hoàn thành 5 giai đoạn, hệ thống tự kiểm tra và xuất bộ hồ sơ.
              </p>
            </div>

            {/* Khối Việc cần làm tiếp theo: Đưa lên trước trên Mobile (order-2 sm:order-3) để nút Tiếp tục nằm ngay vùng nhìn đầu */}
            <div className="order-2 sm:order-3 rounded-xl bg-[var(--primary)]/[0.06] border border-[var(--primary)]/25 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[var(--primary)]">
                  Việc cần làm tiếp theo
                </div>
                <p className="text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  {nextActionText}
                </p>
              </div>
              <Link
                href={continueHref}
                className="btn-touch w-full sm:w-auto justify-center inline-flex items-center gap-2 min-h-[48px] px-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-deep)] text-white text-sm sm:text-base font-bold shadow-2xs shrink-0 transition-colors"
              >
                <span>Tiếp tục hồ sơ</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </Link>
            </div>

            {/* Thông tin Đơn vị, Giai đoạn hiện tại, Tiến độ, Số mục cần bổ sung & Thời gian lưu */}
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
                    <span>Tiến độ hồ sơ ({progressPercent}%)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--ink-subtle)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Đã tự động lưu lúc {session.lastSavedAt}</span>
                  </span>
                </div>
                <div className="text-base font-bold text-[var(--primary)]">
                  Giai đoạn {currentStepNum}/5 — {currentStepInfo.shortTitle}
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
                  <span>
                    Đang đề xuất <strong>{session.proposedPositions.length} vị trí việc làm</strong> · Chặng {session.wizardStage}/5
                  </span>
                  {validationErrors.length > 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-[var(--warn)]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{validationErrors.length} mục cần bổ sung</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-[var(--ok)]">Đủ điều kiện Giai đoạn 1</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Nhật ký thao tác gần đây — Dùng đường phân cách mảnh thay vì đóng khung từng dòng */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--primary)]" />
                <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                  Nhật ký thao tác gần đây của đơn vị
                </h2>
              </div>
              <span className="text-xs font-semibold text-[var(--ink-muted)] tabular-nums">
                {logs.length} bản ghi
              </span>
            </div>
            {logs.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)] py-2">
                Chưa có bản ghi thao tác nào. Bấm <strong>Tiếp tục hồ sơ</strong> ở trên để bắt đầu.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)] max-h-48 overflow-y-auto pr-1">
                {logs.slice(0, 4).map((log) => (
                  <li key={log.id} className="py-2.5 first:pt-1 last:pb-1 text-sm">
                    <div className="font-semibold text-[var(--foreground)]">
                      <span className="font-mono font-bold text-[var(--primary)] mr-1.5">[{log.unitCode}]</span>
                      <span>{log.details}</span>
                    </div>
                    {(log.actorTitle || log.actorEmail) && (
                      <div className="text-xs text-[var(--ink-muted)] mt-0.5">
                        Người thực hiện: <strong>{log.actorTitle || 'Chưa khai báo'}</strong> · {log.actorEmail} · {log.timestamp}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Khu vực Hướng dẫn, Căn cứ pháp lý và Phạm vi 51 đơn vị thu gọn ở cuối trang */}
          <details className="rounded-xl border border-[var(--border)] bg-[var(--sheet)] overflow-hidden shadow-2xs">
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
                <span className="text-xs text-[var(--ink-muted)]">Thứ tự 12 bước liên kết công thức trong tệp Excel ({HD07_12_STEP_ORDER.length} biểu)</span>
                <Link href="/huong-dan" className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--primary)] hover:underline">
                  <BookOpenCheck className="w-4 h-4" />
                  <span>Xem trang trợ giúp chi tiết</span>
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
