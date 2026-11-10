'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ExcelWorkbookViewer } from '@/components/excel-grid/ExcelWorkbookViewer';

function BangTinhContent() {
  const searchParams = useSearchParams();
  const unitParam = searchParams.get('unit') || 'TCNS';

  return (
    <div className="w-full max-w-none min-w-0 overflow-hidden px-3 sm:px-5 lg:px-6 py-3 sm:py-4">
      <ExcelWorkbookViewer initialUnitCode={unitParam} />
    </div>
  );
}

export default function BangTinhPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#004776]">Đang tải bảng tính Excel...</div>}>
      <BangTinhContent />
    </Suspense>
  );
}
