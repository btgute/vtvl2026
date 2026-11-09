'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, CheckSquare, AlertTriangle, ArrowRight, Download, FileSpreadsheet, ListOrdered } from 'lucide-react';
import { WorkflowSidebar, InfoTip } from '@/components/layout/MilestonesBar';
import { HD07_12_STEP_ORDER, HD07_EIGHT_STEPS_PROCESS, HD07_OFFICIAL_DOCS } from '@/configs/hcmute-hd07-catalog';

const ROLE_CARDS = [
  {
    role: '1. Thủ trưởng đơn vị (Trưởng khoa, Viện trưởng, Trưởng phòng, Giám đốc)',
    sheets: '1. A1_NhiemVu · 6. C1_VTVL · 8. C3_NhuCau · 10. D2_PhuongAn',
    summary: 'Phê duyệt danh mục nhiệm vụ, tên VTVL cụ thể, bậc nghề nghiệp và ký Tờ trình gửi Phòng TCNS.',
    details: [
      'Phê duyệt danh mục nhiệm vụ (Biểu A1), Tên VTVL cụ thể tại đơn vị và Bậc nghề nghiệp theo Hướng dẫn số 02 (1907/HD-ĐHCNKT).',
      'Rà soát điều kiện chuyển tiếp đối với viên chức giữ chức danh Trợ giảng (V.07.01.23) theo khoản 5 Điều 15 Thông tư 31/2026/TT-BGDĐT.',
      'Thống nhất nhu cầu nhân lực năm cơ sở (Biểu C3) và ký Tờ trình đề nghị thẩm định.'
    ]
  },
  {
    role: '2. Tổ thư ký đơn vị (Thư ký khoa, Chuyên viên hành chính – tổng hợp)',
    sheets: '2. A2_CongViec · 9. D1_NhanLuc · 13. K_KiemTra · 15. S_NhatKy',
    summary: 'Khởi tạo tệp gốc v1 (Giai đoạn 1–2), kê khai nhân sự D1, gộp phiếu khảo sát v2 (Giai đoạn 4) và thẩm định (Giai đoạn 5).',
    details: [
      'Khởi tạo bộ biểu gốc 22 trang tính (v1) và gói tệp nén (.zip) chứa phiếu khảo sát theo từng vị trí việc làm.',
      'Kê khai danh sách nhân sự hiện có của đơn vị chốt tại ngày 30/9/2026 trên biểu 9. D1_NhanLuc.',
      'Tổng hợp tự động các phiếu khảo sát (v1 → v2) và chạy kiểm tra chéo đạt 6/6 chỉ tiêu tại biểu 13. K_KiemTra.'
    ]
  },
  {
    role: '3. Trưởng bộ môn, Giảng viên, Nhân sự PTN và Chuyên viên chuyên trách',
    sheets: '3. B1_KhoiLuong · 4. B2_CT_TacDong · 7. C2_NangLuc',
    summary: 'Đo định mức thời gian (Giai đoạn 3), kê khai sản lượng năm học (Biểu B1) và công đoạn chuyển đổi số (Biểu B2_CT).',
    details: [
      'Thực hiện đo định mức thời gian xử lý công việc thực tế (Trung bình phút/sản phẩm) tại Giai đoạn 3 (/bam-gio).',
      'Kê khai sản lượng thực tế phát sinh trong kỳ 01/10/2025–30/9/2026 (Cột C biểu B1), ghi rõ nguồn xác thực (Cột H, I) và giải trình nếu lệch chuẩn quá 30% (Cột S).',
      'Kê khai chi tiết các công đoạn đã ứng dụng chuyển đổi số (UTEx LMS, E-Office...) tại biểu 4. B2_CT_TacDong.'
    ]
  }
];

const COMMON_PITFALLS = [
  { code: 'Lưu ý 1 (Biểu B1 - Cột H, I)', title: 'Chưa cập nhật nguồn văn bản xác thực sản lượng và thời gian', fix: 'Ghi rõ tên văn bản, báo cáo hoặc hệ thống quản trị thực tế của đơn vị (VD: Kế hoạch giảng dạy 2025–2026, E-Office, Biên bản đo định mức).' },
  { code: 'Lưu ý 2 (Biểu B1 - Cột S)', title: 'Thời gian thực tế lệch trên 30% so với chuẩn nhưng chưa thuyết minh', fix: 'Nếu Trung bình phút/SP (Cột D) lệch trên 30% so với định mức chuẩn tại biểu 11. DM_SAN_PHAM, đơn vị phải ghi rõ nguyên nhân đặc thù tại Cột S.' },
  { code: 'Lưu ý 3 (Phụ lục II HD 1907)', title: 'Đặt Tên VTVL cụ thể hoặc chọn Bậc nghề nghiệp vượt giới hạn', fix: 'Đặt tên theo công thức [Khung VTVL của Trường] + [lĩnh vực phụ trách / số thứ tự] và chọn bậc nằm trong giới hạn tại Phụ lục I văn bản 1907/HD-ĐHCNKT.' },
  { code: 'Lưu ý 4 (Biểu D1 - Cột A, E, F)', title: 'Kê khai trùng mã nguồn lực hoặc vượt quỹ giờ chuẩn năm', fix: 'Mỗi viên chức chốt ngày 30/9/2026 chỉ kê khai 1 dòng duy nhất tại biểu 9. D1_NhanLuc; tổng giờ phân bổ không vượt 1.904 giờ (hoặc 1.760 giờ đối với GV/NCV).' }
];

export default function HuongDanDonViPage() {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [checklistMode, setChecklistMode] = useState<'8buoc' | '12buoc'>('8buoc');
  const toggleStep = (step: number) => setCheckedSteps((prev) => ({ ...prev, [step]: !prev[step] }));
  const totalSteps = checklistMode === '8buoc' ? 8 : 12;
  const completedCount = Object.entries(checkedSteps).filter(([k, v]) => Number(k) <= totalSteps && v).length;

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6">
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <WorkflowSidebar activeStep={1} />

        <div className="flex-1 w-full space-y-5 min-w-0">
          <section className="surface-canvas rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3.5">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-[var(--primary)] mr-2.5 shrink-0" />
                <h1 className="text-base sm:text-xl font-extrabold text-[var(--foreground)]">
                  Quy trình 08 bước, 10 biểu HD 07-HD/BTCTW &amp; phân công tại đơn vị
                </h1>
                <InfoTip title="Thành phần hồ sơ trình Phòng TCNS">
                  <p>1. Tệp dữ liệu đơn vị 23 trang tính (<code className="font-mono">[MÃ_ĐV]_K2526_v2_YYYYMMDD.xlsx</code>) gồm 10 biểu nghiệp vụ (A1–D2) đạt 6/6 chỉ tiêu tại <code className="font-mono">13. K_KiemTra</code>.</p>
                  <p>2. Tờ trình đề nghị thẩm định đề án vị trí việc làm trình ký qua E-Office.</p>
                </InfoTip>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/tai-ve/so-do-quy-trinh-vtvl-hcmute.png"
                  download="so-do-quy-trinh-vtvl-hcmute.png"
                  className="btn-touch inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--sheet)] hover:border-[var(--primary)] text-[var(--foreground)] text-xs sm:text-sm font-bold"
                >
                  <Download className="w-4 h-4 text-[var(--primary)]" />
                  <span>Tải Sơ đồ quy trình (.png)</span>
                </a>
                <Link href="/tao-tep?step=1" className="btn-touch inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-[var(--primary)] text-white text-xs sm:text-sm font-bold shadow-2xs">
                  <span>Bắt đầu Giai đoạn 1</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROLE_CARDS.map((card) => (
                <div key={card.role} className="surface-secondary rounded-xl p-4 space-y-2.5 border border-[var(--border-subtle)]">
                  <div className="flex items-start justify-between gap-1">
                    <h2 className="text-xs sm:text-sm font-extrabold text-[var(--foreground)] leading-snug">{card.role}</h2>
                    <InfoTip title="Nhiệm vụ chi tiết" align="right">
                      <ul className="list-disc pl-3.5 space-y-1">
                        {card.details.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    </InfoTip>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[var(--primary)] bg-[var(--sheet)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
                    {card.sheets}
                  </div>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{card.summary}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bộ tài liệu gốc Hướng dẫn số 07-HD/BTCTW & Biểu mẫu tải về */}
          <section className="surface-canvas rounded-2xl p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[var(--primary)]" />
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
                  Bộ tài liệu gốc kèm theo Hướng dẫn số 07-HD/BTCTW (Bộ Phụ lục I–VIII &amp; Cẩm nang)
                </h2>
              </div>
              <span className="text-xs font-semibold text-[var(--ink-muted)]">Nhấn để tải trực tiếp tệp gốc</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {HD07_OFFICIAL_DOCS.map((doc) => (
                <a
                  key={doc.code}
                  href={doc.href}
                  download
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] hover:border-[var(--primary)] p-3 flex items-center justify-between gap-2.5 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-tint)] text-[var(--primary)] mr-1.5">{doc.badge}</span>
                    <strong className="text-xs font-bold text-[var(--foreground)] block mt-1 leading-snug">{doc.title}</strong>
                  </div>
                  <Download className="w-4 h-4 text-[var(--primary)] shrink-0" />
                </a>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <section className="surface-canvas rounded-2xl p-5 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[var(--primary)]" />
                  <h2 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">
                    {checklistMode === '8buoc' ? 'Quy trình 08 bước & 10 biểu HD 07' : 'Thứ tự 12 bước nhập bảng Excel'}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setChecklistMode('8buoc')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1 ${checklistMode === '8buoc' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-secondary)] text-[var(--foreground)] border border-[var(--border-subtle)]'}`}
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>08 bước HD 07</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChecklistMode('12buoc')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${checklistMode === '12buoc' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-secondary)] text-[var(--foreground)] border border-[var(--border-subtle)]'}`}
                  >
                    <span>12 bước Excel</span>
                  </button>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--surface-tint)] text-[var(--primary)] tabular-nums">
                    {completedCount}/{totalSteps}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-secondary)] max-h-80 overflow-y-auto">
                {checklistMode === '8buoc'
                  ? HD07_EIGHT_STEPS_PROCESS.map((s) => {
                      const done = !!checkedSteps[s.step];
                      return (
                        <label
                          key={s.step}
                          onClick={() => toggleStep(s.step)}
                          className={`cursor-pointer px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs transition-colors ${
                            done ? 'bg-[var(--ok-soft)]/35' : 'bg-[var(--sheet)] hover:bg-[var(--surface-secondary)]'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <input type="checkbox" checked={done} onChange={() => {}} className="w-4 h-4 accent-[var(--primary)] mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold text-[var(--foreground)] block leading-snug">{s.title}</span>
                              <span className="text-[11px] font-mono font-bold text-[var(--primary)]">{s.sheets} · {s.appendix}</span>
                            </div>
                          </div>
                          <InfoTip title={s.title} align="right">
                            <p><strong>Kết quả:</strong> {s.result}</p>
                            <p className="mt-1"><strong>Điều kiện:</strong> {s.condition}</p>
                          </InfoTip>
                        </label>
                      );
                    })
                  : HD07_12_STEP_ORDER.map((s) => {
                      const done = !!checkedSteps[s.step];
                      return (
                        <label
                          key={s.step}
                          onClick={() => toggleStep(s.step)}
                          className={`cursor-pointer px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs transition-colors ${
                            done ? 'bg-[var(--ok-soft)]/35' : 'bg-[var(--sheet)] hover:bg-[var(--surface-secondary)]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input type="checkbox" checked={done} onChange={() => {}} className="w-4 h-4 accent-[var(--primary)]" />
                            <span className="font-bold text-[var(--foreground)] shrink-0">Bước {s.step}:</span>
                            <code className="font-mono font-bold text-[var(--primary)] truncate">{s.sheet}</code>
                          </div>
                          <InfoTip title={`Bước ${s.step}: ${s.sheet}`} align="right">
                            <p>{s.title}</p>
                          </InfoTip>
                        </label>
                      );
                    })}
              </div>
            </section>

            <section className="surface-canvas rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                <AlertTriangle className="w-4 h-4 text-[var(--fix)]" />
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--foreground)]">4 lưu ý quan trọng khi kiểm tra chéo</h2>
              </div>
              <div className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--sheet)] overflow-hidden">
                {COMMON_PITFALLS.map((err) => (
                  <div key={err.code} className="p-3.5 flex items-start justify-between gap-2 hover:bg-[var(--surface-secondary)] transition-colors">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-mono font-bold text-[var(--fix)] block">{err.code}</span>
                      <strong className="text-xs sm:text-sm text-[var(--foreground)] block">{err.title}</strong>
                    </div>
                    <InfoTip title="Cách khắc phục" align="right">
                      <p>{err.fix}</p>
                    </InfoTip>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
