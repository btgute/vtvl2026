'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExcelWorkbookViewer } from '@/components/excel-grid/ExcelWorkbookViewer';

function BangTinhContent() {
  const searchParams = useSearchParams();
  const unitParam = searchParams.get('unit') || 'TCNS';

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden px-3 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4">
      {/* Main Interactive Excel Workbook with Integrated Compact Workspace Header */}
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
