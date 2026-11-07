import { HcmuteVtvlGroup4, JobTaskTemplate, NgachItem, UnitGroupKind } from '@/types/vtvl';

const G1: HcmuteVtvlGroup4 = 'I. Nhóm VTVL Quản lý';
const G2: HcmuteVtvlGroup4 = 'II. Nhóm VTVL Chuyên môn, nghiệp vụ';
const G3: HcmuteVtvlGroup4 = 'III. Nhóm VTVL Hỗ trợ';
const G4: HcmuteVtvlGroup4 = 'IV. Nhóm VTVL Phục vụ';

const NO_LVL = ['Không áp dụng bậc'];
const LVL_3_4 = ['Từ bậc 3 đến bậc 4', 'Bậc 3', 'Bậc 4', 'Bậc 3, Bậc 4'];
const LVL_2_4 = ['Từ bậc 2 đến bậc 4', 'Bậc 2', 'Bậc 3', 'Bậc 4', 'Bậc 2, Bậc 3', 'Bậc 3, Bậc 4'];
const LVL_1_2 = ['Từ bậc 1 đến bậc 2', 'Bậc 1', 'Bậc 2', 'Bậc 1, Bậc 2'];

export const NGACH_LIST_BY_GROUP: Record<UnitGroupKind, NgachItem[]> = {
  'khoa-vien': [
    { code: 'QL-TK', name: 'Trưởng khoa / Viện trưởng', frameworkTitle: 'Trưởng khoa', specificNameSuffix: '', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (Phụ lục I HD 1907/HD-ĐHCNKT)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 1, salaryGroup: 'Quản lý Khoa/Viện', salaryRange: 'Phụ cấp CV' },
    { code: 'QL-PTK', name: 'Phó Trưởng khoa / Phó Viện trưởng', frameworkTitle: 'Phó Trưởng khoa', specificNameSuffix: 'phụ trách Đào tạo, NCKH', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (Phụ lục I HD 1907/HD-ĐHCNKT)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 2, salaryGroup: 'Quản lý Khoa/Viện', salaryRange: 'Phụ cấp CV' },
    { code: 'QL-TBM', name: 'Trưởng Bộ môn', frameworkTitle: 'Trưởng Bộ môn', specificNameSuffix: 'chuyên ngành', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (TT 17 Phụ lục I HD 1907/HD-ĐHCNKT)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 4, salaryGroup: 'Quản lý Bộ môn', salaryRange: 'Phụ cấp CV' },
    { code: 'QL-TN', name: 'Trưởng Ngành', frameworkTitle: 'Trưởng Ngành', specificNameSuffix: 'đào tạo đại học', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (TT 18 Phụ lục I HD 1907/HD-ĐHCNKT)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 3, salaryGroup: 'Quản lý Ngành', salaryRange: 'Phụ cấp CV' },
    { code: 'QL-PTBM', name: 'Phó Trưởng Bộ môn', frameworkTitle: 'Phó Trưởng Bộ môn', specificNameSuffix: 'chuyên ngành', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (TT 19 Phụ lục I HD 1907/HD-ĐHCNKT)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 4, salaryGroup: 'Quản lý Bộ môn', salaryRange: 'Phụ cấp CV' },
    { code: 'V.07.01.01', name: 'Giảng viên cao cấp (Bậc 5)', frameworkTitle: 'Giảng viên cao cấp', specificNameSuffix: '', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 5', allowedCareerLevels: ['Bậc 5'], group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 22 Phụ lục I HD 1907 & Đ14 TT 31)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 6, salaryGroup: 'A3.1 · Bậc 5', salaryRange: '6,20 – 8,00' },
    { code: 'V.07.01.02', name: 'Giảng viên chính (Bậc 4)', frameworkTitle: 'Giảng viên chính', specificNameSuffix: '', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 4', allowedCareerLevels: ['Bậc 4'], group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 21 Phụ lục I HD 1907 & Đ14 TT 31)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 22, salaryGroup: 'A2.1 · Bậc 4', salaryRange: '4,40 – 6,78' },
    { code: 'V.07.01.03', name: 'Giảng viên (Bậc 3)', frameworkTitle: 'Giảng viên', specificNameSuffix: '', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 3', allowedCareerLevels: ['Bậc 3'], group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 20 Phụ lục I HD 1907 & Đ14 TT 31)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 26, salaryGroup: 'A1 · Bậc 3', salaryRange: '2,34 – 4,98' },
    { code: 'V.05.01.03', name: 'Nghiên cứu viên (hạng III — Bậc 3)', frameworkTitle: 'Nghiên cứu viên (hạng III)', specificNameSuffix: '', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 3', allowedCareerLevels: ['Bậc 3'], group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 24 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 2, salaryGroup: 'A1 · Bậc 3', salaryRange: '2,34 – 4,98' },
    { code: '01.003', name: 'Chuyên viên → Thư ký khoa (Từ bậc 3 đến bậc 4)', frameworkTitle: 'Chuyên viên', specificNameSuffix: 'Thư ký khoa', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 27 Phụ lục I & Phụ lục II HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 3, salaryGroup: 'A1 · Bậc 3–4', salaryRange: '2,34 – 4,98' },
    { code: 'V.07.01.23', name: 'Trợ giảng (Bậc 3)', frameworkTitle: 'Trợ giảng', specificNameSuffix: '', vtvlGroup4: G3, defaultCareerLevel: 'Bậc 3', allowedCareerLevels: ['Bậc 3'], group: 'Nhóm III — Hỗ trợ (TT 34 Phụ lục I HD 1907 & K5 Đ15 TT 31)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 2, salaryGroup: 'A1 · Bậc 3', salaryRange: '2,34 – 4,98' },
    { code: 'V.05.02.07', name: 'Nhân sự phụ trách xưởng/phòng thí nghiệm (Bậc 2)', frameworkTitle: 'Nhân sự phụ trách xưởng/phòng thí nghiệm', specificNameSuffix: 'CNC và thực hành chuyên ngành', vtvlGroup4: G3, defaultCareerLevel: 'Bậc 2', allowedCareerLevels: ['Bậc 2'], group: 'Nhóm III — Hỗ trợ (TT 35 Phụ lục I HD 1907/HD-ĐHCNKT)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 5, salaryGroup: 'Bậc 2', salaryRange: '2,06 – 4,98' }
  ],
  'phong-ban': [
    { code: 'QL-TP', name: 'Trưởng phòng / Trưởng trạm', frameworkTitle: 'Trưởng phòng', specificNameSuffix: '', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (TT 5, 9 Phụ lục I HD 1907/HD-ĐHCNKT)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 1, salaryGroup: 'Quản lý Phòng', salaryRange: 'Phụ cấp CV' },
    { code: 'QL-PTP', name: 'Phó Trưởng phòng / Phó Trưởng trạm', frameworkTitle: 'Phó Trưởng phòng', specificNameSuffix: 'phụ trách nghiệp vụ chuyên môn', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (TT 12, 16 Phụ lục I HD 1907/HD-ĐHCNKT)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 2, salaryGroup: 'Quản lý Phòng', salaryRange: 'Phụ cấp CV' },
    { code: '01.003', name: 'Chuyên viên (Từ bậc 3 đến bậc 4)', frameworkTitle: 'Chuyên viên', specificNameSuffix: 'quản lý nghiệp vụ và hành chính tổng hợp', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 27 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 10, salaryGroup: 'A1 · Bậc 3–4', salaryRange: '2,34 – 4,98' },
    { code: '06.031', name: 'Kế toán viên (Từ bậc 3 đến bậc 4)', frameworkTitle: 'Kế toán viên', specificNameSuffix: 'kế toán tổng hợp và thanh quyết toán', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 30 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 2, salaryGroup: 'A1 · Bậc 3–4', salaryRange: '2,34 – 4,98' },
    { code: 'V.10.02.06', name: 'Thư viện viên / Bác sĩ (Từ bậc 3 đến bậc 4)', frameworkTitle: 'Thư viện viên', specificNameSuffix: 'quản trị thông tin – học liệu', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 26, 31 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 1, salaryGroup: 'A1 · Bậc 3–4', salaryRange: '2,34 – 4,98' },
    { code: 'V.08.05.12', name: 'Điều dưỡng (Từ bậc 2 đến bậc 4)', frameworkTitle: 'Điều dưỡng', specificNameSuffix: 'chăm sóc sức khỏe học đường', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 2 đến bậc 4', allowedCareerLevels: LVL_2_4, group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 33 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 1, salaryGroup: 'Bậc 2–4', salaryRange: '2,06 – 4,98' },
    { code: '01.005', name: 'Thủ quỹ (Bậc 2)', frameworkTitle: 'Thủ quỹ', specificNameSuffix: 'quản lý quỹ tiền mặt', vtvlGroup4: G3, defaultCareerLevel: 'Bậc 2', allowedCareerLevels: ['Bậc 2'], group: 'Nhóm III — Hỗ trợ (TT 36 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 1, salaryGroup: 'Bậc 2', salaryRange: '2,06 – 4,06' },
    { code: 'NV-KT', name: 'Nhân viên kỹ thuật / lái xe / bảo vệ / lễ tân (Từ bậc 1 đến bậc 2)', frameworkTitle: 'Nhân viên kỹ thuật', specificNameSuffix: 'vận hành điện nước, lái xe, bảo vệ, lễ tân', vtvlGroup4: G4, defaultCareerLevel: 'Từ bậc 1 đến bậc 2', allowedCareerLevels: LVL_1_2, group: 'Nhóm IV — Phục vụ (TT 37–40 Phụ lục I HD 1907)', personnelType: 'Hợp đồng lao động', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 3, salaryGroup: 'Bậc 1–2', salaryRange: '1,86 – 4,06' }
  ],
  'trung-tam': [
    { code: 'QL-GD', name: 'Giám đốc / Tổng biên tập', frameworkTitle: 'Giám đốc', specificNameSuffix: '', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (TT 6, 8 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 1, salaryGroup: 'Quản lý Trung tâm', salaryRange: 'Phụ cấp CV' },
    { code: 'QL-PGD', name: 'Phó Giám đốc / Phó Tổng biên tập', frameworkTitle: 'Phó Giám đốc', specificNameSuffix: 'phụ trách đào tạo và dịch vụ KHCN', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (TT 13, 15 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 1, salaryGroup: 'Quản lý Trung tâm', salaryRange: 'Phụ cấp CV' },
    { code: 'V.07.01.02', name: 'Giảng viên chính (Bậc 4)', frameworkTitle: 'Giảng viên chính', specificNameSuffix: '', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 4', allowedCareerLevels: ['Bậc 4'], group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 21 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 2, salaryGroup: 'A2.1 · Bậc 4', salaryRange: '4,40 – 6,78' },
    { code: 'V.07.01.03', name: 'Giảng viên (Bậc 3)', frameworkTitle: 'Giảng viên', specificNameSuffix: '', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 3', allowedCareerLevels: ['Bậc 3'], group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 20 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 5, salaryGroup: 'A1 · Bậc 3', salaryRange: '2,34 – 4,98' },
    { code: 'V.05.01.03', name: 'Nghiên cứu viên (hạng III — Bậc 3)', frameworkTitle: 'Nghiên cứu viên (hạng III)', specificNameSuffix: '', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 3', allowedCareerLevels: ['Bậc 3'], group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 24 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Đặc thù', standardHoursPerYear: 1760, defaultCount: 2, salaryGroup: 'A1 · Bậc 3', salaryRange: '2,34 – 4,98' },
    { code: '01.003', name: 'Chuyên viên (Từ bậc 3 đến bậc 4)', frameworkTitle: 'Chuyên viên', specificNameSuffix: 'điều phối đào tạo, hợp tác và hành chính', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 27 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 4, salaryGroup: 'A1 · Bậc 3–4', salaryRange: '2,34 – 4,98' },
    { code: 'V.05.02.07', name: 'Nhân sự phụ trách xưởng/phòng thí nghiệm (Bậc 2)', frameworkTitle: 'Nhân sự phụ trách xưởng/phòng thí nghiệm', specificNameSuffix: 'vận hành phòng máy và thực hành', vtvlGroup4: G3, defaultCareerLevel: 'Bậc 2', allowedCareerLevels: ['Bậc 2'], group: 'Nhóm III — Hỗ trợ (TT 35 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 3, salaryGroup: 'Bậc 2', salaryRange: '2,06 – 4,98' }
  ],
  'dang-doanthe': [
    { code: 'QL-CVP', name: 'Chánh văn phòng', frameworkTitle: 'Chánh văn phòng', specificNameSuffix: '', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (TT 7 Phụ lục I HD 1907)', personnelType: 'Cán bộ', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 1, salaryGroup: 'Quản lý Văn phòng', salaryRange: 'Phụ cấp CV' },
    { code: 'QL-PCVP', name: 'Phó Chánh văn phòng', frameworkTitle: 'Phó Chánh văn phòng', specificNameSuffix: 'phụ trách tổng hợp', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, group: 'Nhóm I — VTVL Quản lý (TT 14 Phụ lục I HD 1907)', personnelType: 'Cán bộ', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 1, salaryGroup: 'Quản lý Văn phòng', salaryRange: 'Phụ cấp CV' },
    { code: '01.003', name: 'Chuyên viên (Từ bậc 3 đến bậc 4)', frameworkTitle: 'Chuyên viên', specificNameSuffix: 'công tác Đảng, Hội đồng trường và Đoàn thể', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, group: 'Nhóm II — Chuyên môn, nghiệp vụ (TT 27 Phụ lục I HD 1907)', personnelType: 'Viên chức', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 5, salaryGroup: 'A1 · Bậc 3–4', salaryRange: '2,34 – 4,98' },
    { code: 'NV-PV', name: 'Nhân viên lễ tân, phục vụ, tạp vụ (Từ bậc 1 đến bậc 2)', frameworkTitle: 'Nhân viên lễ tân, phục vụ, tạp vụ', specificNameSuffix: 'phục vụ hội nghị và hành chính', vtvlGroup4: G4, defaultCareerLevel: 'Từ bậc 1 đến bậc 2', allowedCareerLevels: LVL_1_2, group: 'Nhóm IV — Phục vụ (TT 40 Phụ lục I HD 1907)', personnelType: 'Hợp đồng lao động', workingRegime: 'Phổ biến (40 giờ/tuần)', standardHoursPerYear: 1904, defaultCount: 1, salaryGroup: 'Bậc 1–2', salaryRange: '1,86 – 4,06' }
  ]
};

export const TASK_TEMPLATES_BY_GROUP: Record<UnitGroupKind, JobTaskTemplate[]> = {
  'khoa-vien': [
    {
      stt: 1, vtvlSuffix: 'QL-01', vtvlName: 'Trưởng khoa', frameworkTitle: 'Trưởng khoa', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, ngachCode: 'QL-TK', method: 'PP1',
      missionSuffix: 'NV01', taskSuffix: 'NV01-CV01',
      taskName: 'Quản lý, điều hành chung hoạt động Khoa/Viện; xây dựng chiến lược phát triển, kế hoạch đào tạo và đề án vị trí việc làm theo HD 1907/HD-ĐHCNKT',
      productName: 'Kế hoạch năm học & Báo cáo tổng kết', productCode: 'SP-I-01', romanGroup: 'I', unitName: 'Bộ hồ sơ',
      qualityRequirement: 'Được Ban Giám hiệu phê duyệt đúng hạn',
      sourceHint: 'Nghị quyết Đảng ủy & Kế hoạch chiến lược HCM-UTE', defaultQtyPerYear: 4, defaultMinutesPerProduct: 1800,
      extraRelatedHoursYear: 120, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'Hướng dẫn số 02 (1907/HD-ĐHCNKT), Nghị định 232/2026/NĐ-CP & TT 31/2026/TT-BGDĐT', competencyLevel: 'Không áp dụng bậc (Nhóm I — VTVL Quản lý cấp Khoa/Viện)'
    },
    {
      stt: 2, vtvlSuffix: 'QL-02', vtvlName: 'Phó Trưởng khoa', frameworkTitle: 'Phó Trưởng khoa', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, ngachCode: 'QL-PTK', method: 'PP1+PP2',
      missionSuffix: 'NV01', taskSuffix: 'NV01-CV02',
      taskName: 'Điều hành công tác đào tạo, đảm bảo chất lượng kiểm định (AUN-QA, ABET), NCKH và cơ sở vật chất theo phân công của Trưởng khoa',
      productName: 'Báo cáo tự đánh giá & Hồ sơ cải tiến', productCode: 'SP-II-01', romanGroup: 'II', unitName: 'Báo cáo',
      qualityRequirement: 'Đạt chuẩn kiểm định trong nước và quốc tế',
      sourceHint: 'Hệ thống quản lý chất lượng QAO & Phòng Đào tạo', defaultQtyPerYear: 12, defaultMinutesPerProduct: 960,
      extraRelatedHoursYear: 90, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT) & Nghị định 232/2026/NĐ-CP', competencyLevel: 'Không áp dụng bậc (Nhóm I — VTVL Quản lý cấp Khoa/Viện)'
    },
    {
      stt: 3, vtvlSuffix: 'QL-03', vtvlName: 'Trưởng Bộ môn / Trưởng Ngành / Phó Trưởng Bộ môn', frameworkTitle: 'Trưởng Bộ môn', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, ngachCode: 'QL-TBM', method: 'PP1+PP2',
      missionSuffix: 'NV01', taskSuffix: 'NV01-CV03',
      taskName: 'Quản lý chuyên môn Bộ môn và chương trình đào tạo Ngành; phân công giảng dạy, duyệt đề thi và phát triển học liệu',
      productName: 'Bảng phân công chuyên môn & Hồ sơ CTĐT', productCode: 'SP-II-01', romanGroup: 'II', unitName: 'Bộ hồ sơ',
      qualityRequirement: 'Đảm bảo chuẩn đầu ra CTĐT và tiến độ giảng dạy',
      sourceHint: 'Kế hoạch đào tạo Khoa/Viện & biên bản họp Bộ môn', defaultQtyPerYear: 16, defaultMinutesPerProduct: 960,
      extraRelatedHoursYear: 100, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 17, 18, 19 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Không áp dụng bậc (Nhóm I — VTVL Quản lý Bộ môn/Ngành)'
    },
    {
      stt: 4, vtvlSuffix: 'DT-GV-01', vtvlName: 'Giảng viên cao cấp', frameworkTitle: 'Giảng viên cao cấp', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 5', allowedCareerLevels: ['Bậc 5'], ngachCode: 'V.07.01.01', method: 'PP2',
      missionSuffix: 'NV02', taskSuffix: 'NV02-CV01',
      taskName: 'Giảng dạy đại học, sau đại học, hướng dẫn NCS tiến sĩ và chủ trì đề tài NCKH cấp Bộ/Nhà nước',
      productName: 'Học phần giảng dạy & Công bố quốc tế WoS/Scopus', productCode: 'SP-III-01', romanGroup: 'III', unitName: 'Học phần / Bài báo',
      qualityRequirement: 'Nghiệm thu đúng tiến độ, công bố thuộc danh mục uy tín',
      sourceHint: 'Hệ thống quản lý đào tạo & Phòng KHCN (STIAO)', defaultQtyPerYear: 18, defaultMinutesPerProduct: 2550,
      extraRelatedHoursYear: 180, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 22 Phụ lục I HD 1907/HD-ĐHCNKT; NĐ 232/2026/NĐ-CP & Điều 14 TT 31/2026/TT-BGDĐT', competencyLevel: 'Bậc 5 (Nhóm II — VTVL Chuyên môn, nghiệp vụ)'
    },
    {
      stt: 5, vtvlSuffix: 'DT-GV-02', vtvlName: 'Giảng viên chính', frameworkTitle: 'Giảng viên chính', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 4', allowedCareerLevels: ['Bậc 4'], ngachCode: 'V.07.01.02', method: 'PP2',
      missionSuffix: 'NV02', taskSuffix: 'NV02-CV02',
      taskName: 'Giảng dạy lý thuyết/thực hành, biên soạn giáo trình, hướng dẫn đồ án tốt nghiệp và cao học',
      productName: 'Lớp học phần & Đồ án tốt nghiệp hoàn thành', productCode: 'SP-III-01', romanGroup: 'III', unitName: 'Lớp học phần',
      qualityRequirement: 'Đảm bảo chuẩn đầu ra CTĐT và tiến độ đào tạo',
      sourceHint: 'Bảng phân công giảng dạy học kỳ I, II, Hè trên hệ thống online.hcmute.edu.vn', defaultQtyPerYear: 45, defaultMinutesPerProduct: 2550,
      extraRelatedHoursYear: 240, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 21 Phụ lục I HD 1907/HD-ĐHCNKT; NĐ 232/2026/NĐ-CP & Điều 14 TT 31/2026/TT-BGDĐT', competencyLevel: 'Bậc 4 (Nhóm II — VTVL Chuyên môn, nghiệp vụ)',
      digitalImpactStage: 'Ứng dụng hệ thống LMS UTEx chấm điểm & quản lý học liệu số', digitalMinutesBefore: 2550, digitalMinutesAfter: 2370
    },
    {
      stt: 6, vtvlSuffix: 'DT-GV-03', vtvlName: 'Giảng viên', frameworkTitle: 'Giảng viên', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 3', allowedCareerLevels: ['Bậc 3'], ngachCode: 'V.07.01.03', method: 'PP2',
      missionSuffix: 'NV02', taskSuffix: 'NV02-CV03',
      taskName: 'Giảng dạy các học phần đại cương/cơ sở ngành, chấm thi, cố vấn học tập và xây dựng học liệu số UTEx',
      productName: 'Học phần giảng dạy & Đề thi/Ngân hàng câu hỏi', productCode: 'SP-III-01', romanGroup: 'III', unitName: 'Học phần',
      qualityRequirement: 'Hoàn thành 100% kế hoạch giảng dạy và nhập điểm đúng hạn',
      sourceHint: 'Hệ thống UTEx LMS & Bảng chấm công giảng dạy', defaultQtyPerYear: 55, defaultMinutesPerProduct: 2550,
      extraRelatedHoursYear: 260, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 20 Phụ lục I HD 1907/HD-ĐHCNKT; NĐ 232/2026/NĐ-CP & Điều 14 TT 31/2026/TT-BGDĐT', competencyLevel: 'Bậc 3 (Nhóm II — VTVL Chuyên môn, nghiệp vụ)'
    },
    {
      stt: 7, vtvlSuffix: 'HC-TKK-01', vtvlName: 'Thư ký khoa', frameworkTitle: 'Chuyên viên', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, ngachCode: '01.003', method: 'PP2',
      missionSuffix: 'NV04', taskSuffix: 'NV04-CV01',
      taskName: 'Thực hiện công tác hành chính, văn thư, tổng hợp, quản lý giáo vụ, hồ sơ sinh viên và quản trị website Khoa/Viện',
      productName: 'Hồ sơ học vụ – hành chính xử lý & Tin bài cập nhật', productCode: 'SP-V-01', romanGroup: 'V', unitName: 'Hồ sơ / Văn bản',
      qualityRequirement: 'Đúng quy trình ISO, không trễ hạn xử lý trên E-Office',
      sourceHint: 'Hệ thống E-Office & Cổng thông tin đơn vị *.hcmute.edu.vn', defaultQtyPerYear: 1100, defaultMinutesPerProduct: 90,
      extraRelatedHoursYear: 160, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 27 Phụ lục I & Phụ lục II Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Từ bậc 3 đến bậc 4 (Nhóm II — Chuyên viên / Thư ký khoa)'
    },
    {
      stt: 8, vtvlSuffix: 'HT-PTN-01', vtvlName: 'Nhân sự phụ trách phòng thí nghiệm', frameworkTitle: 'Nhân sự phụ trách xưởng/phòng thí nghiệm', vtvlGroup4: G3, defaultCareerLevel: 'Bậc 2', allowedCareerLevels: ['Bậc 2'], ngachCode: 'V.05.02.07', method: 'PP2',
      missionSuffix: 'NV03', taskSuffix: 'NV03-CV01',
      taskName: 'Quản lý, vận hành trang thiết bị, chuẩn bị vật tư thực hành, bảo trì máy móc và đảm bảo an toàn phòng thí nghiệm/xưởng',
      productName: 'Ca thực hành an toàn & Biên bản bảo trì thiết bị', productCode: 'SP-VI-01', romanGroup: 'VI', unitName: 'Ca thực hành',
      qualityRequirement: 'Thiết bị sẵn sàng 100%, an toàn tuyệt đối cho người học',
      sourceHint: 'Sổ nhật ký vận hành phòng thí nghiệm/xưởng', defaultQtyPerYear: 360, defaultMinutesPerProduct: 180,
      extraRelatedHoursYear: 120, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 35 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT) & NĐ 232/2026/NĐ-CP', competencyLevel: 'Bậc 2 (Nhóm III — VTVL Hỗ trợ)'
    }
  ],
  'phong-ban': [
    {
      stt: 1, vtvlSuffix: 'QL-01', vtvlName: 'Trưởng phòng', frameworkTitle: 'Trưởng phòng', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, ngachCode: 'QL-TP', method: 'PP1',
      missionSuffix: 'NV01', taskSuffix: 'NV01-CV01',
      taskName: 'Tham mưu Ban Giám hiệu chiến lược lĩnh vực phụ trách, phê duyệt kế hoạch và điều phối toàn đơn vị chức năng',
      productName: 'Tờ trình, Quyết định, Kế hoạch cấp Trường', productCode: 'SP-I-01', romanGroup: 'I', unitName: 'Văn bản',
      qualityRequirement: 'Đúng thẩm quyền, thể thức Nghị định 30/2020/NĐ-CP',
      sourceHint: 'Hệ thống E-Office HCM-UTE', defaultQtyPerYear: 55, defaultMinutesPerProduct: 1800,
      extraRelatedHoursYear: 180, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 5 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT) & Nghị định 232/2026/NĐ-CP', competencyLevel: 'Không áp dụng bậc (Nhóm I — VTVL Quản lý)'
    },
    {
      stt: 2, vtvlSuffix: 'QL-02', vtvlName: 'Phó Trưởng phòng', frameworkTitle: 'Phó Trưởng phòng', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, ngachCode: 'QL-PTP', method: 'PP1+PP2',
      missionSuffix: 'NV01', taskSuffix: 'NV01-CV02',
      taskName: 'Trực tiếp phụ trách mảng chuyên môn, thẩm định hồ sơ nghiệp vụ và kiểm soát tiến độ công việc',
      productName: 'Hồ sơ thẩm định & Báo cáo chuyên đề', productCode: 'SP-II-01', romanGroup: 'II', unitName: 'Bộ hồ sơ',
      qualityRequirement: 'Thẩm định chặt chẽ, đầy đủ căn cứ pháp lý',
      sourceHint: 'Hệ thống quản lý công việc nội bộ', defaultQtyPerYear: 110, defaultMinutesPerProduct: 960,
      extraRelatedHoursYear: 150, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 12 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Không áp dụng bậc (Nhóm I — VTVL Quản lý)'
    },
    {
      stt: 3, vtvlSuffix: 'CM-CV-01', vtvlName: 'Chuyên viên quản lý nghiệp vụ', frameworkTitle: 'Chuyên viên', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, ngachCode: '01.003', method: 'PP2',
      missionSuffix: 'NV02', taskSuffix: 'NV02-CV01',
      taskName: 'Tham mưu xây dựng quy chế, đề án VTVL, giải quyết thủ tục chuyên môn nghiệp vụ và tổng hợp báo cáo theo lĩnh vực phụ trách',
      productName: 'Đề án / Quy chế / Hồ sơ nghiệp vụ hoàn thành', productCode: 'SP-I-01', romanGroup: 'I', unitName: 'Văn bản / Hồ sơ',
      qualityRequirement: 'Chuẩn xác số liệu, đúng quy định pháp luật và ISO HCM-UTE',
      sourceHint: 'Hệ thống văn bản điều hành E-Office & phần mềm nghiệp vụ', defaultQtyPerYear: 80, defaultMinutesPerProduct: 1800,
      extraRelatedHoursYear: 160, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 27 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT) & Nghị định 232/2026/NĐ-CP', competencyLevel: 'Từ bậc 3 đến bậc 4 (Nhóm II — VTVL Chuyên môn, nghiệp vụ)',
      digitalImpactStage: 'Số hóa biểu mẫu và tự động tổng hợp dữ liệu VTVL', digitalMinutesBefore: 1800, digitalMinutesAfter: 1560
    },
    {
      stt: 4, vtvlSuffix: 'CM-KTV-01', vtvlName: 'Kế toán viên / Thư viện viên / Y tế', frameworkTitle: 'Kế toán viên', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, ngachCode: '06.031', method: 'PP2',
      missionSuffix: 'NV02', taskSuffix: 'NV02-CV02',
      taskName: 'Thực hiện nghiệp vụ kế toán tài chính, quản trị thông tin thư viện hoặc chăm sóc sức khỏe học đường tại đơn vị chức năng',
      productName: 'Hồ sơ chứng từ / Học liệu biên mục / Hồ sơ y tế', productCode: 'SP-V-01', romanGroup: 'V', unitName: 'Hồ sơ',
      qualityRequirement: 'Giải quyết đúng hạn 100% theo quy trình ISO',
      sourceHint: 'Phần mềm nghiệp vụ chuyên ngành HCM-UTE', defaultQtyPerYear: 1800, defaultMinutesPerProduct: 90,
      extraRelatedHoursYear: 180, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 26, 30, 31, 33 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Từ bậc 3 đến bậc 4 (Nhóm II — VTVL Chuyên môn, nghiệp vụ)'
    },
    {
      stt: 5, vtvlSuffix: 'PV-KT-01', vtvlName: 'Nhân viên kỹ thuật, lái xe, bảo vệ, lễ tân', frameworkTitle: 'Nhân viên kỹ thuật', vtvlGroup4: G4, defaultCareerLevel: 'Từ bậc 1 đến bậc 2', allowedCareerLevels: LVL_1_2, ngachCode: 'NV-KT', method: 'PP2',
      missionSuffix: 'NV03', taskSuffix: 'NV03-CV01',
      taskName: 'Vận hành hệ thống kỹ thuật hạ tầng, lái xe công vụ, đảm bảo an ninh trật tự và lễ tân phục vụ hậu cần',
      productName: 'Ca trực vận hành an toàn & Hồ sơ phục vụ', productCode: 'SP-V-02', romanGroup: 'V', unitName: 'Ca / Hồ sơ',
      qualityRequirement: 'An toàn, chu đáo, đúng quy định nội vụ',
      sourceHint: 'Sổ nhật ký vận hành hạ tầng & Lịch điều động công tác', defaultQtyPerYear: 4200, defaultMinutesPerProduct: 25,
      extraRelatedHoursYear: 160, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 37–40 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Từ bậc 1 đến bậc 2 (Nhóm IV — VTVL Phục vụ)'
    }
  ],
  'trung-tam': [
    {
      stt: 1, vtvlSuffix: 'QL-01', vtvlName: 'Giám đốc', frameworkTitle: 'Giám đốc', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, ngachCode: 'QL-GD', method: 'PP1',
      missionSuffix: 'NV01', taskSuffix: 'NV01-CV01',
      taskName: 'Quản lý điều hành hoạt động đào tạo, nghiên cứu, chuyển giao công nghệ và dịch vụ của Trung tâm / Phân hiệu',
      productName: 'Kế hoạch hoạt động & Báo cáo tài chính – chuyên môn', productCode: 'SP-I-01', romanGroup: 'I', unitName: 'Báo cáo',
      qualityRequirement: 'Đảm bảo chỉ tiêu tự chủ và chất lượng dịch vụ',
      sourceHint: 'Báo cáo kết quả hoạt động hằng quý/năm', defaultQtyPerYear: 16, defaultMinutesPerProduct: 1800,
      extraRelatedHoursYear: 120, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 6, 8 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Không áp dụng bậc (Nhóm I — VTVL Quản lý)'
    },
    {
      stt: 2, vtvlSuffix: 'CM-NC-01', vtvlName: 'Giảng viên', frameworkTitle: 'Giảng viên', vtvlGroup4: G2, defaultCareerLevel: 'Bậc 3', allowedCareerLevels: ['Bậc 3'], ngachCode: 'V.07.01.03', method: 'PP2',
      missionSuffix: 'NV02', taskSuffix: 'NV02-CV01',
      taskName: 'Triển khai khóa đào tạo, bồi dưỡng ngắn hạn, dự án ươm tạo khởi nghiệp và hợp đồng chuyển giao công nghệ',
      productName: 'Khóa học / Dự án ươm tạo / Hợp đồng KHCN', productCode: 'SP-IV-01', romanGroup: 'IV', unitName: 'Khóa / Hợp đồng',
      qualityRequirement: 'Nghiệm thu đạt yêu cầu của đối tác và Nhà trường',
      sourceHint: 'Hồ sơ nghiệm thu hợp đồng & Danh sách học viên', defaultQtyPerYear: 120, defaultMinutesPerProduct: 1200,
      extraRelatedHoursYear: 180, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 20, 24 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Bậc 3 (Nhóm II — VTVL Chuyên môn, nghiệp vụ)'
    },
    {
      stt: 3, vtvlSuffix: 'HC-DP-01', vtvlName: 'Chuyên viên điều phối và hành chính', frameworkTitle: 'Chuyên viên', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, ngachCode: '01.003', method: 'PP2',
      missionSuffix: 'NV03', taskSuffix: 'NV03-CV01',
      taskName: 'Tư vấn ghi danh, quản lý lớp học, theo dõi hợp đồng dịch vụ và công tác hành chính trung tâm',
      productName: 'Lớp học/Hồ sơ đối tác hoàn thành', productCode: 'SP-V-01', romanGroup: 'V', unitName: 'Hồ sơ',
      qualityRequirement: 'Đầy đủ chứng từ, hồ sơ lưu trữ',
      sourceHint: 'Phần mềm quản lý học viên & chứng chỉ', defaultQtyPerYear: 1400, defaultMinutesPerProduct: 90,
      extraRelatedHoursYear: 140, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 27 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Từ bậc 3 đến bậc 4 (Nhóm II — VTVL Chuyên môn, nghiệp vụ)'
    },
    {
      stt: 4, vtvlSuffix: 'HT-PTN-01', vtvlName: 'Nhân sự phụ trách phòng thí nghiệm', frameworkTitle: 'Nhân sự phụ trách xưởng/phòng thí nghiệm', vtvlGroup4: G3, defaultCareerLevel: 'Bậc 2', allowedCareerLevels: ['Bậc 2'], ngachCode: 'V.05.02.07', method: 'PP2',
      missionSuffix: 'NV03', taskSuffix: 'NV03-CV02',
      taskName: 'Quản trị hệ thống phòng máy, thiết bị thực hành, số hóa tài liệu học liệu và hỗ trợ kỹ thuật dạy học số',
      productName: 'Hệ thống vận hành ổn định & Học liệu số hóa', productCode: 'SP-VI-01', romanGroup: 'VI', unitName: 'Đầu việc / Tài liệu',
      qualityRequirement: 'Uptime hệ thống >= 99.5%, an toàn thông tin',
      sourceHint: 'Hệ thống giám sát hạ tầng & Kho học liệu số HCM-UTE', defaultQtyPerYear: 1000, defaultMinutesPerProduct: 180,
      extraRelatedHoursYear: 140, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 35 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Bậc 2 (Nhóm III — VTVL Hỗ trợ)'
    }
  ],
  'dang-doanthe': [
    {
      stt: 1, vtvlSuffix: 'LD-01', vtvlName: 'Chánh văn phòng', frameworkTitle: 'Chánh văn phòng', vtvlGroup4: G1, defaultCareerLevel: 'Không áp dụng bậc', allowedCareerLevels: NO_LVL, ngachCode: 'QL-CVP', method: 'PP1',
      missionSuffix: 'NV01', taskSuffix: 'NV01-CV01',
      taskName: 'Tham mưu, điều phối xây dựng nghị quyết, chương trình công tác năm và giám sát thực hiện dân chủ cơ sở',
      productName: 'Nghị quyết / Chương trình công tác năm', productCode: 'SP-I-01', romanGroup: 'I', unitName: 'Văn bản',
      qualityRequirement: 'Đúng quy định của Đảng, pháp luật của Nhà nước',
      sourceHint: 'Hệ thống văn kiện Đảng ủy – Hội đồng trường – Đoàn thể HCM-UTE', defaultQtyPerYear: 36, defaultMinutesPerProduct: 1800,
      extraRelatedHoursYear: 140, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 7, 14 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Không áp dụng bậc (Nhóm I — VTVL Quản lý)'
    },
    {
      stt: 2, vtvlSuffix: 'TC-CV-01', vtvlName: 'Chuyên viên văn phòng Đảng – Đoàn thể', frameworkTitle: 'Chuyên viên', vtvlGroup4: G2, defaultCareerLevel: 'Từ bậc 3 đến bậc 4', allowedCareerLevels: LVL_3_4, ngachCode: '01.003', method: 'PP2',
      missionSuffix: 'NV02', taskSuffix: 'NV02-CV01',
      taskName: 'Tham mưu công tác tổ chức xây dựng Đảng, phục vụ kỳ họp Hội đồng trường và tổ chức phong trào Công đoàn, Đoàn – Hội',
      productName: 'Hồ sơ đảng viên / Nghị quyết kỳ họp / Chương trình đoàn thể', productCode: 'SP-II-01', romanGroup: 'II', unitName: 'Bộ hồ sơ',
      qualityRequirement: 'Chặt chẽ, bảo mật, thiết thực, đúng quy định',
      sourceHint: 'Cơ sở dữ liệu đảng viên & Hồ sơ kỳ họp Hội đồng trường', defaultQtyPerYear: 160, defaultMinutesPerProduct: 960,
      extraRelatedHoursYear: 160, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 27 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Từ bậc 3 đến bậc 4 (Nhóm II — VTVL Chuyên môn, nghiệp vụ)'
    },
    {
      stt: 3, vtvlSuffix: 'PV-LT-01', vtvlName: 'Nhân viên lễ tân, phục vụ, tạp vụ', frameworkTitle: 'Nhân viên lễ tân, phục vụ, tạp vụ', vtvlGroup4: G4, defaultCareerLevel: 'Từ bậc 1 đến bậc 2', allowedCareerLevels: LVL_1_2, ngachCode: 'NV-PV', method: 'PP2',
      missionSuffix: 'NV03', taskSuffix: 'NV03-CV01',
      taskName: 'Phục vụ hậu cần, lễ tân khánh tiết các hội nghị, kỳ họp của Đảng ủy, Hội đồng trường và các đoàn thể',
      productName: 'Kỳ họp / Hội nghị phục vụ chu đáo', productCode: 'SP-V-02', romanGroup: 'V', unitName: 'Hội nghị / Sự kiện',
      qualityRequirement: 'Chu đáo, trang trọng, đúng nghi thức',
      sourceHint: 'Lịch công tác tuần của Đảng ủy – Hội đồng trường', defaultQtyPerYear: 900, defaultMinutesPerProduct: 90,
      extraRelatedHoursYear: 120, timeBasisStatus: 'Có định mức',
      legalBasisHint: 'TT 40 Phụ lục I Hướng dẫn số 02 (1907/HD-ĐHCNKT)', competencyLevel: 'Từ bậc 1 đến bậc 2 (Nhóm IV — VTVL Phục vụ)'
    }
  ]
};
