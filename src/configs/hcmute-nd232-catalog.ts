import { HcmuteVtvlGroup4, ProposedVtvlRow, UnitGroupKind, WorkforceMethod, WorkingRegime } from '@/types/vtvl';

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
  // I. NHÓM VỊ TRÍ VIỆC LÀM QUẢN LÝ (19 vị trí khung — Phụ lục I: QL10 – QL60)
  m('HD1907-I-01', 1, 1, 'I. Quản lý', G1, 'Hiệu trưởng', 'Không áp dụng bậc', NO_LVL, 'Hiệu trưởng Trường ĐH Công nghệ Kỹ thuật TP.HCM', 'V.07.01.01 / V.07.01.02', 'QL10', 'Quản lý cấp trường (BGH — President · Mã PL1: QL10)'),
  m('HD1907-I-02', 2, 2, 'I. Quản lý', G1, 'Phó hiệu trưởng', 'Không áp dụng bậc', NO_LVL, 'Phó hiệu trưởng + [lĩnh vực phụ trách / số thứ tự]', 'V.07.01.01 / V.07.01.02', 'QL20', 'Quản lý cấp trường (BGH — Vice President · Mã PL1: QL20)'),
  m('HD1907-I-03', 3, 3, 'I. Quản lý', G1, 'Trưởng khoa', 'Không áp dụng bậc', NO_LVL, 'Trưởng khoa + [Tên Khoa] (VD: Trưởng khoa Cơ khí)', 'V.07.01.01 / V.07.01.02', 'QL31', 'Đơn vị chuyên môn (Các Khoa đào tạo · Mã PL1: QL31)'),
  m('HD1907-I-04', 4, 4, 'I. Quản lý', G1, 'Viện trưởng', 'Không áp dụng bậc', NO_LVL, 'Viện trưởng + [Tên Viện]', 'V.07.01.01 / V.07.01.02', 'QL32', 'Đơn vị chuyên môn/chức năng (Các Viện · Mã PL1: QL32)'),
  m('HD1907-I-05', 5, 5, 'I. Quản lý', G1, 'Trưởng phòng', 'Không áp dụng bậc', NO_LVL, 'Trưởng phòng + [Tên Phòng] (hoặc Trưởng ban QL34)', '01.002 / V.07.01.02', 'QL33', 'Đơn vị chức năng (Các Phòng/Ban · Mã PL1: QL33, QL34)'),
  m('HD1907-I-06', 6, 6, 'I. Quản lý', G1, 'Giám đốc', 'Không áp dụng bậc', NO_LVL, 'Giám đốc + [Tên Trung tâm (QL36) / Phân hiệu (QL37)]', 'V.07.01.02 / 01.002', 'QL36', 'Trung tâm, Phân hiệu (Mã PL1: QL36, QL37)'),
  m('HD1907-I-07', 7, 7, 'I. Quản lý', G1, 'Chánh văn phòng', 'Không áp dụng bậc', NO_LVL, 'Chánh văn phòng Đảng ủy', '01.002', 'QL38', 'Văn phòng Đảng ủy (Mã PL1: QL38)'),
  m('HD1907-I-08', 8, 8, 'I. Quản lý', G1, 'Tổng biên tập', 'Không áp dụng bậc', NO_LVL, 'Tổng biên tập Tạp chí khoa học', 'V.07.01.01 / V.07.01.02', 'QL39', 'Tạp chí khoa học (Mã PL1: QL39)'),
  m('HD1907-I-09', 9, 9, 'I. Quản lý', G1, 'Trưởng trạm', 'Không áp dụng bậc', NO_LVL, 'Trưởng trạm Y tế', 'V.08.01.02 / V.08.01.03', 'QL35', 'Trạm Y tế — TYT (Mã PL1: QL35)'),
  m('HD1907-I-10', 10, 10, 'I. Quản lý', G1, 'Phó Trưởng khoa', 'Không áp dụng bậc', NO_LVL, 'Phó Trưởng khoa + [Tên Khoa / lĩnh vực phụ trách]', 'V.07.01.02 / V.07.01.03', 'QL41', 'Các Khoa đào tạo (Mã PL1: QL41)'),
  m('HD1907-I-11', 11, 11, 'I. Quản lý', G1, 'Phó Viện trưởng', 'Không áp dụng bậc', NO_LVL, 'Phó Viện trưởng + [lĩnh vực phụ trách]', 'V.07.01.02 / V.07.01.03', 'QL42', 'Các Viện (Mã PL1: QL42)'),
  m('HD1907-I-12', 12, 12, 'I. Quản lý', G1, 'Phó Trưởng phòng', 'Không áp dụng bậc', NO_LVL, 'Phó Trưởng phòng + [Tên Phòng] (hoặc Phó Trưởng ban QL44)', '01.002 / 01.003', 'QL43', 'Các Phòng/Ban chức năng (Mã PL1: QL43, QL44)'),
  m('HD1907-I-13', 13, 13, 'I. Quản lý', G1, 'Phó Giám đốc', 'Không áp dụng bậc', NO_LVL, 'Phó Giám đốc Trung tâm (QL46) / Phân hiệu (QL47)', 'V.07.01.02 / 01.003', 'QL46', 'Trung tâm, Phân hiệu (Mã PL1: QL46, QL47)'),
  m('HD1907-I-14', 14, 14, 'I. Quản lý', G1, 'Phó Chánh văn phòng', 'Không áp dụng bậc', NO_LVL, 'Phó Chánh văn phòng Đảng ủy', '01.003', 'QL48', 'Văn phòng Đảng ủy (Mã PL1: QL48)'),
  m('HD1907-I-15', 15, 15, 'I. Quản lý', G1, 'Phó Tổng biên tập', 'Không áp dụng bậc', NO_LVL, 'Phó Tổng biên tập Tạp chí khoa học', 'V.07.01.02', 'QL49', 'Tạp chí khoa học (Mã PL1: QL49)'),
  m('HD1907-I-16', 16, 16, 'I. Quản lý', G1, 'Phó Trưởng trạm', 'Không áp dụng bậc', NO_LVL, 'Phó Trưởng trạm Y tế', 'V.08.01.03', 'QL45', 'Trạm Y tế — TYT (Mã PL1: QL45)'),
  m('HD1907-I-17', 17, 17, 'I. Quản lý', G1, 'Trưởng Bộ môn', 'Không áp dụng bậc', NO_LVL, 'Trưởng Bộ môn + [Tên Bộ môn]', 'V.07.01.02 / V.07.01.03', 'QL50', 'Bộ môn thuộc Khoa/Viện (Mã PL1: QL50)'),
  m('HD1907-I-18', 18, 18, 'I. Quản lý', G1, 'Trưởng Ngành', 'Không áp dụng bậc', NO_LVL, 'Trưởng Ngành + [Tên Ngành đào tạo]', 'V.07.01.02 / V.07.01.03', 'QL50', 'Ngành đào tạo thuộc Khoa/Viện (Mã PL1: QL50)'),
  m('HD1907-I-19', 19, 19, 'I. Quản lý', G1, 'Phó Trưởng Bộ môn', 'Không áp dụng bậc', NO_LVL, 'Phó Trưởng Bộ môn + [Tên Bộ môn]', 'V.07.01.02 / V.07.01.03', 'QL60', 'Bộ môn thuộc Khoa/Viện (Mã PL1: QL60)'),

  // II. NHÓM VỊ TRÍ VIỆC LÀM CHUYÊN MÔN, NGHIỆP VỤ (12 vị trí khung — Phụ lục I: CM76, CM79, CM80, CM63–65, CM103, CM113, HT62)
  m('HD1907-II-01', 20, 1, 'II. Chuyên môn, nghiệp vụ', G2, 'Giảng viên', 'Bậc 3', ['Bậc 3'], 'Giảng viên đại học — Giảng viên (Bậc 3)', 'V.07.01.03', 'CM76', 'Khoa, Viện, Trung tâm đào tạo (Mã PL1: CM76 · Bậc 3)'),
  m('HD1907-II-02', 21, 2, 'II. Chuyên môn, nghiệp vụ', G2, 'Giảng viên chính', 'Bậc 4', ['Bậc 4'], 'Giảng viên đại học — Giảng viên chính (Bậc 4)', 'V.07.01.02', 'CM76', 'Khoa, Viện, Trung tâm đào tạo (Mã PL1: CM76 · Bậc 4)'),
  m('HD1907-II-03', 22, 3, 'II. Chuyên môn, nghiệp vụ', G2, 'Giảng viên cao cấp', 'Bậc 5', ['Bậc 5'], 'Giảng viên đại học — Giảng viên cao cấp / GS / PGS (Bậc 5)', 'V.07.01.01', 'CM76', 'Khoa, Viện đào tạo (Mã PL1: CM76 · Bậc 5)'),
  m('HD1907-II-04', 23, 4, 'II. Chuyên môn, nghiệp vụ', G2, 'Đổi mới sáng tạo & Sở hữu trí tuệ', 'Bậc 3', ['Bậc 3'], 'Đổi mới sáng tạo (CM63) / Sở hữu trí tuệ (CM64)', 'V.05.01.03', 'CM63', 'Trung tâm CISAT, Phòng KHCN (Mã PL1: CM63, CM64 · Bậc 3)'),
  m('HD1907-II-05', 24, 5, 'II. Chuyên môn, nghiệp vụ', G2, 'Nghiên cứu viên', 'Bậc 3', ['Bậc 3'], 'Nghiên cứu viên (HT62)', 'V.05.01.03', 'HT62', 'Khoa, Viện, Trung tâm NCKH (Mã PL1: HT62 · Bậc 3)'),
  m('HD1907-II-06', 25, 6, 'II. Chuyên môn, nghiệp vụ', G2, 'Quản lý khoa học, công nghệ', 'Bậc 3, Bậc 4', LVL_3_4, 'Quản lý khoa học, công nghệ (CM65)', '01.003 / 01.002', 'CM65', 'Phòng KHCN — STIAO, Viện NCKH (Mã PL1: CM65 · Bậc 3, Bậc 4)'),
  m('HD1907-II-07', 26, 7, 'II. Chuyên môn, nghiệp vụ', G2, 'Thư viện viên', 'Bậc 3, Bậc 4', LVL_3_4, 'Thư viện viên (CM103) / Biên tập viên (CM113)', 'V.10.02.06', 'CM103', 'TT Học liệu & Dạy học số, Tạp chí (Mã PL1: CM103, CM113)'),
  m('HD1907-II-08', 27, 8, 'II. Chuyên môn, nghiệp vụ', G2, 'Chuyên viên', 'Bậc 3, Bậc 4', LVL_3_4, 'Quản lý đào tạo (CM79) / ĐBCL (CM80) / Tổ chức cán bộ (HT45) / Hành chính – Tổng hợp (HT49)', '01.003 / 01.002', 'HT45', '51 đơn vị (Mã PL1: CM79, CM80, HT26, HT32–35, HT43–52)'),
  m('HD1907-II-09', 30, 9, 'II. Chuyên môn, nghiệp vụ', G2, 'Kế toán viên', 'Bậc 3, Bậc 4', LVL_3_4, 'Tài chính (HT54) / Kế toán trưởng (HT55) / Kế toán (HT56)', '06.031', 'HT56', 'Phòng KHTC — FPO & TT tự chủ (Mã PL1: HT54, HT55, HT56)'),
  m('HD1907-II-10', 31, 10, 'II. Chuyên môn, nghiệp vụ', G2, 'Bác sĩ', 'Bậc 2, Bậc 3', ['Bậc 2', 'Bậc 3', 'Bậc 2, Bậc 3'], 'Y tế trường học — Bác sĩ (HT37)', 'V.08.01.03', 'HT37', 'Trạm Y tế — TYT (Mã PL1: HT37 · Bậc 2, Bậc 3)'),
  m('HD1907-II-11', 32, 11, 'II. Chuyên môn, nghiệp vụ', G2, 'Y sĩ', 'Bậc 2, Bậc 3', ['Bậc 2', 'Bậc 3', 'Bậc 2, Bậc 3'], 'Y tế trường học — Y sĩ (HT37)', 'V.08.03.07', 'HT37', 'Trạm Y tế — TYT (Mã PL1: HT37 · Bậc 2, Bậc 3)'),
  m('HD1907-II-12', 33, 12, 'II. Chuyên môn, nghiệp vụ', G2, 'Điều dưỡng', 'Bậc 2, Bậc 3', ['Bậc 2', 'Bậc 3', 'Bậc 2, Bậc 3'], 'Y tế trường học — Điều dưỡng (HT37)', 'V.08.05.12', 'HT37', 'Trạm Y tế — TYT (Mã PL1: HT37 · Bậc 2, Bậc 3)'),

  // III. NHÓM VỊ TRÍ VIỆC LÀM HỖ TRỢ (03 vị trí khung — Phụ lục I: HT30, HT31, HT57)
  m('HD1907-III-01', 34, 1, 'III. Hỗ trợ', G3, 'Trợ giảng', 'Bậc 3', ['Bậc 3'], 'Trợ giảng (HT30)', 'V.07.01.23', 'HT30', 'Các Khoa, Viện đào tạo (Mã PL1: HT30 · Bậc 3)'),
  m('HD1907-III-02', 35, 2, 'III. Hỗ trợ', G3, 'Nhân sự hỗ trợ giảng dạy', 'Bậc 3', ['Bậc 3', 'Bậc 2'], 'Nhân sự hỗ trợ giảng dạy / Phụ trách PTN, xưởng (HT31)', 'V.05.02.07', 'HT31', 'Xưởng/PTN các Khoa, Viện (Mã PL1: HT31 · Bậc 3)'),
  m('HD1907-III-03', 36, 3, 'III. Hỗ trợ', G3, 'Thủ quỹ', 'Bậc 3', ['Bậc 3', 'Bậc 2'], 'Thủ quỹ (HT57) / Văn thư (HT58) / Lưu trữ (HT59)', '01.005', 'HT57', 'Phòng KHTC, Phòng HC-TH (Mã PL1: HT57, HT58, HT59 · Bậc 3)'),

  // IV. NHÓM VỊ TRÍ VIỆC LÀM PHỤC VỤ & KỸ THUẬT (04 vị trí khung — Phụ lục I: HT61, HT50, HT49)
  m('HD1907-IV-01', 37, 1, 'IV. Phục vụ', G4, 'Kỹ thuật', 'Bậc 1, Bậc 2, Bậc 3', ['Bậc 1, Bậc 2, Bậc 3', 'Bậc 1', 'Bậc 2', 'Bậc 3'], 'Kỹ thuật vận hành hạ tầng, điện nước, thiết bị (HT61)', 'NV-KT', 'HT61', 'Phòng QTCSVC, Ban QLKTX, HC-TH (Mã PL1: HT61 · Bậc 1, 2, 3)'),
  m('HD1907-IV-02', 38, 2, 'IV. Phục vụ', G4, 'Nhân viên lái xe', 'Từ bậc 1 đến bậc 2', LVL_1_2, 'Kỹ thuật / Lái xe công vụ (HT61 / HT49)', 'NV-LX', 'HT61', 'Phòng Hành chính - Tổng hợp (Mã PL1: HT61)'),
  m('HD1907-IV-03', 39, 3, 'IV. Phục vụ', G4, 'Nhân viên bảo vệ', 'Từ bậc 1 đến bậc 2', LVL_1_2, 'Quản trị công sở — Bảo vệ an ninh trật tự (HT50)', 'NV-BV', 'HT50', 'Phòng HC-TH, Ban QLKTX (Mã PL1: HT50)'),
  m('HD1907-IV-04', 40, 4, 'IV. Phục vụ', G4, 'Nhân viên lễ tân, phục vụ, tạp vụ', 'Từ bậc 1 đến bậc 2', LVL_1_2, 'Hành chính – Tổng hợp / Quản trị công sở (HT49 / HT50)', 'NV-PV', 'HT49', 'Phòng HC-TH, Ban QLKTX (Mã PL1: HT49, HT50)')
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

export function buildProposedPositionFromFramework(
  frameworkId: string,
  unitNameVi: string,
  unitKind: UnitGroupKind,
  seqIndex = 1,
  specificHint?: string
): ProposedVtvlRow {
  const item =
    ND232_2026_VTVL_CATALOG.find((x) => x.maDanhMucNd232 === frameworkId) ||
    ND232_2026_VTVL_CATALOG[0];

  const isLecturerOrTa =
    item.maChucDanhTt31.startsWith('V.07.01.') &&
    (item.positionName.includes('Giảng viên') || item.positionName.includes('Trợ giảng'));
  const isManager = item.vtvlGroup4 === 'I. Nhóm VTVL Quản lý';

  const workingRegime: WorkingRegime = isLecturerOrTa ? 'Đặc thù' : 'Phổ biến (40 giờ/tuần)';
  const standardHoursYear = isLecturerOrTa ? 1760 : 1904;
  const method: WorkforceMethod = isManager ? 'PP1' : 'PP2';
  const baseCode = item.linkedCodeHint;
  const vtvlSuffix = seqIndex > 1 && !/^(QL|CM|HT)\d+$/.test(baseCode)
    ? `${baseCode}-${String(seqIndex).padStart(2, '0')}`
    : baseCode;

  return {
    id: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${seqIndex}`,
    frameworkId: item.maDanhMucNd232,
    vtvlSuffix,
    ngachCode: item.maChucDanhTt31,
    vtvlGroup4: item.vtvlGroup4,
    frameworkTitle: item.positionName,
    specificName: buildDefaultSpecificVtvlName(
      item.positionName,
      unitNameVi,
      specificHint,
      unitKind
    ),
    careerLevel: item.allowedLevels[0] || item.careerLevel,
    allowedLevels: item.allowedLevels,
    method,
    workingRegime,
    standardHoursYear,
    staffCount: isManager ? 1 : isLecturerOrTa ? 6 : 2,
    proposedFte: isManager ? 1 : isLecturerOrTa ? 6 : 2
  };
}

export function buildDefaultProposedPositionsForUnit(
  unitNameVi: string,
  unitKind: UnitGroupKind
): ProposedVtvlRow[] {
  // Mẫu thực tế Phòng Tổ chức - Nhân sự (TCNS_HCMUTE_Bo_bieu_HD07.xlsx — 6 vị trí chuẩn Phụ lục I)
  if (unitNameVi.toLowerCase().includes('tổ chức - nhân sự') || unitNameVi.toLowerCase().includes('tổ chức – nhân sự')) {
    return [
      { ...buildProposedPositionFromFramework('HD1907-I-05', unitNameVi, unitKind, 1), vtvlSuffix: 'QL33', specificName: 'Trưởng phòng Tổ chức - Nhân sự', method: 'PP1', staffCount: 1, proposedFte: 1 },
      { ...buildProposedPositionFromFramework('HD1907-I-12', unitNameVi, unitKind, 2), vtvlSuffix: 'QL43', specificName: 'Phó Trưởng phòng Tổ chức - Nhân sự', method: 'PP1', staffCount: 2, proposedFte: 2 },
      { ...buildProposedPositionFromFramework('HD1907-II-08', unitNameVi, unitKind, 1), vtvlSuffix: 'HT45', frameworkTitle: 'Tổ chức cán bộ, thi đua khen thưởng', specificName: 'Tổ chức cán bộ, thi đua khen thưởng', careerLevel: 'Bậc 3, Bậc 4', staffCount: 3, proposedFte: 3 },
      { ...buildProposedPositionFromFramework('HD1907-II-08', unitNameVi, unitKind, 2), vtvlSuffix: 'HT47', frameworkTitle: 'Tiếp công dân, giải quyết khiếu nại, tố cáo', specificName: 'Tiếp công dân, giải quyết khiếu nại, tố cáo', careerLevel: 'Bậc 3', staffCount: 1, proposedFte: 1 },
      { ...buildProposedPositionFromFramework('HD1907-II-08', unitNameVi, unitKind, 3), vtvlSuffix: 'HT48', frameworkTitle: 'Phòng, chống tham nhũng, tiêu cực, lãng phí', specificName: 'Phòng, chống tham nhũng, tiêu cực, lãng phí', careerLevel: 'Bậc 3', staffCount: 1, proposedFte: 1 },
      { ...buildProposedPositionFromFramework('HD1907-II-08', unitNameVi, unitKind, 4), vtvlSuffix: 'HT49', frameworkTitle: 'Hành chính – Tổng hợp', specificName: 'Hành chính – Tổng hợp', careerLevel: 'Bậc 2, Bậc 3, Bậc 4', allowedLevels: LVL_2_4, staffCount: 1, proposedFte: 1 }
    ];
  }
  if (unitKind === 'khoa-vien') {
    const isVien = unitNameVi.toLowerCase().startsWith('viện');
    return [
      { ...buildProposedPositionFromFramework(isVien ? 'HD1907-I-04' : 'HD1907-I-03', unitNameVi, unitKind, 1), vtvlSuffix: isVien ? 'QL32' : 'QL31', staffCount: 1, proposedFte: 1 },
      { ...buildProposedPositionFromFramework(isVien ? 'HD1907-I-11' : 'HD1907-I-10', unitNameVi, unitKind, 2, 'phụ trách Đào tạo & KHCN'), vtvlSuffix: isVien ? 'QL42' : 'QL41', staffCount: 2, proposedFte: 2 },
      { ...buildProposedPositionFromFramework('HD1907-I-17', unitNameVi, unitKind, 3), vtvlSuffix: 'QL50', staffCount: 3, proposedFte: 3 },
      { ...buildProposedPositionFromFramework('HD1907-II-02', unitNameVi, unitKind, 1), vtvlSuffix: 'CM76-B4', staffCount: 8, proposedFte: 8 },
      { ...buildProposedPositionFromFramework('HD1907-II-01', unitNameVi, unitKind, 2), vtvlSuffix: 'CM76-B3', staffCount: 14, proposedFte: 14 },
      { ...buildProposedPositionFromFramework('HD1907-III-01', unitNameVi, unitKind, 1), vtvlSuffix: 'HT30', staffCount: 2, proposedFte: 2 },
      { ...buildProposedPositionFromFramework('HD1907-III-02', unitNameVi, unitKind, 1, 'thực hành chuyên ngành'), vtvlSuffix: 'HT31', staffCount: 3, proposedFte: 3 },
      { ...buildProposedPositionFromFramework('HD1907-II-08', unitNameVi, unitKind, 1, 'Thư ký khoa (Hỗ trợ tổ chức hoạt động giáo dục)'), vtvlSuffix: 'HT35', staffCount: 2, proposedFte: 2 }
    ];
  }
  if (unitKind === 'phong-ban') {
    return [
      { ...buildProposedPositionFromFramework('HD1907-I-05', unitNameVi, unitKind, 1), vtvlSuffix: 'QL33', staffCount: 1, proposedFte: 1 },
      { ...buildProposedPositionFromFramework('HD1907-I-12', unitNameVi, unitKind, 2, 'phụ trách nghiệp vụ'), vtvlSuffix: 'QL43', staffCount: 2, proposedFte: 2 },
      { ...buildProposedPositionFromFramework('HD1907-II-08', unitNameVi, unitKind, 1, 'tham mưu nghiệp vụ chuyên ngành'), vtvlSuffix: 'HT45', careerLevel: 'Bậc 3, Bậc 4', staffCount: 4, proposedFte: 4 },
      { ...buildProposedPositionFromFramework('HD1907-II-08', unitNameVi, unitKind, 2, 'Hành chính – Tổng hợp'), vtvlSuffix: 'HT49', careerLevel: 'Bậc 2, Bậc 3, Bậc 4', allowedLevels: LVL_2_4, staffCount: 2, proposedFte: 2 }
    ];
  }
  if (unitKind === 'trung-tam') {
    const isPhanHieu = unitNameVi.toLowerCase().includes('phân hiệu');
    return [
      { ...buildProposedPositionFromFramework('HD1907-I-06', unitNameVi, unitKind, 1), vtvlSuffix: isPhanHieu ? 'QL37' : 'QL36', staffCount: 1, proposedFte: 1 },
      { ...buildProposedPositionFromFramework('HD1907-I-13', unitNameVi, unitKind, 2, 'phụ trách vận hành'), vtvlSuffix: isPhanHieu ? 'QL47' : 'QL46', staffCount: 1, proposedFte: 1 },
      { ...buildProposedPositionFromFramework('HD1907-II-05', unitNameVi, unitKind, 1), vtvlSuffix: 'HT62', staffCount: 3, proposedFte: 3 },
      { ...buildProposedPositionFromFramework('HD1907-II-08', unitNameVi, unitKind, 1, 'Quản lý đào tạo, bồi dưỡng & Hành chính'), vtvlSuffix: 'HT32', staffCount: 3, proposedFte: 3 }
    ];
  }
  return [
    { ...buildProposedPositionFromFramework('HD1907-I-07', unitNameVi, unitKind, 1), vtvlSuffix: 'QL38', staffCount: 1, proposedFte: 1 },
    { ...buildProposedPositionFromFramework('HD1907-I-14', unitNameVi, unitKind, 2, 'phụ trách tổng hợp'), vtvlSuffix: 'QL48', staffCount: 1, proposedFte: 1 },
    { ...buildProposedPositionFromFramework('HD1907-II-08', unitNameVi, unitKind, 1, 'công tác Đảng – Đoàn thể & Hành chính – Tổng hợp'), vtvlSuffix: 'HT49', staffCount: 3, proposedFte: 3 }
  ];
}
