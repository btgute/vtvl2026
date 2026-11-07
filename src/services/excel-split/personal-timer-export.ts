import * as XLSX from 'xlsx';
import { HD07_CONSTANTS, STANDARD_PRODUCTS_CATALOG } from '@/configs/hcmute-hd07-catalog';
import { HcmuteUnit, JobTaskTemplate, TimeSessionRow } from '@/types/vtvl';

export function exportPersonalTimerWorkbook(
  unit: HcmuteUnit,
  selectedVtvlSuffix: string,
  performerTitle: string,
  tasksForPosition: (JobTaskTemplate & { fullVtvlCode: string; fullTaskCode: string })[],
  sessions: TimeSessionRow[],
  manualDate: string
): string {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 3. B1_KhoiLuong (Đúng 19 cột A–S chuẩn 03. Bo bieu VTVL 25-10-2026.xlsx)
  const b1Header = [
    'Mã công việc',
    'Mã VTVL',
    'Số SP/năm',
    'Trung bình phút/SP (đo thực tế)',
    'Giờ bổ sung (công việc liên quan)',
    'Giờ SP (tính)',
    'Giờ tổng (tính)',
    'Nguồn SL',
    'Nguồn thời gian',
    'Trạng thái căn cứ thời gian',
    'Kỳ',
    'Mã SP trong danh mục',
    'Nhóm (tự tra)',
    'Phút/SP chuẩn (tự tra)',
    'Xác nhận chuẩn (tự tra)',
    'Phút/SP dùng để tính',
    'Nguồn thời gian dùng tính',
    'Cảnh báo dữ liệu',
    'Giải trình khác chuẩn'
  ];

  const b1Rows = tasksForPosition.map((t) => {
    const taskSessions = sessions.filter((s) => s.taskCode === t.fullTaskCode);
    const avgMeasured =
      taskSessions.length > 0
        ? Number(
            (
              taskSessions.reduce((acc, s) => acc + s.minutesPerProduct, 0) /
              taskSessions.length
            ).toFixed(1)
          )
        : t.defaultMinutesPerProduct;
    const stdSp = STANDARD_PRODUCTS_CATALOG.find((sp) => sp.productCode === t.productCode);
    const stdMin = stdSp ? stdSp.standardMinutes : t.defaultMinutesPerProduct;
    const spHours = Number(((t.defaultQtyPerYear * avgMeasured) / 60).toFixed(1));
    const totalHours = Number((spHours + t.extraRelatedHoursYear).toFixed(1));

    return [
      t.fullTaskCode,
      t.fullVtvlCode,
      t.defaultQtyPerYear,
      avgMeasured,
      t.extraRelatedHoursYear,
      spHours,
      totalHours,
      t.sourceHint,
      taskSessions.length > 0
        ? `Phiếu đo bấm giờ thực tế (${taskSessions.length} phiên đo — ${performerTitle})`
        : 'Định mức chuẩn gợi ý',
      t.timeBasisStatus,
      HD07_CONSTANTS.STATISTICAL_PERIOD,
      t.productCode,
      t.romanGroup,
      stdMin,
      'Đã xác nhận',
      avgMeasured,
      taskSessions.length > 0 ? 'Đo thực tế tại đơn vị' : 'Theo danh mục SP chuẩn',
      'ĐẠT',
      taskSessions.length > 0 ? `Đã đo thực tế bởi ${performerTitle}` : ''
    ];
  });

  const wsB1 = XLSX.utils.aoa_to_sheet([
    [`PHIẾU KHẢO SÁT KHỐI LƯỢNG B1 CÁ NHÂN (CHUẨN HD 07-HD/BTCTW) — ${unit.nameVi.toUpperCase()} (${unit.code})`],
    b1Header,
    ...b1Rows
  ]);
  XLSX.utils.book_append_sheet(wb, wsB1, '3. B1_KhoiLuong');

  // Sheet 2: Phien_Do (Nhật ký phiên bấm giờ chi tiết)
  const wsDo = XLSX.utils.aoa_to_sheet([
    ['NHẬT KÝ CÁC PHIÊN BẤM GIỜ ĐO THỰC TẾ TẠI ĐƠN VỊ'],
    [
      'Mã công việc',
      'Lần đo',
      'Ngày',
      'Giờ bắt đầu (hh:mm)',
      'Giờ kết thúc (hh:mm)',
      'Tổng phút',
      'Số sản phẩm làm được',
      'Phút/SP',
      'Người đo (chức danh)'
    ],
    ...sessions.map((s) => [
      s.taskCode,
      s.runNumber,
      s.date,
      s.startTime,
      s.endTime,
      s.durationMinutes,
      s.productCount,
      s.minutesPerProduct,
      s.performerTitle
    ])
  ]);
  XLSX.utils.book_append_sheet(wb, wsDo, 'Phien_Do');

  const fileName = `PhieuBamGio_${unit.code}_${selectedVtvlSuffix}_${manualDate.replace(/-/g, '')}.xlsx`;
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);

  return fileName;
}

