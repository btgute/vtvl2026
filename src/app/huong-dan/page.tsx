'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { MilestonesBar } from '@/components/layout/MilestonesBar';
import { HD07_12_STEP_ORDER } from '@/configs/hcmute-hd07-catalog';

const ROLE_CARDS = [
  {
    role: '1. Thủ trưởng đơn vị (Trưởng khoa, Viện trưởng, Trưởng phòng, Giám đốc trung tâm)',
    sheets: 'Biểu phụ trách: 1. A1_NhiemVu · 6. C1_VTVL · 8. C3_NhuCau · 10. D2_PhuongAn',
    tasks: [
      'Phê duyệt danh mục nhiệm vụ (Biểu A1) và danh mục vị trí việc làm gắn bậc nghề nghiệp (Bậc 1–5) theo Nghị định số 232/2026/NĐ-CP (Biểu C1, C2).',
      'Rà soát điều kiện chuyển tiếp đối với viên chức giữ chức danh Trợ giảng (V.07.01.23) bổ nhiệm trước ngày 31/3/2026 theo khoản 5 Điều 15 Thông tư số 31/2026/TT-BGDĐT.',
      'Thống nhất nhu cầu nhân lực năm cơ sở (Biểu C3), phương án biên chế giai đoạn 2027–2031 (Biểu D2) và ký Tờ trình đề nghị thẩm định gửi Phòng Tổ chức - Nhân sự.'
    ]
  },
  {
    role: '2. Tổ thư ký đơn vị (Giáo vụ khoa, Chuyên viên hành chính – tổng hợp)',
    sheets: 'Biểu phụ trách: 2. A2_CongViec · 9. D1_NhanLuc · 13. K_KiemTra · 15. S_NhatKy',
    tasks: [
      'Khởi tạo bộ biểu gốc 21 trang tính (phiên bản v1) và gói tệp nén (.zip) chứa phiếu khảo sát theo từng vị trí việc làm tại phân hệ Tạo và gộp tệp.',
      'Kê khai danh sách nhân sự hiện có của đơn vị chốt tại thời điểm ngày 30/9/2026 trên biểu 9. D1_NhanLuc (đảm bảo mỗi viên chức chỉ kê khai một dòng duy nhất).',
      'Tiếp nhận các phiếu khảo sát đã hoàn thành, thực hiện tổng hợp tự động để xuất tệp phiên bản v2 và kiểm tra chéo tại phân hệ Thẩm định biểu.'
    ]
  },
  {
    role: '3. Trưởng bộ môn, Giảng viên, Kỹ sư phòng thí nghiệm và Chuyên viên chuyên trách',
    sheets: 'Biểu phụ trách: 3. B1_KhoiLuong · 4. B2_CT_TacDong · 7. C2_NangLuc',
    tasks: [
      'Thực hiện đo định mức thời gian xử lý công việc thực tế (Trung bình phút/sản phẩm) tại phân hệ Đo định mức.',
      'Kê khai sản lượng thực tế phát sinh trong kỳ thống kê 01/10/2025–30/9/2026 (Cột C biểu B1), ghi rõ nguồn văn bản xác thực (Cột H, Cột I) và nội dung giải trình nếu định mức lệch quá 30% so với chuẩn (Cột S).',
      'Kê khai chi tiết các công đoạn nghiệp vụ đã ứng dụng chuyển đổi số (UTEx LMS, E-Office...) tại biểu 4. B2_CT_TacDong.'
    ]
  }
];

const FIVE_PHASES = [
  {
    phase: 'Bước 1 (Chuẩn bị số liệu)',
    title: 'Rà soát danh sách nhân sự chốt tại ngày 30/9/2026 và thống kê sản lượng năm học',
    detail: 'Đơn vị lập danh sách viên chức, người lao động hiện có chốt tại ngày 30/9/2026 theo đúng mã số chức danh quy định tại Thông tư số 31/2026/TT-BGDĐT (Giảng viên cao cấp V.07.01.01 - Bậc 5; Giảng viên chính V.07.01.02 - Bậc 4; Giảng viên V.07.01.03 - từ Bậc 3; Viên chức thiết bị, thí nghiệm V.05.02.07 - Bậc 2–3; Chuyên viên 01.003 - Bậc 2–4) và tập hợp số liệu sản phẩm đầu ra kỳ 01/10/2025–30/9/2026.',
    actionHref: '/tao-tep',
    actionLabel: 'Tra cứu danh mục chuẩn'
  },
  {
    phase: 'Bước 2 (Khởi tạo hồ sơ)',
    title: 'Khởi tạo tệp đơn vị gốc (21 trang tính) và phân phối gói phiếu khảo sát (.zip)',
    detail: 'Tổ thư ký truy cập phân hệ Tạo và gộp tệp (/tao-tep), lựa chọn nhóm đơn vị, tên đơn vị (ví dụ: [FME] Khoa Cơ khí Chế tạo máy), kê khai số lượng nhân sự tại Biểu D1 và thực hiện tách bộ biểu gốc v1 (.xlsx) kèm gói tệp nén (.zip) phân phối cho từng vị trí việc làm.',
    actionHref: '/tao-tep',
    actionLabel: 'Mở Bước 1–2: Tạo tệp'
  },
  {
    phase: 'Bước 3 (Khảo sát định mức)',
    title: 'Đo định mức thời gian thực hiện (phút/sản phẩm) và kê khai biểu B1, B2_CT',
    detail: 'Các bộ môn, phòng thí nghiệm và viên chức chuyên trách truy cập phân hệ Đo định mức (/bam-gio) để ghi nhận thời gian thực hiện sản phẩm chuẩn (Nhóm I–VI) hoặc điền trực tiếp vào phiếu khảo sát được phân phối: cập nhật Số sản phẩm/năm (Cột C), Trung bình phút/sản phẩm (Cột D), Nguồn số liệu (Cột H, I) và Giải trình (Cột S).',
    actionHref: '/bam-gio',
    actionLabel: 'Mở Bước 3: Đo định mức'
  },
  {
    phase: 'Bước 4 (Tổng hợp dữ liệu)',
    title: 'Tích hợp các phiếu khảo sát vào tệp đơn vị (v1 → v2) và kết xuất dự thảo Tờ trình',
    detail: 'Tổ thư ký truy cập mục Tổng hợp phiếu (/tao-tep#buoc-4), chọn tệp đơn vị gốc v1 và các phiếu khảo sát đã thu thập. Hệ thống tự động đối chiếu số liệu, tính toán lại tổng giờ công việc, xác định nhu cầu nhân lực theo phương pháp PP1/PP2, ghi nhận lịch sử vào biểu 15. S_NhatKy và kết xuất dự thảo Tờ trình.',
    actionHref: '/tao-tep#buoc-4',
    actionLabel: 'Mở Bước 4: Tổng hợp phiếu'
  },
  {
    phase: 'Bước 5 (Thẩm định & trình ký)',
    title: 'Kiểm tra chéo 6 chỉ tiêu tại biểu K_KiemTra và trình ký hồ sơ gửi Phòng Tổ chức - Nhân sự',
    detail: 'Đơn vị tải tệp phiên bản v2 (.xlsx) lên phân hệ Thẩm định biểu (/ra-soat) để kiểm tra tự động 6 chỉ tiêu đối soát chéo (A2↔A1, B1↔C1, Cột R biểu B1, B2_CT↔B1, D1↔C1, C3↔D2). Sau khi khắc phục toàn bộ các hạng mục yêu cầu chỉnh sửa bắt buộc, Thủ trưởng đơn vị ký Tờ trình gửi Phòng Tổ chức - Nhân sự.',
    actionHref: '/ra-soat',
    actionLabel: 'Mở Bước 5: Thẩm định biểu'
  }
];

const COMMON_PITFALLS = [
  { code: 'Lưu ý 1 (Biểu B1 - Cột H, I)', title: 'Chưa cập nhật nguồn văn bản xác thực sản lượng và thời gian thực hiện', fix: 'Thay thế nội dung gợi ý mẫu bằng tên văn bản, báo cáo hoặc hệ thống quản trị thực tế của đơn vị (ví dụ: Kế hoạch giảng dạy năm học 2025–2026, Hệ thống E-Office, Biên bản đo định mức ngày 07/11/2026).' },
  { code: 'Lưu ý 2 (Biểu B1 - Cột S)', title: 'Thời gian thực tế chênh lệch trên 30% so với định mức chuẩn nhưng chưa thuyết minh', fix: 'Trường hợp Trung bình phút/sản phẩm (Cột D) cao hoặc thấp hơn trên 30% so với định mức chuẩn tại biểu 11. DM_SAN_PHAM, đơn vị phải ghi rõ nguyên nhân đặc thù tại Cột S biểu 3. B1_KhoiLuong.' },
  { code: 'Lưu ý 3 (Biểu A2 - Cột H)', title: 'Dẫn chiếu văn bản quy phạm pháp luật đã hết hiệu lực thi hành', fix: 'Theo khoản 2 Điều 17 Thông tư số 31/2026/TT-BGDĐT, các Điều 2, 8, 9, 10 của Thông tư số 40/2020/TT-BGDĐT đã hết hiệu lực từ ngày 14/4/2026. Đơn vị thống nhất dẫn chiếu Nghị định số 232/2026/NĐ-CP và Thông tư số 31/2026/TT-BGDĐT.' },
  { code: 'Lưu ý 4 (Biểu C2 - Cột D)', title: 'Khung năng lực chuyên môn chưa kê khai bậc nghề nghiệp (Bậc 1 đến Bậc 5)', fix: 'Thực hiện kê khai đầy đủ bậc nghề nghiệp theo Phụ lục II, Phụ lục III Nghị định số 232/2026/NĐ-CP tại Cột D biểu 7. C2_NangLuc (ví dụ: Bậc 5 đối với Giảng viên cao cấp; Bậc 4 đối với Giảng viên chính; từ Bậc 3 đối với Giảng viên).' },
  { code: 'Lưu ý 5 (Biểu D1 - Cột A, E, F)', title: 'Kê khai trùng mã nguồn lực hoặc tổng giờ phân bổ vượt quỹ giờ chuẩn năm', fix: 'Mỗi viên chức chốt tại thời điểm ngày 30/9/2026 chỉ kê khai một dòng duy nhất tại biểu 9. D1_NhanLuc; tổng số giờ thực hiện vị trí việc làm và giờ công tác kiêm nhiệm không vượt quá quỹ giờ chuẩn (1.904 giờ hoặc 1.760 giờ/năm).' },
  { code: 'Lưu ý 6 (Biểu C1 & D1)', title: 'Chưa rà soát phương án chuyển tiếp đối với chức danh Trợ giảng (V.07.01.23)', fix: 'Thực hiện rà soát theo khoản 5 Điều 15 Thông tư số 31/2026/TT-BGDĐT đối với viên chức giữ chức danh Trợ giảng bổ nhiệm trước ngày 31/3/2026 hoặc tuyển dụng theo đề án phê duyệt trước ngày 30/6/2026.' }
];

export default function HuongDanDonViPage() {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const toggleStep = (step: number) => setCheckedSteps((prev) => ({ ...prev, [step]: !prev[step] }));
  const completedCount = Object.values(checkedSteps).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-7 space-y-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              TÀI LIỆU HƯỚNG DẪN NGHIỆP VỤ DÀNH CHO KHOA, VIỆN, PHÒNG, BAN, TRUNG TÂM — HCM-UTE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
              Quy trình tổ chức rà soát và lập đề án vị trí việc làm tại đơn vị
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-3xl leading-relaxed">
              Hướng dẫn trình tự phối hợp nội bộ, khởi tạo bộ biểu 21 trang tính, khảo sát định mức thời gian, tổng hợp dữ liệu và thẩm định chéo 6 chỉ tiêu tại biểu <code className="font-mono">13. K_KiemTra</code> trước khi trình ký nộp về <strong>Phòng Tổ chức - Nhân sự (TCNS)</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href="/tao-tep" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-2xs hover:opacity-95">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Thực hiện Bước 1: Tạo tệp đơn vị</span>
            </Link>
            <Link href="/ra-soat" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-xs font-bold hover:border-[var(--primary)]">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
              <span>Thực hiện Bước 5: Thẩm định biểu</span>
            </Link>
          </div>
        </div>
        <MilestonesBar />
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
              I. Phân công trách nhiệm thực hiện trong nội bộ đơn vị
            </h2>
          </div>
          <span className="text-xs font-semibold text-[var(--ink-muted)]">Mô hình phối hợp 3 nhóm vai trò tại đơn vị</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {ROLE_CARDS.map((card) => (
            <div key={card.role} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-2.5">
              <h3 className="text-sm font-extrabold text-[var(--foreground)] leading-snug">{card.role}</h3>
              <div className="text-[11px] font-mono font-bold text-[var(--primary)] bg-[var(--sheet)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
                {card.sheets}
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--ink-muted)] list-disc pl-4 leading-relaxed">
                {card.tasks.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
          <Layers className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
            II. Trình tự 5 bước tổ chức thực hiện tại đơn vị
          </h2>
        </div>

        <div className="space-y-3">
          {FIVE_PHASES.map((p) => (
            <div key={p.phase} className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 grid grid-cols-1 lg:grid-cols-[175px_1fr_auto] gap-4 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#004776] text-white">
                  {p.phase}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">{p.title}</h3>
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{p.detail}</p>
              </div>
              <div className="shrink-0">
                <Link href={p.actionHref} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[var(--sheet)] hover:border-[var(--primary)] border border-[var(--border)] text-xs font-bold text-[var(--primary)]">
                  <span>{p.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
                III. Danh mục kiểm tra 12 bước nhập liệu theo liên kết công thức
              </h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] tabular-nums">
              Tiến độ: {completedCount}/12 bước
            </span>
          </div>
          <p className="text-xs text-[var(--ink-muted)]">
            Các trang tính trong tệp dữ liệu đơn vị liên kết công thức tuần tự từ Bước 1 đến Bước 12. Tổ thư ký đơn vị đánh dấu kiểm tra từng bước trước khi thực hiện thẩm định chéo:
          </p>
          <div className="space-y-2">
            {HD07_12_STEP_ORDER.map((s) => {
              const done = !!checkedSteps[s.step];
              return (
                <label
                  key={s.step}
                  onClick={() => toggleStep(s.step)}
                  className={`cursor-pointer rounded-xl border p-3 flex items-start gap-3 transition-colors ${
                    done ? 'border-[var(--ok)]/40 bg-[var(--ok-soft)]/30' : 'border-[var(--border-subtle)] bg-[var(--background)] hover:border-[var(--primary)]/40'
                  }`}
                >
                  <input type="checkbox" checked={done} onChange={() => {}} className="mt-1 accent-[var(--primary)]" />
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--foreground)]">Bước {s.step}:</span>
                      <code className="font-mono font-bold text-[var(--primary)]">{s.sheet}</code>
                    </div>
                    <p className="text-[var(--ink-muted)]">{s.title}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-5 rounded-3xl border border-[var(--border)] bg-[var(--sheet)] p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <AlertTriangle className="w-5 h-5 text-[#ED1C24]" />
            <h2 className="text-base sm:text-lg font-extrabold text-[var(--foreground)]">
              IV. Lưu ý nghiệp vụ và thành phần hồ sơ trình thẩm định
            </h2>
          </div>
          <div className="space-y-2.5">
            {COMMON_PITFALLS.map((err) => (
              <div key={err.code} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] p-3.5 space-y-1">
                <span className="text-[11px] font-mono font-bold text-[#ED1C24]">{err.code}</span>
                <h3 className="text-xs font-extrabold text-[var(--foreground)]">{err.title}</h3>
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                  <strong>Hướng dẫn thực hiện:</strong> {err.fix}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/[0.05] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
              <strong className="text-xs sm:text-sm text-[var(--foreground)]">Thành phần hồ sơ gửi Phòng Tổ chức - Nhân sự:</strong>
            </div>
            <ol className="list-decimal pl-4 text-xs text-[var(--ink-muted)] space-y-1">
              <li>Tệp dữ liệu đơn vị 21 trang tính đã tổng hợp phiếu khảo sát (<code className="font-mono">[MÃ_ĐV]_K2526_v2_YYYYMMDD.xlsx</code>) đạt 6/6 chỉ tiêu kiểm tra chéo.</li>
              <li><strong>Tờ trình đề nghị thẩm định đề án vị trí việc làm</strong> và phương án biên chế giai đoạn <code className="font-mono">2027–2031</code> trình ký qua hệ thống E-Office.</li>
              <li>Hồ sơ minh chứng khảo sát (các phiếu khảo sát B1, B2_CT và nhật ký đo định mức thời gian) lưu trữ tại đơn vị để phục vụ công tác thẩm định.</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
