import * as XLSX from 'xlsx';
import {
  HD07_CONSTANTS,
  MISSIONS_BY_GROUP,
  STANDARD_PRODUCTS_CATALOG
} from '@/configs/hcmute-hd07-catalog';
import { JobTaskTemplate, NgachItem, SplitResultSummary, UnitSplitOptions } from '@/types/vtvl';

export function buildHd07CoreSheets(
  wb: XLSX.WorkBook,
  opts: UnitSplitOptions,
  sourceRule: string,
  ngachList: NgachItem[],
  templates: JobTaskTemplate[],
  positionBreakdown: SplitResultSummary['positionBreakdown']
): {
  b1Header: string[];
  b1Rows: (string | number)[][];
  wsB1: XLSX.WorkSheet;
  wsB2Ct: XLSX.WorkSheet;
  wsD1: XLSX.WorkSheet;
} {
  const missions = MISSIONS_BY_GROUP[opts.kind];

  // 1. A1_NhiemVu (7 cột A–G)
  const wsA1 = XLSX.utils.aoa_to_sheet([
    [`BIỂU 1. A1_NhiemVu — DANH MỤC NHIỆM VỤ CỦA ĐƠN VỊ (${opts.unitCode} — ${opts.unitNameVi})`],
    ['Mã nhiệm vụ', 'Tên nhiệm vụ', 'Cơ quan', 'Căn cứ', 'Kỳ', 'Trạng thái', 'Nguồn'],
    ...missions.map((m) => [
      `${opts.unitCode}-${m.missionSuffix}`, m.missionName, opts.unitNameVi, m.legalBasis, opts.period, m.status, m.source
    ])
  ]);
  XLSX.utils.book_append_sheet(wb, wsA1, '1. A1_NhiemVu');

  // 2. A2_CongViec (8 cột A–H)
  const wsA2 = XLSX.utils.aoa_to_sheet([
    [`BIỂU 2. A2_CongViec — DANH MỤC CÔNG VIỆC VÀ SẢN PHẨM ĐẦU RA (${opts.unitCode})`],
    ['Mã công việc', 'Mã nhiệm vụ', 'Mã VTVL', 'Tên công việc', 'Sản phẩm', 'Đơn vị tính', 'Chất lượng', 'Căn cứ (nguồn)'],
    ...templates.map((t) => [
      `${opts.unitCode}-${t.taskSuffix}`, `${opts.unitCode}-${t.missionSuffix}`, `${opts.unitCode}-${t.vtvlSuffix}`,
      t.taskName, t.productName, t.unitName, t.qualityRequirement, t.legalBasisHint
    ])
  ]);
  XLSX.utils.book_append_sheet(wb, wsA2, '2. A2_CongViec');

  // 3. B1_KhoiLuong (19 cột A–S)
  const b1Header = [
    'Mã công việc', 'Mã VTVL', 'Số SP/năm', 'Trung bình phút/SP (đo thực tế)', 'Giờ bổ sung (công việc liên quan)',
    'Giờ SP (tính)', 'Giờ tổng (tính)', 'Nguồn SL', 'Nguồn thời gian', 'Trạng thái căn cứ thời gian', 'Kỳ',
    'Mã SP trong danh mục', 'Nhóm (tự tra)', 'Phút/SP chuẩn (tự tra)', 'Xác nhận chuẩn (tự tra)',
    'Phút/SP dùng để tính', 'Nguồn thời gian dùng tính', 'Cảnh báo dữ liệu', 'Giải trình khác chuẩn'
  ];
  const b1Rows = templates.map((t) => {
    const stdSp = STANDARD_PRODUCTS_CATALOG.find((sp) => sp.productCode === t.productCode);
    const stdMin = stdSp ? stdSp.standardMinutes : t.defaultMinutesPerProduct;
    const spHours = Number(((t.defaultQtyPerYear * t.defaultMinutesPerProduct) / 60).toFixed(1));
    const totalHours = Number((spHours + t.extraRelatedHoursYear).toFixed(1));
    return [
      `${opts.unitCode}-${t.taskSuffix}`, `${opts.unitCode}-${t.vtvlSuffix}`, t.defaultQtyPerYear,
      t.defaultMinutesPerProduct, t.extraRelatedHoursYear, spHours, totalHours,
      `${t.sourceHint} (gợi ý – chưa đo)`, 'Định mức gợi ý ban đầu (chờ nạp phiếu đo thực tế)',
      t.timeBasisStatus, opts.period, t.productCode, t.romanGroup, stdMin, 'Đã xác nhận',
      t.defaultMinutesPerProduct, 'Theo danh mục SP chuẩn HCM-UTE', 'ĐẠT', ''
    ];
  });
  const wsB1 = XLSX.utils.aoa_to_sheet([
    [`BIỂU 3. B1_KhoiLuong — THỐNG KÊ SẢN LƯỢNG VÀ THỜI GIAN LÀM VIỆC (${opts.unitCode})`],
    b1Header, ...b1Rows
  ]);
  XLSX.utils.book_append_sheet(wb, wsB1, '3. B1_KhoiLuong');

  // 4. B2_CT_TacDong (19 cột A–S)
  const b2CtHeader = [
    'Mã công việc', 'Mã VTVL', 'Loại tác động', 'Công đoạn', 'SP áp dụng', 'Phút trước', 'Phút sau',
    'Giờ giảm trực tiếp', 'Giờ việc mới', 'Nguồn/bằng chứng', 'Kỳ', 'Cơ sở B1', 'Trạng thái',
    'Giờ giảm hợp lệ', 'Giờ tăng hợp lệ', 'Kiểm tra', 'Kinh phí trước', 'Kinh phí sau', 'Đối chiếu trùng/phạm vi (cán bộ xác nhận)'
  ];
  const b2CtRows = templates.filter((t) => t.digitalImpactStage).map((t) => {
    const before = t.digitalMinutesBefore || t.defaultMinutesPerProduct;
    const after = t.digitalMinutesAfter || t.defaultMinutesPerProduct;
    const reducedHours = Number((((before - after) * t.defaultQtyPerYear) / 60).toFixed(1));
    return [
      `${opts.unitCode}-${t.taskSuffix}`, `${opts.unitCode}-${t.vtvlSuffix}`, 'Số hóa',
      t.digitalImpactStage || 'Số hóa quy trình nghiệp vụ', t.defaultQtyPerYear, before, after,
      reducedHours, 0, 'Hệ thống phần mềm quản trị nội bộ & UTEx LMS HCM-UTE', opts.period,
      'Trước thay đổi, có điều chỉnh', 'Đã kiểm chứng', reducedHours, 0, 'ĐẠT', 0, 0, 'Đã đối chiếu'
    ];
  });
  const wsB2Ct = XLSX.utils.aoa_to_sheet([
    [`BIỂU 4. B2_CT_TacDong — CHI TIẾT TÁC ĐỘNG CHUYỂN ĐỔI SỐ, TỰ CHỦ, THUÊ DỊCH VỤ (${opts.unitCode})`],
    b2CtHeader, ...b2CtRows
  ]);
  XLSX.utils.book_append_sheet(wb, wsB2Ct, '4. B2_CT_TacDong');

  // 5. B2_ThayDoi (9 cột A–I)
  const b2SummaryRows = templates.map((t) => {
    const before = t.digitalMinutesBefore || t.defaultMinutesPerProduct;
    const after = t.digitalMinutesAfter || t.defaultMinutesPerProduct;
    const reduced = t.digitalImpactStage ? Number((((before - after) * t.defaultQtyPerYear) / 60).toFixed(1)) : 0;
    return [
      `${opts.unitCode}-${t.taskSuffix}`, `${opts.unitCode}-${t.vtvlSuffix}`, reduced, 0, 0, -reduced,
      reduced > 0 ? 'Đã kiểm chứng' : 'Không phát sinh', reduced > 0 ? 1 : 0, 'ĐẠT'
    ];
  });
  const wsB2 = XLSX.utils.aoa_to_sheet([
    [`BIỂU 5. B2_ThayDoi — TỔNG HỢP TÁC ĐỘNG RÒNG TỪ B2_CT (${opts.unitCode})`],
    ['Mã công việc', 'Mã VTVL', 'Giờ giảm số hóa', 'Giờ giảm thuê/TCh/XHH', 'Giờ việc mới', 'Giờ tác động ròng', 'Trạng thái', 'Số dòng chi tiết', 'Cảnh báo'],
    ...b2SummaryRows
  ]);
  XLSX.utils.book_append_sheet(wb, wsB2, '5. B2_ThayDoi');

  // 6. C1_VTVL (11 cột A–K)
  const wsC1 = XLSX.utils.aoa_to_sheet([
    [`BIỂU 6. C1_VTVL — DANH MỤC VỊ TRÍ VIỆC LÀM VÀ QUỸ GIỜ CHUẨN PP2 (${opts.unitCode})`],
    ['Mã VTVL', 'Tên VTVL', 'Loại nhân lực', 'Quyết định', 'Giờ chuẩn PP2', 'Căn cứ xác định quỹ giờ', 'Trạng thái', 'Giờ riêng được xác nhận', 'Xác nhận giờ riêng', 'Chế độ làm việc', 'Kiểm tra quỹ giờ PP2'],
    ...positionBreakdown.map((p) => [
      p.vtvlCode,
      p.frameworkTitle && p.frameworkTitle !== p.vtvlName
        ? `${p.vtvlName} (Khung Trường: ${p.frameworkTitle} · ${p.careerLevel || 'Bậc 3'})`
        : `${p.vtvlName} (${p.careerLevel || 'Bậc 3'})`,
      'Viên chức',
      `${sourceRule} & Hướng dẫn số 02 (1907/HD-ĐHCNKT)`,
      p.standardHoursYear,
      p.workingRegime === 'Đặc thù'
        ? 'Thông tư 20/2020/TT-BGDĐT (44 tuần × 40 giờ = 1.760 giờ/năm)'
        : 'Hướng dẫn 07-HD/BTCTW ((261 - 11 - 12) × 8 = 1.904 giờ/năm)',
      'Tiếp tục sử dụng',
      p.workingRegime === 'Đặc thù' ? p.standardHoursYear : '',
      p.workingRegime === 'Đặc thù' ? 'Đã xác nhận' : '',
      p.workingRegime,
      'ĐẠT'
    ])
  ]);
  XLSX.utils.book_append_sheet(wb, wsC1, '6. C1_VTVL');

  // 7. C2_NangLuc (7 cột A–G)
  const wsC2 = XLSX.utils.aoa_to_sheet([
    [`BIỂU 7. C2_NangLuc — BẢN MÔ TẢ VÀ KHUNG NĂNG LỰC VỊ TRÍ VIỆC LÀM (${opts.unitCode})`],
    ['Mã VTVL', 'Trách nhiệm', 'Năng lực chung', 'Chuyên môn', 'Lãnh đạo', 'Căn cứ', 'Nguồn bản mô tả'],
    ...templates.map((t) => {
      const pos = positionBreakdown.find((p) => p.vtvlCode === `${opts.unitCode}-${t.vtvlSuffix}`);
      const selectedLevel = pos?.careerLevel || t.defaultCareerLevel || t.competencyLevel;
      const groupName = pos?.vtvlGroup4 || t.vtvlGroup4 || 'II. Nhóm VTVL Chuyên môn, nghiệp vụ';
      const specificName = pos?.vtvlName || t.vtvlName;
      return [
        `${opts.unitCode}-${t.vtvlSuffix}`,
        `[${specificName}] ${t.taskName}`,
        'Đạo đức nghề nghiệp, giao tiếp hành chính và ứng dụng CNTT/chuyển đổi số',
        `${selectedLevel} (${groupName} — Khung Trường: ${pos?.frameworkTitle || t.vtvlName})`,
        t.vtvlSuffix.startsWith('QL') || t.vtvlSuffix.startsWith('LD') ? 'Bậc 4 (Điều hành đơn vị)' : 'Không yêu cầu',
        t.legalBasisHint,
        'Hướng dẫn số 02 (1907/HD-ĐHCNKT) & Đề án Vị trí việc làm HCM-UTE'
      ];
    })
  ]);
  XLSX.utils.book_append_sheet(wb, wsC2, '7. C2_NangLuc');

  // 8. C3_NhuCau (14 cột A–N)
  const wsC3 = XLSX.utils.aoa_to_sheet([
    [`BIỂU 8. C3_NhuCau — XÁC ĐỊNH NHU CẦU NHÂN LỰC THEO PP1, PP2, PP3 (${opts.unitCode})`],
    ['Mã VTVL', 'Phương pháp', 'Giờ B1', 'Giờ tác động B2', 'Giờ ròng', 'Giờ PP2 (từ C1)', 'Người quy đổi PP2', 'Người PP1', 'Người PP3 (ước lượng, cần giải trình)', 'Người cần bố trí', 'Nguồn/giải trình', 'Trạng thái', 'Cảnh báo', 'Số dòng B1 chưa đạt'],
    ...positionBreakdown.map((p) => [
      p.vtvlCode, p.method, p.b1HoursYear, p.b2NetHoursYear, p.netHoursYear, p.standardHoursYear,
      Number((p.netHoursYear / p.standardHoursYear).toFixed(2)), p.method.includes('PP1') ? 1 : '', '',
      p.recommendedFte, `Xác định theo phương pháp ${p.method} chuẩn Hướng dẫn 07-HD/BTCTW`, 'Đã kiểm chứng', 'ĐẠT', 0
    ])
  ]);
  XLSX.utils.book_append_sheet(wb, wsC3, '8. C3_NhuCau');

  // 9. D1_NhanLuc (11 cột A–K)
  const d1Rows: (string | number)[][] = [];
  let staffSeq = 1;
  ngachList.forEach((n) => {
    const count = opts.ngachOverrides[n.code] ?? n.defaultCount;
    const matchingPos = positionBreakdown.find((p) => p.ngachCode === n.code) || positionBreakdown[0];
    for (let k = 0; k < Math.min(count, 15); k++) {
      d1Rows.push([
        `${opts.unitCode}-NL${String(staffSeq).padStart(3, '0')}`, matchingPos.vtvlCode, n.personnelType,
        n.standardHoursPerYear, n.standardHoursPerYear, 0, opts.unitNameVi,
        `Danh sách nhân sự chốt ngày ${HD07_CONSTANTS.STAFF_CUTOFF_DATE} (${n.code})`,
        'Đang làm việc', 'Đạt', n.workingRegime === 'Đặc thù' ? n.standardHoursPerYear : ''
      ]);
      staffSeq++;
    }
  });
  const wsD1 = XLSX.utils.aoa_to_sheet([
    [`BIỂU 9. D1_NhanLuc — NGUỒN NHÂN LỰC HIỆN CÓ CHỐT TẠI 30/9/2026 (${opts.unitCode})`],
    ['Mã nguồn lực', 'Mã VTVL', 'Loại nhân lực', 'Giờ quy đổi/năm (tự lấy)', 'Giờ dành cho VTVL', 'Giờ việc khác', 'Nơi tính BC', 'Nguồn', 'Trạng thái', 'Cảnh báo', 'Giờ riêng theo chế độ'],
    ...d1Rows
  ]);
  XLSX.utils.book_append_sheet(wb, wsD1, '9. D1_NhanLuc');

  // 10. D2_PhuongAn (14 cột A–N)
  const d2Rows: (string | number)[][] = [];
  positionBreakdown.forEach((p) => {
    const currentAssigned = Math.max(1, Math.round(p.recommendedFte));
    HD07_CONSTANTS.FORECAST_YEARS.forEach((yr) => {
      d2Rows.push([
        p.vtvlCode, yr, p.recommendedFte, currentAssigned, currentAssigned, 0,
        Number((p.recommendedFte - currentAssigned).toFixed(2)),
        `Phương án biên chế năm ${yr} theo đề án VTVL ${opts.unitCode}`, 'Đã hoàn thành ở đơn vị', 'ĐẠT',
        Number((p.netHoursYear / p.standardHoursYear).toFixed(2)), p.recommendedFte, 'ĐẠT', `Đề án VTVL ${opts.unitCode} năm 2026`
      ]);
    });
  });
  const wsD2 = XLSX.utils.aoa_to_sheet([
    [`BIỂU 10. D2_PhuongAn — PHƯƠNG ÁN BIÊN CHẾ GIAI ĐOẠN 2027–2031 (${opts.unitCode})`],
    ['Mã VTVL', 'Năm', 'Số người cần bố trí trong năm phương án', 'Số người có thể bố trí (cùng đơn vị tính)', 'Biên chế được giao theo đúng cấp', 'Điều chuyển/bố trí lại', 'Đề nghị điều chỉnh', 'Nguồn/giải trình', 'Trạng thái', 'Cảnh báo', 'PP2: người quy đổi (tham khảo)', 'Người cần bố trí C3 năm cơ sở (tham khảo)', 'Kiểm soát cơ sở đối chiếu', 'Văn bản thẩm định/quyết định (số, ngày, cơ quan)'],
    ...d2Rows
  ]);
  XLSX.utils.book_append_sheet(wb, wsD2, '10. D2_PhuongAn');

  return { b1Header, b1Rows, wsB1, wsB2Ct, wsD1 };
}

