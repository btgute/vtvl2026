'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckSquare,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { WorkflowSidebar, InfoTip } from '@/components/layout/MilestonesBar';
import { HD07_12_STEP_ORDER } from '@/configs/hcmute-hd07-catalog';

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
    summary: 'Khởi tạo tệp gốc v1 (Bước 1–2), kê khai nhân sự D1, tổng hợp phiếu khảo sát v2 (Bước 4) và thẩm định (Bước 5).',
    details: [
      'Khởi tạo bộ biểu gốc 21 trang tính (v1) và gói tệp nén (.zip) chứa phiếu khảo sát theo từng vị trí việc làm.',
      'Kê khai danh sách nhân sự hiện có của đơn vị chốt tại ngày 30/9/2026 trên biểu 9. D1_NhanLuc.',
      'Tổng hợp tự động các phiếu khảo sát (v1 → v2) và chạy kiểm tra chéo đạt 6/6 chỉ tiêu tại biểu 13. K_KiemTra.'
    ]
  },
  {
    role: '3. Trưởng bộ môn, Giảng viên, Nhân sự PTN và Chuyên viên chuyên trách',
    sheets: '3. B1_KhoiLuong · 4. B2_CT_TacDong · 7. C2_NangLuc',
    summary: 'Đo định mức thời gian (Bước 3), kê khai sản lượng năm học (Biểu B1) và công đoạn chuyển đổi số (Biểu B2_CT).',
    details: [
      'Thực hiện đo định mức thời gian xử lý công việc thực tế (Trung bình phút/sản phẩm) tại Bước 3 (/bam-gio).',
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
  const toggleStep = (step: number) => setCheckedSteps((prev) => ({ ...prev, [step]: !prev[step] }));
  const completedCount = Object.values(checkedSteps).filter(Boolean).length;

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-3">
          <WorkflowSidebar activeStep={1} />
        </div>

        <div className="lg:col-span-9 space-y-5">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-5 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-[var(--primary)] mr-2" />
                <h1 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
                  Phân công 3 nhóm vai trò &amp; hướng dẫn thực hiện tại đơn vị
                </h1>
                <InfoTip title="Thành phần hồ sơ trình Phòng TCNS">
                  <p>1. Tệp dữ liệu đơn vị 21 trang tính (<code className="font-mono">[MÃ_ĐV]_K2526_v2_YYYYMMDD.xlsx</code>) đạt 6/6 chỉ tiêu kiểm tra chéo.</p>
                  <p>2. Tờ trình đề nghị thẩm định đề án vị trí việc làm trình ký qua E-Office.</p>
                </InfoTip>
              </div>
              <Link href="/tao-tep?step=1" className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold">
                <span>Bắt đầu Bước 1</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ROLE_CARDS.map((card) => (
                <div key={card.role} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <h2 className="text-xs sm:text-sm font-extrabold text-[var(--foreground)] leading-snug">{card.role}</h2>
                    <InfoTip title="Nhiệm vụ chi tiết" align="right">
                      <ul className="list-disc pl-3.5 space-y-1">
                        {card.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </InfoTip>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[var(--primary)] bg-[var(--sheet)] px-2 py-1 rounded border border-[var(--border-subtle)]">
                    {card.sheets}
                  </div>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{card.summary}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[var(--primary)]" />
                  <h2 className="text-xs sm:text-sm font-extrabold text-[var(--foreground)]">
                    Checklist 12 bước nhập bảng Excel
                  </h2>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] tabular-nums">
                  {completedCount}/12 bước
                </span>
              </div>
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {HD07_12_STEP_ORDER.map((s) => {
                  const done = !!checkedSteps[s.step];
                  return (
                    <label
                      key={s.step}
                      onClick={() => toggleStep(s.step)}
                      className={`cursor-pointer rounded-xl border p-2.5 flex items-center justify-between gap-2 text-xs transition-colors ${
                        done ? 'border-[var(--ok)]/40 bg-[var(--ok-soft)]/30' : 'border-[var(--border-subtle)] bg-[var(--background)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input type="checkbox" checked={done} onChange={() => {}} className="accent-[var(--primary)]" />
                        <span className="font-bold text-[var(--foreground)] shrink-0">B{s.step}:</span>
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

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--sheet)] p-4 sm:p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-1.5 border-b border-[var(--border-subtle)] pb-2">
                <AlertTriangle className="w-4 h-4 text-[#ED1C24]" />
                <h2 className="text-xs sm:text-sm font-extrabold text-[var(--foreground)]">
                  4 lưu ý quan trọng khi kiểm tra chéo
                </h2>
              </div>
              <div className="space-y-2">
                {COMMON_PITFALLS.map((err) => (
                  <div key={err.code} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] p-3 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-[#ED1C24] block">{err.code}</span>
                      <strong className="text-xs text-[var(--foreground)]">{err.title}</strong>
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
