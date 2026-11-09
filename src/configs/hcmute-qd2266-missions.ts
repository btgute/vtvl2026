/**
 * src/configs/hcmute-qd2266-missions.ts
 * Bóc tách và quản lý Danh mục Nhiệm vụ (Biểu 1. A1_NhiemVu) từ Quyết định số 2266/QĐ-ĐHCNKT
 * ngày 23/6/2026 cho 28 đơn vị và toàn bộ 51 đơn vị thuộc HCM-UTE.
 */

import qd2266DataRaw from './hcmute-qd2266-missions.json';
import { GenericGridRow } from '@/components/excel-grid/excel-grid-types';
import { HCMUTE_UNITS } from './hcmute-units';

export interface Qd2266MissionRecord {
  maNhiemVu: string;
  tenNhiemVu: string;
  coQuan: string;
  canCu: string;
  ky: string;
  trangThai: string;
  nguon: string;
  plNum?: number;
  secNum?: string;
  bulletNum?: number;
}

export interface Qd2266UnitRecord {
  plNum: number;
  unitCode: string;
  unitName: string;
  missions: Qd2266MissionRecord[];
}

export const QD2266_UNITS_DATA = qd2266DataRaw as Record<string, Qd2266UnitRecord>;

/**
 * Danh mục chuẩn 28 Phụ lục theo QĐ 2266/QĐ-ĐHCNKT
 */
export const QD2266_28_UNITS_CATALOG: { plNum: number; code: string; nameVi: string }[] = [
  { plNum: 1, code: 'KHOA', nameVi: 'Các Khoa, Viện đào tạo' },
  { plNum: 2, code: 'KDTTT', nameVi: 'Khoa Đào tạo tiên tiến' },
  { plNum: 3, code: 'TTGDTC', nameVi: 'Trung tâm Giáo dục thể chất' },
  { plNum: 4, code: 'TTGDQPAN', nameVi: 'Trung tâm Giáo dục Quốc phòng và An ninh' },
  { plNum: 5, code: 'BANTT', nameVi: 'Ban An ninh trật tự' },
  { plNum: 6, code: 'BQLKTX', nameVi: 'Ban Quản lý ký túc xá' },
  { plNum: 7, code: 'PCTSV', nameVi: 'Phòng Công tác sinh viên' },
  { plNum: 8, code: 'PDT', nameVi: 'Phòng Đào tạo' },
  { plNum: 9, code: 'PHCTH', nameVi: 'Phòng Hành chính - Tổng hợp' },
  { plNum: 10, code: 'PKTDBCL', nameVi: 'Phòng Khảo thí và Đảm bảo chất lượng' },
  { plNum: 11, code: 'PKHTC', nameVi: 'Phòng Kế hoạch - Tài chính' },
  { plNum: 12, code: 'PKHCN', nameVi: 'Phòng Khoa học Công nghệ' },
  { plNum: 13, code: 'PQLDTXDDT', nameVi: 'Phòng Quản lý đầu tư xây dựng và Đấu thầu' },
  { plNum: 14, code: 'PQHQT', nameVi: 'Phòng Quan hệ Quốc tế' },
  { plNum: 15, code: 'PQHDN', nameVi: 'Phòng Quan hệ Doanh nghiệp' },
  { plNum: 16, code: 'PQTTH&TT', nameVi: 'Phòng Quản trị thương hiệu và Truyền thông' },
  { plNum: 17, code: 'PQTCSVC', nameVi: 'Phòng Quản trị cơ sở vật chất' },
  { plNum: 18, code: 'TCNS', nameVi: 'Phòng Tổ chức - Nhân sự' },
  { plNum: 19, code: 'TYT', nameVi: 'Trạm Y tế' },
  { plNum: 20, code: 'TCKHGDKT', nameVi: 'Tạp chí Khoa học Giáo dục Kỹ thuật' },
  { plNum: 21, code: 'TTCNPM', nameVi: 'Trung tâm Công nghệ phần mềm' },
  { plNum: 22, code: 'TTHLDHS', nameVi: 'Trung tâm Học liệu và Dạy học số' },
  { plNum: 23, code: 'TTSTKN&CGCN', nameVi: 'Trung tâm Sáng tạo khởi nghiệp và Chuyển giao công nghệ' },
  { plNum: 24, code: 'TTTTMT', nameVi: 'Trung tâm Thông tin - Máy tính' },
  { plNum: 25, code: 'VDTQT', nameVi: 'Viện Đào tạo quốc tế' },
  { plNum: 26, code: 'VSDH', nameVi: 'Viện Sau đại học' },
  { plNum: 27, code: 'VPDU', nameVi: 'Văn phòng Đảng ủy' },
  { plNum: 28, code: 'PHBP', nameVi: 'Phân hiệu tại Bình Phước' }
];

/**
 * Bảng ánh xạ mã đơn vị trong HCMUTE_UNITS (cả mã tiếng Anh và viết tắt khác) sang mã 28 Phụ lục QĐ 2266
 */
export const UNIT_ALIAS_TO_QD2266: Record<string, string> = {
  // Phòng ban chức năng
  AAO: 'PDT', PDT: 'PDT',
  BMC: 'PQTTH&TT', 'PQTTH&TT': 'PQTTH&TT',
  TCNS: 'TCNS',
  OIA: 'PQHQT', PQHQT: 'PQHQT',
  ERO: 'PQHDN', PQHDN: 'PQHDN',
  FPO: 'PKHTC', PKHTC: 'PKHTC',
  STIAO: 'PKHCN', PKHCN: 'PKHCN',
  OGA: 'PHCTH', PHCTH: 'PHCTH',
  SAO: 'PCTSV', PCTSV: 'PCTSV',
  QAO: 'PKTDBCL', PKTDBCL: 'PKTDBCL',
  EMO: 'PQTCSVC', PQTCSVC: 'PQTCSVC',
  CPM: 'PQLDTXDDT', PQLDTXDDT: 'PQLDTXDDT',
  KTX: 'BQLKTX', BQLKTX: 'BQLKTX',
  TYT: 'TYT',
  // Trung tâm & Phân hiệu
  PHBP: 'PHBP',
  HLDHS: 'TTHLDHS', TTHLDHS: 'TTHLDHS',
  CISAT: 'TTSTKN&CGCN', 'TTSTKN&CGCN': 'TTSTKN&CGCN',
  INC: 'TTTTMT', TTTTMT: 'TTTTMT',
  STC: 'TTCNPM', TTCNPM: 'TTCNPM', ITC: 'TTCNPM',
  GDQPAN: 'TTGDQPAN', TTGDQPAN: 'TTGDQPAN',
  GDTC: 'TTGDTC', TTGDTC: 'TTGDTC',
  TCKHGDKT: 'TCKHGDKT',
  BANTT: 'BANTT',
  VPDU: 'VPDU',
  // Viện & Khoa đặc thù
  IIE: 'VDTQT', VDTQT: 'VDTQT',
  SDH: 'VSDH', VSDH: 'VSDH',
  FAE: 'KDTTT', KDTTT: 'KDTTT',
  // Khối Khoa chung (PL1)
  FME: 'KHOA', FEET: 'KHOA', FEEE: 'KHOA', FIT: 'KHOA', FCFT: 'KHOA',
  FCE: 'KHOA', FE: 'KHOA', FGAM: 'KHOA', FPI: 'KHOA', FAS: 'KHOA',
  FFL: 'KHOA', ITE: 'KHOA', TPC: 'KHOA', KHOA: 'KHOA'
};

/**
 * Lấy danh sách nhiệm vụ gốc chuẩn A1 cho bất kỳ đơn vị nào thuộc HCM-UTE
 */
export function getQd2266A1RowsForUnit(unitCode: string, unitNameVi?: string): GenericGridRow[] {
  const normCode = unitCode.toUpperCase().trim();
  const targetPlKey = UNIT_ALIAS_TO_QD2266[normCode] || 'KHOA';
  const unitRecord = QD2266_UNITS_DATA[targetPlKey] || QD2266_UNITS_DATA['KHOA'];
  
  if (!unitRecord) return [];

  const actualUnitDef = HCMUTE_UNITS.find((u) => u.code.toUpperCase() === normCode);
  const agencyName = unitNameVi || actualUnitDef?.nameVi || unitRecord.unitName;

  // Với TCNS: Sử dụng 39 nhiệm vụ chuẩn từ Excel
  if (normCode === 'TCNS' || targetPlKey === 'TCNS') {
    return unitRecord.missions.map((m, idx) => ({
      id: `a1-${idx + 1}`,
      maNhiemVu: m.maNhiemVu,
      tenNhiemVu: m.tenNhiemVu,
      coQuan: 'Phòng Tổ chức - Nhân sự',
      canCu: m.canCu,
      ky: '01/10/2025–30/9/2026',
      trangThai: m.trangThai || 'Tiếp tục thực hiện',
      nguon: m.nguon
    }));
  }

  // Với các đơn vị khác: Format đúng mã [MÃ_ĐV].NV<XX> và tên cơ quan
  return unitRecord.missions.map((m, idx) => {
    const seq = String(idx + 1).padStart(2, '0');
    const taskCode = `${normCode}.NV${seq}`;
    return {
      id: `a1-${idx + 1}`,
      maNhiemVu: taskCode,
      tenNhiemVu: m.tenNhiemVu,
      coQuan: agencyName,
      canCu: m.canCu,
      ky: '01/10/2025–30/9/2026',
      trangThai: 'Tiếp tục thực hiện',
      nguon: m.nguon
    };
  });
}
