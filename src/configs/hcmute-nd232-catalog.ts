import { HcmuteVtvlGroup4 } from '@/types/vtvl';

export interface Nd232PositionCatalogItem {
  maDanhMucNd232: string; // PK: HD1907-I-01 .. HD1907-IV-04
  ttToanTruong: number;   // TT toàn trường tại Phụ lục I (1907/HD-ĐHCNKT)
  ttTrongNhom: number;    // TT trong nhóm I, II, III, IV
  appendix: 'I. Quản lý' | 'II. Chuyên môn, nghiệp vụ' | 'III. Hỗ trợ' | 'IV. Phục vụ';
  vtvlGroup4: HcmuteVtvlGroup4;
  groupLabel: string;
  positionName: string;   // Tên khung vị trí việc làm của Trường (Cột 3 Phụ lục I)
  careerLevel: string;    // Giới hạn Bậc nghề nghiệp sử dụng (Cột 4 Phụ lục I)
  allowedLevels: string[]; // Danh sách bậc được phép chọn trong giới hạn
  namingFormulaRule: string; // Quy tắc đặt Tên VTVL cụ thể tại đơn vị (Mục II.5)
  maChucDanhTt31: string;
  linkedCodeHint: string;
  hcmuteUnitsHint: string;
}

const m = (
  maDanhMucNd232: string,
  ttToanTruong: number,
  ttTrongNhom: number,
  appendix: Nd232PositionCatalogItem['appendix'],
  vtvlGroup4: HcmuteVtvlGroup4,
  positionName: string,
  careerLevel: string,
  allowedLevels: string[],
  namingFormulaRule: string,
  maChucDanhTt31: string,
  linkedCodeHint: string,
  hcmuteUnitsHint: string
): Nd232PositionCatalogItem => ({
  maDanhMucNd232,
  ttToanTruong,
  ttTrongNhom,
  appendix,
  vtvlGroup4,
  groupLabel: vtvlGroup4,
  positionName,
  careerLevel,
  allowedLevels,
  namingFormulaRule,
  maChucDanhTt31,
  linkedCodeHint,
  hcmuteUnitsHint
});

const G1: HcmuteVtvlGroup4 = 'I. Nhóm VTVL Quản lý';
const G2: HcmuteVtvlGroup4 = 'II. Nhóm VTVL Chuyên môn, nghiệp vụ';
const G3: HcmuteVtvlGroup4 = 'III. Nhóm VTVL Hỗ trợ';
const G4: HcmuteVtvlGroup4 = 'IV. Nhóm VTVL Phục vụ';
const NO_LVL = ['Không áp dụng bậc'];
const LVL_3_4 = ['Từ bậc 3 đến bậc 4', 'Bậc 3', 'Bậc 4', 'Bậc 3, Bậc 4'];
const LVL_2_4 = ['Từ bậc 2 đến bậc 4', 'Bậc 2', 'Bậc 3', 'Bậc 4', 'Bậc 2, Bậc 3', 'Bậc 3, Bậc 4'];
const LVL_1_2 = ['Từ bậc 1 đến bậc 2', 'Bậc 1', 'Bậc 2', 'Bậc 1, Bậc 2'];

export const ND232_2026_VTVL_CATALOG: Nd232PositionCatalogItem[] = [
  // I. NHÓM VỊ TRÍ VIỆC LÀM QUẢN LÝ (19 vị trí khung — TT 1 đến 19 tại Phụ lục I 1907/HD-ĐHCNKT)
  m('HD1907-I-01', 1, 1, 'I. Quản lý', G1, 'Hiệu trưởng', 'Không áp dụng bậc', NO_LVL, 'Hiệu trưởng Trường ĐH Công nghệ Kỹ thuật TP.HCM', 'V.07.01.01 / V.07.01.02', 'QL-HT', 'Quản lý cấp trường (BGH — President)'),
  m('HD1907-I-02', 2, 2, 'I. Quản lý', G1, 'Phó hiệu trưởng', 'Không áp dụng bậc', NO_LVL, 'Phó hiệu trưởng + [lĩnh vực phụ trách / số thứ tự]', 'V.07.01.01 / V.07.01.02', 'QL-PHT', 'Quản lý cấp trường (BGH — Vice President)'),
  m('HD1907-I-03', 3, 3, 'I. Quản lý', G1, 'Trưởng khoa', 'Không áp dụng bậc', NO_LVL, 'Trưởng khoa + [Tên Khoa] (VD: Trưởng khoa Cơ khí Chế tạo máy)', 'V.07.01.01 / V.07.01.02', 'QL-TK', 'Đơn vị chuyên môn (Các Khoa đào tạo)'),
  m('HD1907-I-04', 4, 4, 'I. Quản lý', G1, 'Viện trưởng', 'Không áp dụng bậc', NO_LVL, 'Viện trưởng + [Tên Viện]', 'V.07.01.01 / V.07.01.02', 'QL-VT', 'Đơn vị chuyên môn/chức năng (Các Viện)'),
  m('HD1907-I-05', 5, 5, 'I. Quản lý', G1, 'Trưởng phòng', 'Không áp dụng bậc', NO_LVL, 'Trưởng phòng + [Tên Phòng]', '01.002 / V.07.01.02', 'QL-TP', 'Đơn vị chức năng (Các Phòng chức năng)'),
  m('HD1907-I-06', 6, 6, 'I. Quản lý', G1, 'Giám đốc', 'Không áp dụng bậc', NO_LVL, 'Giám đốc + [Tên Trung tâm / Phân hiệu / Thư viện]', 'V.07.01.02 / 01.002', 'QL-GD', 'Đơn vị chuyên môn/chức năng (Trung tâm, Phân hiệu, Thư viện)'),
  m('HD1907-I-07', 7, 7, 'I. Quản lý', G1, 'Chánh văn phòng', 'Không áp dụng bậc', NO_LVL, 'Chánh văn phòng + [Đảng ủy / Hội đồng trường]', '01.002', 'QL-CVP', 'Đơn vị chức năng (Văn phòng)'),
  m('HD1907-I-08', 8, 8, 'I. Quản lý', G1, 'Tổng biên tập', 'Không áp dụng bậc', NO_LVL, 'Tổng biên tập Tạp chí Giáo dục và Xã hội / KHGDKT', 'V.07.01.01 / V.07.01.02', 'QL-TBT', 'Đơn vị chức năng (Tạp chí JTE)'),
  m('HD1907-I-09', 9, 9, 'I. Quản lý', G1, 'Trưởng trạm', 'Không áp dụng bậc', NO_LVL, 'Trưởng trạm Y tế', 'V.08.01.02 / V.08.01.03', 'QL-TT', 'Đơn vị chức năng (Trạm Y tế — TYT)'),
  m('HD1907-I-10', 10, 10, 'I. Quản lý', G1, 'Phó Trưởng khoa', 'Không áp dụng bậc', NO_LVL, 'Phó Trưởng khoa + [Tên Khoa 1..n / lĩnh vực phụ trách]', 'V.07.01.02 / V.07.01.03', 'QL-PTK', 'Đơn vị chuyên môn (Các Khoa đào tạo)'),
  m('HD1907-I-11', 11, 11, 'I. Quản lý', G1, 'Phó Viện trưởng', 'Không áp dụng bậc', NO_LVL, 'Phó Viện trưởng + [lĩnh vực phụ trách / số thứ tự]', 'V.07.01.02 / V.07.01.03', 'QL-PVT', 'Đơn vị chuyên môn/chức năng (Các Viện)'),
  m('HD1907-I-12', 12, 12, 'I. Quản lý', G1, 'Phó Trưởng phòng', 'Không áp dụng bậc', NO_LVL, 'Phó Trưởng phòng + [lĩnh vực phụ trách / số thứ tự]', '01.002 / 01.003', 'QL-PTP', 'Đơn vị chức năng (Các Phòng chức năng)'),
  m('HD1907-I-13', 13, 13, 'I. Quản lý', G1, 'Phó Giám đốc', 'Không áp dụng bậc', NO_LVL, 'Phó Giám đốc + [lĩnh vực phụ trách / số thứ tự]', 'V.07.01.02 / 01.003', 'QL-PGD', 'Đơn vị chuyên môn/chức năng (Trung tâm, Phân hiệu)'),
  m('HD1907-I-14', 14, 14, 'I. Quản lý', G1, 'Phó Chánh văn phòng', 'Không áp dụng bậc', NO_LVL, 'Phó Chánh văn phòng + [lĩnh vực phụ trách]', '01.003', 'QL-PCVP', 'Đơn vị chức năng (Văn phòng)'),
  m('HD1907-I-15', 15, 15, 'I. Quản lý', G1, 'Phó Tổng biên tập', 'Không áp dụng bậc', NO_LVL, 'Phó Tổng biên tập Tạp chí', 'V.07.01.02', 'QL-PTBT', 'Đơn vị chức năng (Tạp chí JTE)'),
  m('HD1907-I-16', 16, 16, 'I. Quản lý', G1, 'Phó Trưởng trạm', 'Không áp dụng bậc', NO_LVL, 'Phó Trưởng trạm Y tế', 'V.08.01.03', 'QL-PTT', 'Đơn vị chức năng (Trạm Y tế — TYT)'),
  m('HD1907-I-17', 17, 17, 'I. Quản lý', G1, 'Trưởng Bộ môn', 'Không áp dụng bậc', NO_LVL, 'Trưởng Bộ môn + [Tên Bộ môn]', 'V.07.01.02 / V.07.01.03', 'QL-TBM', 'Đơn vị chuyên môn (Bộ môn thuộc Khoa/Viện)'),
  m('HD1907-I-18', 18, 18, 'I. Quản lý', G1, 'Trưởng Ngành', 'Không áp dụng bậc', NO_LVL, 'Trưởng Ngành + [Tên Ngành đào tạo]', 'V.07.01.02 / V.07.01.03', 'QL-TN', 'Đơn vị chuyên môn (Ngành đào tạo thuộc Khoa/Viện)'),
  m('HD1907-I-19', 19, 19, 'I. Quản lý', G1, 'Phó Trưởng Bộ môn', 'Không áp dụng bậc', NO_LVL, 'Phó Trưởng Bộ môn + [Tên Bộ môn]', 'V.07.01.02 / V.07.01.03', 'QL-PTBM', 'Đơn vị chuyên môn (Bộ môn thuộc Khoa/Viện)'),

  // II. NHÓM VỊ TRÍ VIỆC LÀM CHUYÊN MÔN, NGHIỆP VỤ (12 vị trí khung — TT 20–27, 30–33 tại Phụ lục I 1907/HD-ĐHCNKT)
  m('HD1907-II-01', 20, 1, 'II. Chuyên môn, nghiệp vụ', G2, 'Giảng viên', 'Bậc 3', ['Bậc 3'], 'Giảng viên (giữ nguyên tên khung)', 'V.07.01.03', 'DT-GV-03', 'Đơn vị chuyên môn (Khoa, Viện, Trung tâm đào tạo)'),
  m('HD1907-II-02', 21, 2, 'II. Chuyên môn, nghiệp vụ', G2, 'Giảng viên chính', 'Bậc 4', ['Bậc 4'], 'Giảng viên chính (giữ nguyên tên khung)', 'V.07.01.02', 'DT-GV-02', 'Đơn vị chuyên môn (Khoa, Viện, Trung tâm đào tạo)'),
  m('HD1907-II-03', 22, 3, 'II. Chuyên môn, nghiệp vụ', G2, 'Giảng viên cao cấp', 'Bậc 5', ['Bậc 5'], 'Giảng viên cao cấp (giữ nguyên tên khung)', 'V.07.01.01', 'DT-GV-01', 'Đơn vị chuyên môn (Khoa, Viện đào tạo)'),
  m('HD1907-II-04', 23, 4, 'II. Chuyên môn, nghiệp vụ', G2, 'Trợ lý nghiên cứu (hạng IV)', 'Bậc 2', ['Bậc 2'], 'Trợ lý nghiên cứu (hạng IV)', 'V.05.01.04', 'NC-TL-01', 'Đơn vị chuyên môn (Khoa, Viện, Trung tâm NCKH)'),
  m('HD1907-II-05', 24, 5, 'II. Chuyên môn, nghiệp vụ', G2, 'Nghiên cứu viên (hạng III)', 'Bậc 3', ['Bậc 3'], 'Nghiên cứu viên (hạng III)', 'V.05.01.03', 'NC-NCV-01', 'Đơn vị chuyên môn (Khoa, Viện, Trung tâm NCKH)'),
  m('HD1907-II-06', 25, 6, 'II. Chuyên môn, nghiệp vụ', G2, 'Nghiên cứu viên chính (hạng II)', 'Bậc 4', ['Bậc 4'], 'Nghiên cứu viên chính (hạng II)', 'V.05.01.02', 'NC-NCVC-01', 'Đơn vị chuyên môn (Khoa, Viện, Trung tâm NCKH)'),
  m('HD1907-II-07', 26, 7, 'II. Chuyên môn, nghiệp vụ', G2, 'Thư viện viên', 'Từ bậc 3 đến bậc 4', LVL_3_4, 'Thư viện viên + [mảng nghiệp vụ thư viện]', 'V.10.02.06', 'CM-TVV-01', 'Đơn vị chức năng (Thư viện — LIB)'),
  m('HD1907-II-08', 27, 8, 'II. Chuyên môn, nghiệp vụ', G2, 'Chuyên viên', 'Từ bậc 3 đến bậc 4', LVL_3_4, 'Tại Khoa/Viện: Thư ký khoa · Tại Phòng/Ban: Chuyên viên + [lĩnh vực phụ trách]', '01.003 / 01.002', 'CM-CV-01', 'Đơn vị chuyên môn/chức năng (51 đơn vị)'),
  m('HD1907-II-09', 30, 9, 'II. Chuyên môn, nghiệp vụ', G2, 'Kế toán viên', 'Từ bậc 3 đến bậc 4', LVL_3_4, 'Kế toán viên + [mảng kế toán phụ trách]', '06.031', 'CM-KTV-01', 'Đơn vị chức năng (Phòng KHTC — FPO & TT tự chủ)'),
  m('HD1907-II-10', 31, 10, 'II. Chuyên môn, nghiệp vụ', G2, 'Bác sĩ', 'Từ bậc 3 đến bậc 4', LVL_3_4, 'Bác sĩ khám chữa bệnh học đường', 'V.08.01.03', 'CM-BS-01', 'Đơn vị chức năng (Trạm Y tế — TYT)'),
  m('HD1907-II-11', 32, 11, 'II. Chuyên môn, nghiệp vụ', G2, 'Y sĩ', 'Bậc 2', ['Bậc 2'], 'Y sĩ y tế trường học', 'V.08.03.07', 'CM-YS-01', 'Đơn vị chức năng (Trạm Y tế — TYT)'),
  m('HD1907-II-12', 33, 12, 'II. Chuyên môn, nghiệp vụ', G2, 'Điều dưỡng', 'Từ bậc 2 đến bậc 4', LVL_2_4, 'Điều dưỡng y tế trường học', 'V.08.05.12', 'CM-DD-01', 'Đơn vị chức năng (Trạm Y tế — TYT)'),

  // III. NHÓM VỊ TRÍ VIỆC LÀM HỖ TRỢ (03 vị trí khung — TT 34–36 tại Phụ lục I 1907/HD-ĐHCNKT)
  m('HD1907-III-01', 34, 1, 'III. Hỗ trợ', G3, 'Trợ giảng', 'Bậc 3', ['Bậc 3'], 'Trợ giảng (giữ nguyên tên khung)', 'V.07.01.23', 'HT-TG-01', 'Đơn vị chuyên môn (Các Khoa, Viện đào tạo)'),
  m('HD1907-III-02', 35, 2, 'III. Hỗ trợ', G3, 'Nhân sự phụ trách xưởng/phòng thí nghiệm', 'Bậc 2', ['Bậc 2'], 'Nhân sự phụ trách phòng thí nghiệm + [Tên PTN/Xưởng] (VD: PTN CNC)', 'V.05.02.07', 'HT-PTN-01', 'Đơn vị chuyên môn (Xưởng/PTN các Khoa, Viện)'),
  m('HD1907-III-03', 36, 3, 'III. Hỗ trợ', G3, 'Thủ quỹ', 'Bậc 2', ['Bậc 2'], 'Thủ quỹ', '01.005', 'HT-TQ-01', 'Đơn vị chức năng (Phòng KHTC — FPO)'),

  // IV. NHÓM VỊ TRÍ VIỆC LÀM PHỤC VỤ (04 vị trí khung — TT 37–40 tại Phụ lục I 1907/HD-ĐHCNKT)
  m('HD1907-IV-01', 37, 1, 'IV. Phục vụ', G4, 'Nhân viên kỹ thuật', 'Từ bậc 1 đến bậc 2', LVL_1_2, 'Nhân viên kỹ thuật + [điện, nước, âm thanh, hạ tầng...]', 'NV-KT', 'PV-KT-01', 'Đơn vị chức năng (Phòng QTTB, Ban QLKTX, HC-TH)'),
  m('HD1907-IV-02', 38, 2, 'IV. Phục vụ', G4, 'Nhân viên lái xe', 'Từ bậc 1 đến bậc 2', LVL_1_2, 'Nhân viên lái xe công vụ', 'NV-LX', 'PV-LX-01', 'Đơn vị chức năng (Phòng Hành chính - Tổng hợp)'),
  m('HD1907-IV-03', 39, 3, 'IV. Phục vụ', G4, 'Nhân viên bảo vệ', 'Từ bậc 1 đến bậc 2', LVL_1_2, 'Nhân viên bảo vệ an ninh trật tự', 'NV-BV', 'PV-BV-01', 'Đơn vị chức năng (Phòng HC-TH, Ban QLKTX)'),
  m('HD1907-IV-04', 40, 4, 'IV. Phục vụ', G4, 'Nhân viên lễ tân, phục vụ, tạp vụ', 'Từ bậc 1 đến bậc 2', LVL_1_2, 'Nhân viên lễ tân, phục vụ, tạp vụ', 'NV-PV', 'PV-LT-01', 'Đơn vị chức năng (Phòng HC-TH, Ban QLKTX)')
];

/**
 * Sinh "Tên VTVL cụ thể tại đơn vị" theo đúng công thức tại Mục II.5 & Phụ lục II
 * Hướng dẫn số 02 (1907/HD-ĐHCNKT ngày 17/6/2026) của Hiệu trưởng HCM-UTE:
 * Công thức: [Khung VTVL của Trường] + [lĩnh vực phụ trách hoặc đánh số thứ tự]
 */
export function buildDefaultSpecificVtvlName(
  frameworkTitle: string,
  unitNameVi: string,
  specificSuffix?: string,
  unitKind?: string
): string {
  const cleanUnit = unitNameVi
    .replace(/^Khoa\s+/i, '')
    .replace(/^Viện\s+/i, '')
    .replace(/^Phòng\s+/i, '')
    .replace(/^Trung tâm\s+/i, '')
    .replace(/^Văn phòng\s+/i, '')
    .trim();

  if (
    frameworkTitle === 'Giảng viên' ||
    frameworkTitle === 'Giảng viên chính' ||
    frameworkTitle === 'Giảng viên cao cấp' ||
    frameworkTitle === 'Trợ giảng' ||
    frameworkTitle.startsWith('Nghiên cứu viên') ||
    frameworkTitle.startsWith('Trợ lý nghiên cứu')
  ) {
    return frameworkTitle;
  }
  if (frameworkTitle === 'Trưởng khoa') {
    return unitNameVi.toLowerCase().startsWith('viện')
      ? `Viện trưởng ${unitNameVi}`
      : `Trưởng khoa ${cleanUnit}`;
  }
  if (frameworkTitle === 'Phó Trưởng khoa') {
    return specificSuffix
      ? `Phó trưởng khoa ${specificSuffix}`
      : `Phó Trưởng khoa ${cleanUnit} 1`;
  }
  if (frameworkTitle === 'Trưởng Bộ môn') {
    return `Trưởng Bộ môn ${specificSuffix || `chuyên ngành (${cleanUnit})`}`;
  }
  if (frameworkTitle === 'Trưởng Ngành') {
    return `Trưởng Ngành ${specificSuffix || `đào tạo (${cleanUnit})`}`;
  }
  if (frameworkTitle === 'Phó Trưởng Bộ môn') {
    return `Phó Trưởng Bộ môn ${specificSuffix || `chuyên ngành (${cleanUnit})`}`;
  }
  if (frameworkTitle === 'Chuyên viên') {
    if (unitKind === 'khoa-vien') {
      return specificSuffix || 'Thư ký khoa';
    }
    return `Chuyên viên ${specificSuffix || `nghiệp vụ (${cleanUnit})`}`;
  }
  if (frameworkTitle === 'Nhân sự phụ trách xưởng/phòng thí nghiệm') {
    return `Nhân sự phụ trách phòng thí nghiệm ${specificSuffix || cleanUnit}`;
  }
  if (frameworkTitle === 'Trưởng phòng') {
    return `Trưởng ${unitNameVi}`;
  }
  if (frameworkTitle === 'Phó Trưởng phòng') {
    return `Phó Trưởng ${unitNameVi} (${specificSuffix || 'phụ trách chuyên môn'})`;
  }
  if (frameworkTitle === 'Giám đốc') {
    return `Giám đốc ${unitNameVi}`;
  }
  if (frameworkTitle === 'Phó Giám đốc') {
    return `Phó Giám đốc ${unitNameVi} (${specificSuffix || 'phụ trách chuyên môn'})`;
  }
  if (frameworkTitle === 'Chánh văn phòng') {
    return `Chánh ${unitNameVi}`;
  }
  return specificSuffix ? `${frameworkTitle} ${specificSuffix}` : frameworkTitle;
}
