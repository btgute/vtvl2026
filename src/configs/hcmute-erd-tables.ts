export interface DmChucDanhTt31Row {
  maSoChucDanh: string; // PK: V.07.01.01 .. V.07.02.26 + V.07.01.23
  tenChucDanh: string;
  khoanDieuTt31: string;
  loaiVienChuc: string;
  khungHeSoLuong: string;
  dienChuyenTiep: boolean;
  ghiChuBoNhiem: string;
}

export const DM_CHUC_DANH_TT31_TABLE: DmChucDanhTt31Row[] = [
  // Khoản 9 Điều 2 & Điều 14 — Giảng viên đại học
  { maSoChucDanh: 'V.07.01.01', tenChucDanh: 'Giảng viên cao cấp', khoanDieuTt31: 'K9 Đ2 & Đ14', loaiVienChuc: 'A3.1', khungHeSoLuong: '6,20 – 8,00', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV cao cấp (hạng I) V.07.01.01; GS/PGS theo K3 Đ14 & NĐ 93/2026' },
  { maSoChucDanh: 'V.07.01.02', tenChucDanh: 'Giảng viên chính', khoanDieuTt31: 'K9 Đ2 & Đ14', loaiVienChuc: 'A2.1', khungHeSoLuong: '4,40 – 6,78', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV chính (hạng II) V.07.01.02' },
  { maSoChucDanh: 'V.07.01.03', tenChucDanh: 'Giảng viên', khoanDieuTt31: 'K9 Đ2 & Đ14', loaiVienChuc: 'A1', khungHeSoLuong: '2,34 – 4,98', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV (hạng III) V.07.01.03 hoặc Trợ giảng đủ chuẩn (điểm a K5 Đ15)' },
  // Khoản 5 Điều 15 — Trợ giảng diện chuyển tiếp
  { maSoChucDanh: 'V.07.01.23', tenChucDanh: 'Trợ giảng (diện chuyển tiếp)', khoanDieuTt31: 'Khoản 5 Đ15', loaiVienChuc: 'A1', khungHeSoLuong: '2,34 – 4,98', dienChuyenTiep: true, ghiChuBoNhiem: 'Trước 31/3/2026 đủ chuẩn xét sang V.07.01.03; đề án trước 30/6/2026 theo K1 Đ25 NĐ 93/2026' },
  // Khoản 8 Điều 2 & Điều 13 — Giảng viên cao đẳng
  { maSoChucDanh: 'V.09.02.01', tenChucDanh: 'Giảng viên cao cấp (Cao đẳng)', khoanDieuTt31: 'K8 Đ2 & Đ13', loaiVienChuc: 'A3.1', khungHeSoLuong: '6,20 – 8,00', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV GDNN cao cấp V.09.02.01 hoặc GV CĐSP cao cấp V.07.08.20' },
  { maSoChucDanh: 'V.09.02.02', tenChucDanh: 'Giảng viên chính (Cao đẳng)', khoanDieuTt31: 'K8 Đ2 & Đ13', loaiVienChuc: 'A2.1', khungHeSoLuong: '4,40 – 6,78', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV GDNN chính V.09.02.02 hoặc GV CĐSP chính V.07.08.21' },
  { maSoChucDanh: 'V.09.02.03', tenChucDanh: 'Giảng viên (Cao đẳng)', khoanDieuTt31: 'K8 Đ2 & Đ13', loaiVienChuc: 'A1 / A0', khungHeSoLuong: '2,34–4,98 / 2,10–4,89', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ V.09.02.03 (A1), V.09.02.04 (A0) hoặc V.07.08.22 (A1)' },
  // Khoản 7 Điều 2 & Điều 12 — Giáo viên trung cấp (TPC)
  { maSoChucDanh: 'V.09.02.05', tenChucDanh: 'Giáo viên trung cấp hạng I', khoanDieuTt31: 'K7 Đ2 & Đ12', loaiVienChuc: 'A3.2', khungHeSoLuong: '5,75 – 7,55', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV GDNN cao cấp (hạng I) V.09.02.05' },
  { maSoChucDanh: 'V.09.02.06', tenChucDanh: 'Giáo viên trung cấp hạng II', khoanDieuTt31: 'K7 Đ2 & Đ12', loaiVienChuc: 'A2.1', khungHeSoLuong: '4,40 – 6,78', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV GDNN chính (hạng II) V.09.02.06' },
  { maSoChucDanh: 'V.09.02.07', tenChucDanh: 'Giáo viên trung cấp hạng III', khoanDieuTt31: 'K7 Đ2 & Đ12', loaiVienChuc: 'A1 / A0', khungHeSoLuong: '2,34–4,98 / 2,10–4,89', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV GDNN lý thuyết V.09.02.07 (A1) hoặc thực hành V.09.02.08 (A0)' },
  // Khoản 6 Điều 2 & Điều 11 — Giáo viên sơ cấp
  { maSoChucDanh: 'V.09.02.11', tenChucDanh: 'Giáo viên sơ cấp hạng I', khoanDieuTt31: 'K6 Đ2 & Đ11', loaiVienChuc: 'A2.2', khungHeSoLuong: '4,00 – 6,38', dienChuyenTiep: false, ghiChuBoNhiem: 'Theo khoản 1 Điều 11 TT 31/2026/TT-BGDĐT' },
  { maSoChucDanh: 'V.09.02.10', tenChucDanh: 'Giáo viên sơ cấp hạng II', khoanDieuTt31: 'K6 Đ2 & Đ11', loaiVienChuc: 'A1', khungHeSoLuong: '2,34 – 4,98', dienChuyenTiep: false, ghiChuBoNhiem: 'Theo khoản 1 Điều 11 TT 31/2026/TT-BGDĐT' },
  { maSoChucDanh: 'V.09.02.09', tenChucDanh: 'Giáo viên sơ cấp hạng III', khoanDieuTt31: 'K6 Đ2 & Đ11', loaiVienChuc: 'Loại B', khungHeSoLuong: '1,86 – 4,06', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV GDNN (hạng IV) V.09.02.09 (khoản 2 Điều 11)' },
  // Khoản 5 Điều 2 & Điều 10 — Giáo viên dự bị đại học
  { maSoChucDanh: 'V.07.07.17', tenChucDanh: 'Giáo viên dự bị đại học hạng I', khoanDieuTt31: 'K5 Đ2 & Đ10', loaiVienChuc: 'A2.1', khungHeSoLuong: '4,40 – 6,78', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV dự bị ĐH hạng I V.07.07.17' },
  { maSoChucDanh: 'V.07.07.18', tenChucDanh: 'Giáo viên dự bị đại học hạng II', khoanDieuTt31: 'K5 Đ2 & Đ10', loaiVienChuc: 'A2.2', khungHeSoLuong: '4,00 – 6,38', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV dự bị ĐH hạng II V.07.07.18' },
  { maSoChucDanh: 'V.07.07.19', tenChucDanh: 'Giáo viên dự bị đại học hạng III', khoanDieuTt31: 'K5 Đ2 & Đ10', loaiVienChuc: 'A1', khungHeSoLuong: '2,34 – 4,98', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV dự bị ĐH hạng III V.07.07.19' },
  // Khoản 4 Điều 2 & Điều 9 — Giáo viên THPT (TPC)
  { maSoChucDanh: 'V.07.05.13', tenChucDanh: 'Giáo viên THPT hạng I', khoanDieuTt31: 'K4 Đ2 & Đ9', loaiVienChuc: 'A2.1', khungHeSoLuong: '4,40 – 6,78', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV THPT hạng I V.07.05.13' },
  { maSoChucDanh: 'V.07.05.14', tenChucDanh: 'Giáo viên THPT hạng II', khoanDieuTt31: 'K4 Đ2 & Đ9', loaiVienChuc: 'A2.2', khungHeSoLuong: '4,00 – 6,38', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV THPT hạng II V.07.05.14' },
  { maSoChucDanh: 'V.07.05.15', tenChucDanh: 'Giáo viên THPT hạng III', khoanDieuTt31: 'K4 Đ2 & Đ9', loaiVienChuc: 'A1', khungHeSoLuong: '2,34 – 4,98', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV THPT hạng III V.07.05.15' },
  // Khoản 3 Điều 2 & Điều 8 — Giáo viên THCS
  { maSoChucDanh: 'V.07.04.30', tenChucDanh: 'Giáo viên THCS hạng I', khoanDieuTt31: 'K3 Đ2 & Đ8', loaiVienChuc: 'A2.1', khungHeSoLuong: '4,40 – 6,78', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV THCS hạng I V.07.04.30' },
  { maSoChucDanh: 'V.07.04.31', tenChucDanh: 'Giáo viên THCS hạng II', khoanDieuTt31: 'K3 Đ2 & Đ8', loaiVienChuc: 'A2.2', khungHeSoLuong: '4,00 – 6,38', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV THCS hạng II V.07.04.31' },
  { maSoChucDanh: 'V.07.04.32', tenChucDanh: 'Giáo viên THCS hạng III', khoanDieuTt31: 'K3 Đ2 & Đ8', loaiVienChuc: 'A1', khungHeSoLuong: '2,34 – 4,98', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV THCS hạng III V.07.04.32' },
  // Khoản 2 Điều 2 & Điều 7 — Giáo viên tiểu học
  { maSoChucDanh: 'V.07.03.27', tenChucDanh: 'Giáo viên tiểu học hạng I', khoanDieuTt31: 'K2 Đ2 & Đ7', loaiVienChuc: 'A2.1', khungHeSoLuong: '4,40 – 6,78', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV tiểu học hạng I V.07.03.27' },
  { maSoChucDanh: 'V.07.03.28', tenChucDanh: 'Giáo viên tiểu học hạng II', khoanDieuTt31: 'K2 Đ2 & Đ7', loaiVienChuc: 'A2.2', khungHeSoLuong: '4,00 – 6,38', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV tiểu học hạng II V.07.03.28' },
  { maSoChucDanh: 'V.07.03.29', tenChucDanh: 'Giáo viên tiểu học hạng III', khoanDieuTt31: 'K2 Đ2 & Đ7', loaiVienChuc: 'A1', khungHeSoLuong: '2,34 – 4,98', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV tiểu học hạng III V.07.03.29' },
  // Khoản 1 Điều 2 & Điều 6 — Giáo viên mầm non
  { maSoChucDanh: 'V.07.02.24', tenChucDanh: 'Giáo viên mầm non hạng I', khoanDieuTt31: 'K1 Đ2 & Đ6', loaiVienChuc: 'A2.2', khungHeSoLuong: '4,00 – 6,38', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV mầm non hạng I V.07.02.24' },
  { maSoChucDanh: 'V.07.02.25', tenChucDanh: 'Giáo viên mầm non hạng II', khoanDieuTt31: 'K1 Đ2 & Đ6', loaiVienChuc: 'A1', khungHeSoLuong: '2,34 – 4,98', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV mầm non hạng II V.07.02.25' },
  { maSoChucDanh: 'V.07.02.26', tenChucDanh: 'Giáo viên mầm non hạng III', khoanDieuTt31: 'K1 Đ2 & Đ6', loaiVienChuc: 'A0', khungHeSoLuong: '2,10 – 4,89', dienChuyenTiep: false, ghiChuBoNhiem: 'Chuyển từ GV mầm non hạng III V.07.02.26' }
];

export interface ErdEntitySchemaItem {
  tableCode: string;
  tableNameVi: string;
  excelSheet: string;
  primaryKey: string;
  foreignKeys: string;
  columnCount: number;
  keyColumnsSummary: string;
  legalBasis: string;
}

export const ERD_ENTITIES_CATALOG: ErdEntitySchemaItem[] = [
  { tableCode: 'DON_VI', tableNameVi: 'Danh mục 51 đơn vị thuộc/trực thuộc HCM-UTE', excelSheet: 'HUONG_DAN / 14. T_TienDo', primaryKey: 'ma_don_vi', foreignKeys: '—', columnCount: 5, keyColumnsSummary: 'ma_don_vi, ten_don_vi_vi, ten_don_vi_en, khoi_don_vi, chuc_danh_thu_truong', legalBasis: 'Quy chế Tổ chức và Hoạt động HCM-UTE' },
  { tableCode: 'DM_VTVL_ND232', tableNameVi: 'Danh mục 25 nhóm VTVL viên chức & Bậc nghề nghiệp 1–5', excelSheet: '12. CHIA_VUNG_CAP_XA (Phần I)', primaryKey: 'ma_danh_muc_nd232', foreignKeys: 'ma_so_chuc_danh -> DM_CHUC_DANH_TT31', columnCount: 6, keyColumnsSummary: 'ma_danh_muc_nd232 (ND232-PL1..PL3), phu_luc, ten_vtvl_chuan, bac_nghe_nghiep, ma_so_chuc_danh', legalBasis: 'Nghị định 232/2026/NĐ-CP (Phụ lục I, II, III)' },
  { tableCode: 'DM_CHUC_DANH_TT31', tableNameVi: 'Danh mục 28 mã số chức danh & xếp lương nhà giáo', excelSheet: '12. CHIA_VUNG_CAP_XA (Phần II)', primaryKey: 'ma_so_chuc_danh', foreignKeys: '—', columnCount: 7, keyColumnsSummary: 'ma_so_chuc_danh (V.07.01.01..V.09.02.11), ten_chuc_danh, khoan_dieu_tt31, loai_vien_chuc, khung_he_so_luong, dien_chuyen_tiep', legalBasis: 'Thông tư 31/2026/TT-BGDĐT ngày 14/4/2026' },
  { tableCode: 'DM_SAN_PHAM', tableNameVi: 'Danh mục sản phẩm chuẩn 6 nhóm La Mã (I–VI)', excelSheet: '11. DM_SAN_PHAM / DM_06_NHOM', primaryKey: 'ma_sp_chuan', foreignKeys: '—', columnCount: 10, keyColumnsSummary: 'ma_sp_chuan (SP-I-01..SP-VI-01), ten_loai_san_pham, nhom_la_ma, phut_sp_chuan, van_ban_xac_nhan', legalBasis: 'Hướng dẫn 07-HD/BTCTW' },
  { tableCode: 'A1_NHIEM_VU', tableNameVi: 'Danh mục nhiệm vụ của đơn vị', excelSheet: '1. A1_NhiemVu', primaryKey: 'ma_nhiem_vu', foreignKeys: 'ma_don_vi -> DON_VI', columnCount: 7, keyColumnsSummary: 'ma_nhiem_vu ([MA_DV]-NV01..99), ten_nhiem_vu, ma_don_vi, can_cu_phap_ly, ky_thong_ke, trang_thai_nv', legalBasis: 'Hướng dẫn 07-HD/BTCTW (Biểu 1)' },
  { tableCode: 'A2_CONG_VIEC', tableNameVi: 'Danh mục công việc và sản phẩm đầu ra', excelSheet: '2. A2_CongViec', primaryKey: 'ma_cong_viec', foreignKeys: 'ma_nhiem_vu -> A1_NHIEM_VU; ma_vtvl -> C1_VTVL; ma_sp_chuan -> DM_SAN_PHAM', columnCount: 8, keyColumnsSummary: 'ma_cong_viec ([MA_DV]-NVxx-CVxx), ma_nhiem_vu, ma_vtvl, ten_cong_viec, ten_san_pham, don_vi_tinh', legalBasis: 'Hướng dẫn 07-HD/BTCTW (Biểu 2)' },
  { tableCode: 'B1_KHOI_LUONG', tableNameVi: 'Thống kê sản lượng và thời gian làm việc thực tế', excelSheet: '3. B1_KhoiLuong', primaryKey: 'ma_cong_viec', foreignKeys: 'ma_cong_viec -> A2_CONG_VIEC; ma_vtvl -> C1_VTVL; ma_sp_chuan -> DM_SAN_PHAM', columnCount: 19, keyColumnsSummary: 'ma_cong_viec, ma_vtvl, so_sp_nam, phut_sp_do_thuc_te, gio_sp_tinh, gio_tong_tinh, canh_bao_cot_r, giai_trinh_cot_s', legalBasis: 'Hướng dẫn 07-HD/BTCTW (Biểu 3 — 19 cột A–S)' },
  { tableCode: 'B2_CT_TAC_DONG', tableNameVi: 'Chi tiết tác động chuyển đổi số, tự chủ, thuê dịch vụ', excelSheet: '4. B2_CT_TacDong', primaryKey: 'id_tac_dong', foreignKeys: 'ma_cong_viec -> A2_CONG_VIEC; ma_vtvl -> C1_VTVL', columnCount: 19, keyColumnsSummary: 'id_tac_dong, ma_cong_viec, ma_vtvl, loai_tac_dong, sp_ap_dung, phut_truoc, phut_sau, gio_giam_hop_le, doi_chieu_trung', legalBasis: 'Hướng dẫn 07-HD/BTCTW (Biểu 4 — 19 cột A–S)' },
  { tableCode: 'B2_THAY_DOI', tableNameVi: 'Tổng hợp tác động ròng từ B2_CT', excelSheet: '5. B2_ThayDoi', primaryKey: 'ma_cong_viec', foreignKeys: 'ma_cong_viec -> A2_CONG_VIEC; ma_vtvl -> C1_VTVL', columnCount: 9, keyColumnsSummary: 'ma_cong_viec, ma_vtvl, gio_giam_so_hoa, gio_giam_thue_tc, gio_viec_moi, gio_tac_dong_rong', legalBasis: 'Hướng dẫn 07-HD/BTCTW (Biểu 5 — 9 cột A–I)' },
  { tableCode: 'C1_VTVL', tableNameVi: 'Danh mục Vị trí việc làm & Quỹ giờ chuẩn PP2', excelSheet: '6. C1_VTVL', primaryKey: 'ma_vtvl', foreignKeys: 'ma_don_vi -> DON_VI; ma_danh_muc_nd232 -> DM_VTVL_ND232; ma_so_chuc_danh -> DM_CHUC_DANH_TT31', columnCount: 11, keyColumnsSummary: 'ma_vtvl, ten_vtvl, loai_nhan_luc, gio_chuan_pp2 (1.904h / 1.760h), che_do_lam_viec, kiem_tra_quy_gio', legalBasis: 'HD 07-HD/BTCTW, NĐ 232/2026 & TT 31/2026' },
  { tableCode: 'C2_NANG_LUC', tableNameVi: 'Bản mô tả công việc & Khung năng lực (Bậc 1–5)', excelSheet: '7. C2_NangLuc', primaryKey: 'id_mo_ta', foreignKeys: 'ma_vtvl -> C1_VTVL', columnCount: 7, keyColumnsSummary: 'id_mo_ta, ma_vtvl, trach_nhiem_chinh, nang_luc_chung, nang_luc_chuyen_mon (Bậc 1–5), nang_luc_lanh_dao', legalBasis: 'Nghị định 232/2026/NĐ-CP & Biểu 7 HD07' },
  { tableCode: 'C3_NHU_CAU', tableNameVi: 'Xác định nhu cầu nhân lực theo PP1, PP2, PP3', excelSheet: '8. C3_NhuCau', primaryKey: 'ma_vtvl', foreignKeys: 'ma_vtvl -> C1_VTVL', columnCount: 14, keyColumnsSummary: 'ma_vtvl, phuong_phap (PP1/PP2/PP3), gio_b1, gio_tac_dong_b2, gio_rong, nguoi_quy_doi_pp2, nguoi_can_bo_tri', legalBasis: 'Hướng dẫn 07-HD/BTCTW (Biểu 8 — 14 cột A–N)' },
  { tableCode: 'D1_NHAN_LUC', tableNameVi: 'Nguồn nhân lực hiện có chốt tại 30/9/2026', excelSheet: '9. D1_NhanLuc', primaryKey: 'ma_nguon_luc', foreignKeys: 'ma_don_vi -> DON_VI; ma_vtvl -> C1_VTVL; ma_so_chuc_danh -> DM_CHUC_DANH_TT31', columnCount: 11, keyColumnsSummary: 'ma_nguon_luc ([MA_DV]-NL001..999), ma_vtvl, loai_nhan_luc, gio_quy_doi_nam, gio_danh_cho_vtvl, canh_bao_d1', legalBasis: 'HD 07-HD/BTCTW & Khoản 5 Đ15 TT 31/2026' },
  { tableCode: 'DU_BAO_5_NAM', tableNameVi: 'Dự báo thay đổi khối lượng công việc 5 năm (2027–2031)', excelSheet: 'DU_BAO_5_NAM', primaryKey: 'id_du_bao', foreignKeys: 'ma_vtvl -> C1_VTVL', columnCount: 7, keyColumnsSummary: 'id_du_bao, ma_vtvl, nam_du_bao (2027..2031), ty_le_thay_doi_kl, nhu_cau_du_kien', legalBasis: 'Hướng dẫn 07-HD/BTCTW' },
  { tableCode: 'D2_PHUONG_AN', tableNameVi: 'Phương án biên chế giai đoạn 2027–2031', excelSheet: '10. D2_PhuongAn', primaryKey: 'id_phuong_an', foreignKeys: 'ma_vtvl -> C1_VTVL; nam_phuong_an -> DU_BAO_5_NAM', columnCount: 14, keyColumnsSummary: 'id_phuong_an, ma_vtvl, nam_phuong_an, so_nguoi_can_bo_tri, so_nguoi_hien_co, de_nghi_dieu_chinh', legalBasis: 'Hướng dẫn 07-HD/BTCTW (Biểu 10 — 14 cột A–N)' },
  { tableCode: 'K_KIEM_TRA', tableNameVi: 'Bảng kiểm soát chéo tự động 6 chỉ tiêu (H3:H8)', excelSheet: '13. K_KiemTra', primaryKey: 'stt_chi_tieu', foreignKeys: 'ma_don_vi -> DON_VI', columnCount: 8, keyColumnsSummary: 'stt_chi_tieu (1..6), nhom_bieu, bang_nguon, bang_dich, so_dong_loi, ket_luan', legalBasis: 'Hướng dẫn 07-HD/BTCTW (Biểu 13)' },
  { tableCode: 'T_TIEN_DO', tableNameVi: 'Tổng hợp tiến độ hoàn thiện bộ biểu đơn vị', excelSheet: '14. T_TienDo', primaryKey: 'ma_don_vi', foreignKeys: 'ma_don_vi -> DON_VI', columnCount: 7, keyColumnsSummary: 'ma_don_vi, ten_don_vi, so_nhiem_vu_a1, so_cong_viec_a2, so_vtvl_c1, tong_fte_c3, trang_thai_k', legalBasis: 'Hướng dẫn 07-HD/BTCTW (Biểu 14)' },
  { tableCode: 'S_NHAT_KY', tableNameVi: 'Nhật ký phiên bản và lịch sử cập nhật dữ liệu', excelSheet: '15. S_NhatKy', primaryKey: 'id_nhat_ky', foreignKeys: 'ma_don_vi -> DON_VI', columnCount: 10, keyColumnsSummary: 'id_nhat_ky, ky, bieu_cap_nhat, ma_doi_tuong, gia_tri_cu, gia_tri_moi, nguoi_xac_nhan, phien_ban', legalBasis: 'Hướng dẫn 07-HD/BTCTW (Biểu 15)' }
];

