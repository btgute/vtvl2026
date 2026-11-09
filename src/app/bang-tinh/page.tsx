'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ExcelWorkbookViewer } from '@/components/excel-grid/ExcelWorkbookViewer';
import { FileSpreadsheet, ArrowLeft, BookOpenCheck } from 'lucide-react';

function BangTinhContent() {
  const searchParams = useSearchParams();
  const unitParam = searchParams.get('unit') || 'TCNS';

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-10 py-5 space-y-4">
      {/* Header breadcrumb & title */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#cbd5e1] shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#004776]/10 text-[#004776]">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Giao diện bảng tính Excel 15 sheet</span>
            </span>
            <span className="text-xs text-[#64748b]">|</span>
            <span className="text-xs text-[#64748b]">Theo chuẩn Hướng dẫn số 07-HD/BTCTW</span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#004776]">
            Hệ thống Bảng tính Vị trí việc làm trực quan — HCM-UTE
          </h1>
          <p className="text-xs text-[#64748b]">
            Thao tác trực tiếp trên 15 sheet nghiệp vụ: Chọn đơn vị → 6. C1_VTVL → 1. A1_NhiemVu → 2. A2_CongViec → 11. DM_SAN_PHAM → 3. B1_KhoiLuong → 4. B2_CT → 5. B2 → 7. C2 → 9. D1 → 8. C3 → DU_BAO → 10. D2 → 13. K_KiemTra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/tao-tep"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#004776] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trình hướng dẫn từng chặng</span>
          </Link>
          <Link
            href="/huong-dan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#004776] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-lg transition-colors cursor-pointer"
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>Phụ lục hướng dẫn</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Excel Workbook */}
      <ExcelWorkbookViewer initialUnitCode={unitParam} />
    </div>
  );
}

export default function BangTinhPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[#004776]">Đang tải bảng tính Excel...</div>}>
      <BangTinhContent />
    </Suspense>
  );
}
