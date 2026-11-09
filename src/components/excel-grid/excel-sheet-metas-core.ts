import { ExcelSheetKey, ExcelSheetMeta } from './excel-grid-types';

export const CORE_EXCEL_SHEET_METAS: Record<
  'C1' | 'A1' | 'A2' | 'DM_SP' | 'B1' | 'B2_CT' | 'B2',
  ExcelSheetMeta
> = {
  C1: {
    key: 'C1',
    stepNum: 1,
    sheetNumberPrefix: '6',
    sheetName: '6. C1_VTVL',
    shortLabel: '6. C1_VTVL',
    title: 'Biểu C1_ Vị trí việc làm (Khai danh mục VTVL & Quỹ giờ chuẩn PP2)',
    guideDesc: 'Bước 1 trong trình tự Excel: Khai danh mục VTVL của đơn vị, chọn chế độ làm việc và xác định quỹ giờ chuẩn PP2 (1.904h hoặc 1.760h).',
    ruleHint: 'Áp dụng mã Phụ lục I (QL10–QL60, CM63–CM113, HT26–HT62) theo quy định HCM-UTE.',
    columns: [
      { colLetter: 'A', field: 'maVtvl', headerName: 'Mã VTVL', width: '130px' },
      { colLetter: 'B', field: 'tenVtvl', headerName: 'Tên VTVL cụ thể tại đơn vị', width: '260px' },
      { colLetter: 'C', field: 'loaiNhanLuc', headerName: 'Loại nhân lực', width: '110px', type: 'select', selectOptions: ['Viên chức', 'Hợp đồng lao động', 'Cán bộ'] },
      { colLetter: 'D', field: 'quyetDinh', headerName: 'Quyết định / Căn cứ VTVL', width: '200px' },
      { colLetter: 'E', field: 'gioChuanPp2', headerName: 'Giờ chuẩn PP2', width: '110px', isFormula: true, formulaHint: '=IF(J="Đặc thù",1760,1904)' },
      { colLetter: 'F', field: 'canCuQuyGio', headerName: 'Căn cứ xác định quỹ giờ', width: '220px' },
      { colLetter: 'G', field: 'trangThai', headerName: 'Trạng thái', width: '130px', type: 'select', selectOptions: ['tiếp tục sử dụng', 'mới đề xuất', 'chờ phê duyệt'] },
      { colLetter: 'H', field: 'gioRieng', headerName: 'Giờ riêng được xác nhận', width: '110px' },
      { colLetter: 'I', field: 'xacNhanGioRieng', headerName: 'Xác nhận giờ riêng', width: '130px' },
      { colLetter: 'J', field: 'cheDoLamViec', headerName: 'Chế độ làm việc', width: '170px', type: 'select', selectOptions: ['Phổ biến (40 giờ/tuần)', 'Đặc thù'] },
      { colLetter: 'K', field: 'kiemTra', headerName: 'Kiểm tra quỹ giờ', width: '100px', type: 'status', isFormula: true, formulaHint: '=IF(E>0,"ĐẠT","LỖI")' }
    ]
  },
  A1: {
    key: 'A1',
    stepNum: 2,
    sheetNumberPrefix: '1',
    sheetName: '1. A1_NhiemVu',
    shortLabel: '1. A1_NhiemVu',
    title: 'Biểu A1_ Nhiệm vụ (Rà soát nhiệm vụ theo Quyết định 2266/QĐ-ĐHCNKT)',
    guideDesc: 'Bước 2: Rà soát chức năng, nhiệm vụ được giao theo QĐ chức năng nhiệm vụ (QĐ 2266, Phụ lục 18) và phân loại tiếp tục thực hiện.',
    ruleHint: 'Mã nhiệm vụ chuẩn: [MÃ_ĐV].NV[01..99] (ví dụ: TCNS.NV01). Mỗi nhiệm vụ có một mã riêng, tự động tăng dần khi thêm mới.',
    columns: [
      { colLetter: 'A', field: 'maNhiemVu', headerName: 'Mã nhiệm vụ ([ĐV].NVxx)', width: '150px' },
      { colLetter: 'B', field: 'tenNhiemVu', headerName: 'Tên nhiệm vụ được giao', width: '320px' },
      { colLetter: 'C', field: 'coQuan', headerName: 'Cơ quan / Đơn vị thực hiện', width: '200px' },
      { colLetter: 'D', field: 'canCu', headerName: 'Căn cứ giao nhiệm vụ (QĐ 2266)', width: '220px' },
      { colLetter: 'E', field: 'ky', headerName: 'Kỳ số liệu', width: '130px' },
      { colLetter: 'F', field: 'trangThai', headerName: 'Trạng thái', width: '140px', type: 'select', selectOptions: ['Tiếp tục thực hiện', 'Mới tiếp nhận', 'Đã chuyển giao', 'Không còn thực hiện'] },
      { colLetter: 'G', field: 'nguon', headerName: 'Nguồn dữ liệu / Quyết định', width: '200px' }
    ]
  },
  A2: {
    key: 'A2',
    stepNum: 3,
    sheetNumberPrefix: '2',
    sheetName: '2. A2_CongViec',
    shortLabel: '2. A2_CongViec',
    title: 'Biểu A2_ Công việc (Phân rã công việc gắn Mã nhiệm vụ & Mã VTVL)',
    guideDesc: 'Bước 3: Phân rã nhiệm vụ thành từng công việc, xác định sản phẩm đầu ra, đơn vị tính, chất lượng và gán trực tiếp Mã VTVL chịu trách nhiệm.',
    ruleHint: 'Mã công việc chuẩn: [Mã nhiệm vụ].CV[01..99] (ví dụ: TCNS.NV01.CV01). Tự động kế thừa mã nhiệm vụ và tăng dần theo từng nhiệm vụ.',
    columns: [
      { colLetter: 'A', field: 'maCongViec', headerName: 'Mã công việc ([NV].CVxx)', width: '170px' },
      { colLetter: 'B', field: 'maNhiemVu', headerName: 'Mã nhiệm vụ (A1)', width: '140px', type: 'select', dynamicOptionsKey: 'missionList' },
      { colLetter: 'C', field: 'maVtvl', headerName: 'Mã VTVL (từ C1)', width: '130px', type: 'select', dynamicOptionsKey: 'vtvlList' },
      { colLetter: 'D', field: 'tenCongViec', headerName: 'Tên công việc cụ thể', width: '300px' },
      { colLetter: 'E', field: 'sanPham', headerName: 'Sản phẩm đầu ra', width: '200px' },
      { colLetter: 'F', field: 'dvt', headerName: 'Đơn vị tính', width: '90px' },
      { colLetter: 'G', field: 'chatLuong', headerName: 'Yêu cầu chất lượng', width: '220px' },
      { colLetter: 'H', field: 'canCu', headerName: 'Căn cứ (nguồn tài liệu)', width: '200px' }
    ]
  },
  DM_SP: {
    key: 'DM_SP',
    stepNum: 4,
    sheetNumberPrefix: '11',
    sheetName: '11. DM_SAN_PHAM',
    shortLabel: '11. DM_SAN_PHAM',
    title: 'Biểu 11. DM_SAN_PHAM — Danh mục 06 nhóm sản phẩm chuẩn và định mức',
    guideDesc: 'Bước 4: Tra cứu sản phẩm chuẩn phân nhóm I–VI và thời gian định mức (phút/SP) được HCM-UTE xác nhận.',
    ruleHint: 'Nếu sử dụng mã sản phẩm chuẩn thì B1_KhoiLuong sẽ tự động tra cứu định mức chuẩn.',
    columns: [
      { colLetter: 'A', field: 'maSpChuan', headerName: 'Mã SP chuẩn', width: '120px' },
      { colLetter: 'B', field: 'tenSp', headerName: 'Tên / Loại sản phẩm', width: '280px' },
      { colLetter: 'C', field: 'linhVuc', headerName: 'Khối / Ngành / Lĩnh vực', width: '180px' },
      { colLetter: 'D', field: 'nhom', headerName: 'Nhóm I–VI', width: '90px' },
      { colLetter: 'E', field: 'phutChuan', headerName: 'Phút/SP chuẩn', width: '110px' },
      { colLetter: 'F', field: 'vanBan', headerName: 'Văn bản / Nguồn xác nhận', width: '220px' },
      { colLetter: 'G', field: 'trangThai', headerName: 'Trạng thái chuẩn', width: '130px', type: 'select', selectOptions: ['Đã xác nhận', 'Đang thẩm định'] },
      { colLetter: 'H', field: 'coQuan', headerName: 'Cơ quan xác nhận', width: '160px' }
    ]
  },
  B1: {
    key: 'B1',
    stepNum: 5,
    sheetNumberPrefix: '3',
    sheetName: '3. B1_KhoiLuong',
    shortLabel: '3. B1_KhoiLuong',
    title: 'Biểu B1_ Khối lượng (Khối lượng sản phẩm & thời gian thực tế kỳ 2025–2026)',
    guideDesc: 'Bước 5: Kê khai sản lượng thực tế trong 12 tháng (Cột C), số phút đo thực tế (Cột D), công thức tự tính Giờ SP và Giờ tổng.',
    ruleHint: 'Mã VTVL (Cột B) tự lấy từ A2; Giờ SP (Cột F) = Cột C × Cột P / 60; Giờ tổng (Cột G) = F + E.',
    columns: [
      { colLetter: 'A', field: 'maCongViec', headerName: 'Mã công việc', width: '160px', type: 'select', dynamicOptionsKey: 'taskList' },
      { colLetter: 'B', field: 'maVtvl', headerName: 'Mã VTVL', width: '120px', isFormula: true, formulaHint: '=INDEX(A2!C,MATCH(A,A2!A,0))' },
      { colLetter: 'C', field: 'soSpNam', headerName: 'Số SP/năm', width: '100px', type: 'number' },
      { colLetter: 'D', field: 'phutThucTe', headerName: 'Phút/SP (thực tế)', width: '120px', type: 'number' },
      { colLetter: 'E', field: 'gioBoSung', headerName: 'Giờ bổ sung', width: '110px', type: 'number' },
      { colLetter: 'F', field: 'gioSp', headerName: 'Giờ SP (công thức)', width: '130px', isFormula: true, formulaHint: '=ROUND(C*P/60,2)' },
      { colLetter: 'G', field: 'gioTong', headerName: 'Giờ tổng (công thức)', width: '130px', isFormula: true, formulaHint: '=ROUND(F+E,2)' },
      { colLetter: 'H', field: 'nguon', headerName: 'Nguồn số liệu sản lượng', width: '200px' },
      { colLetter: 'I', field: 'ppThucTe', headerName: 'PP đo thực tế', width: '120px', type: 'select', selectOptions: ['bấm giờ', 'nhật ký công việc', 'ước lượng chuyên gia'] },
      { colLetter: 'P', field: 'phutApDung', headerName: 'Phút/SP áp dụng', width: '120px', isFormula: true, formulaHint: '=IF(D>0,D,INDEX(DM_SP!E,...))' },
      { colLetter: 'Q', field: 'canhBao', headerName: 'Cảnh báo B1', width: '110px', type: 'status', isFormula: true, formulaHint: '=IF(G>0,"ĐẠT","CHƯA ĐẠT")' }
    ]
  },
  B2_CT: {
    key: 'B2_CT',
    stepNum: 6,
    sheetNumberPrefix: '4',
    sheetName: '4. B2_CT_TacDong',
    shortLabel: '4. B2_CT_TacDong',
    title: 'Biểu B2_CT_ Chi tiết tác động (Chuyển đổi số, tự chủ, thuê dịch vụ)',
    guideDesc: 'Bước 6: Kê khai các công đoạn được số hóa (hệ thống S-Link, ERP...), ứng dụng AI hoặc chuyển giao giúp tăng năng suất/giảm thời gian.',
    ruleHint: 'Giờ biến động (Cột F) âm khi giảm thời gian nhờ CĐS, dương khi phát sinh nhiệm vụ mới.',
    columns: [
      { colLetter: 'A', field: 'maCongViec', headerName: 'Mã công việc', width: '160px', type: 'select', dynamicOptionsKey: 'taskList' },
      { colLetter: 'B', field: 'maVtvl', headerName: 'Mã VTVL', width: '120px', isFormula: true, formulaHint: '=INDEX(A2!C,MATCH(A,A2!A,0))' },
      { colLetter: 'C', field: 'congDoan', headerName: 'Công đoạn / Quy trình tác động', width: '240px' },
      { colLetter: 'D', field: 'loaiTacDong', headerName: 'Loại tác động', width: '140px', type: 'select', selectOptions: ['Chuyển đổi số / AI', 'Tự chủ đại học', 'Thuê dịch vụ ngoài', 'Chuẩn hóa quy trình'] },
      { colLetter: 'E', field: 'mucDo', headerName: 'Mức độ', width: '100px', type: 'select', selectOptions: ['Toàn phần', 'Một phần'] },
      { colLetter: 'F', field: 'gioBienDong', headerName: 'Giờ biến động (h/năm)', width: '140px', type: 'number' },
      { colLetter: 'G', field: 'vanBan', headerName: 'Văn bản / Đề án căn cứ', width: '220px' }
    ]
  },
  B2: {
    key: 'B2',
    stepNum: 7,
    sheetNumberPrefix: '5',
    sheetName: '5. B2_ThayDoi',
    shortLabel: '5. B2_ThayDoi',
    title: 'Biểu B2_ Thay đổi (Tổng hợp giờ tăng/giảm tự động từ Biểu 4. B2_CT)',
    guideDesc: 'Bước 7: Bảng tổng hợp tự động giờ tăng/giảm bằng công thức SUMIFS từ Biểu 4. B2_CT theo từng Mã công việc và Mã VTVL.',
    ruleHint: 'Giờ tổng sau tác động (Cột F) = Giờ B1 (Cột C) + Giờ biến động (Cột D) + Giờ mới (Cột E).',
    columns: [
      { colLetter: 'A', field: 'maCongViec', headerName: 'Mã công việc', width: '150px' },
      { colLetter: 'B', field: 'maVtvl', headerName: 'Mã VTVL', width: '120px', isFormula: true, formulaHint: '=INDEX(B1!B,MATCH(A,B1!A,0))' },
      { colLetter: 'C', field: 'gioB1', headerName: 'Giờ B1 gốc', width: '110px', isFormula: true, formulaHint: '=INDEX(B1!G,MATCH(A,B1!A,0))' },
      { colLetter: 'D', field: 'gioGiam', headerName: 'Giờ giảm (SUMIFS)', width: '130px', isFormula: true, formulaHint: '=SUMIFS(B2_CT!F,A,B2_CT!A)' },
      { colLetter: 'E', field: 'gioMoi', headerName: 'Giờ việc mới', width: '110px', type: 'number' },
      { colLetter: 'F', field: 'gioSauTacDong', headerName: 'Giờ sau tác động', width: '140px', isFormula: true, formulaHint: '=ROUND(C+D+E,2)' },
      { colLetter: 'G', field: 'tyLeThayDoi', headerName: 'Tỷ lệ thay đổi', width: '110px', isFormula: true, formulaHint: '=ROUND(D/C*100,1)&"%"' }
    ]
  }
};

