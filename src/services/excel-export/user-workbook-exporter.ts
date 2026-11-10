'use client';

import * as XLSX from 'xlsx';
import { ExcelSheetKey, GenericGridRow } from '@/components/excel-grid/excel-grid-types';
import { EXCEL_SHEET_METAS } from '@/components/excel-grid/excel-sheet-metas';

export interface UserWorkbookExportOptions {
  unitCode: string;
  unitNameVi: string;
  reportingPeriod?: string;
  operatorEmail?: string;
  data: Record<ExcelSheetKey, GenericGridRow[]>;
}

export function exportUserWorkbookToExcel(opts: UserWorkbookExportOptions): string {
  const wb = XLSX.utils.book_new();
  const keys = Object.keys(EXCEL_SHEET_METAS) as ExcelSheetKey[];

  for (const key of keys) {
    const meta = EXCEL_SHEET_METAS[key];
    const rows = opts.data[key] || [];
    const sheetName = meta.sheetName.slice(0, 31); // Excel max sheet name is 31 chars

    // Xây dựng ma trận dữ liệu (AoA)
    const aoa: any[][] = [];

    // Tiêu đề báo cáo và thông tin đơn vị
    aoa.push(['TRƯỜNG ĐẠI HỌC CÔNG NGHỆ KỸ THUẬT TP.HCM (HCM-UTE)']);
    aoa.push([`ĐƠN VỊ: [${opts.unitCode}] ${opts.unitNameVi.toUpperCase()}`]);
    aoa.push([`${meta.title} - Kỳ báo cáo: ${opts.reportingPeriod || '2025–2026'}`]);
    aoa.push([`Người thực hiện: ${opts.operatorEmail || 'tcns@hcmute.edu.vn'} • Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`]);
    aoa.push([]); // dòng trống ngăn cách

    // Hàng tiêu đề cột
    const headers = meta.columns.map((c) => `${c.colLetter}. ${c.headerName}`);
    aoa.push(headers);

    // Các hàng dữ liệu người dùng
    for (const r of rows) {
      const rowData = meta.columns.map((c) => {
        const val = r[c.field];
        if (val === undefined || val === null) return '';
        if (c.type === 'number') {
          const num = Number(val);
          return isNaN(num) ? val : num;
        }
        return val;
      });
      aoa.push(rowData);
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Thiết lập độ rộng cột
    ws['!cols'] = meta.columns.map((c) => {
      const px = parseInt(c.width || '120', 10);
      return { wch: Math.max(12, Math.round(px / 8)) };
    });

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const compactDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileName = `VTVL_2026_${opts.unitCode}_${compactDate}.xlsx`;

  // Ghi tệp và kích hoạt tải xuống trên trình duyệt
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return fileName;
}

