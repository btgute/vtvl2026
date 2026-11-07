-- =============================================================================
-- HCM-UTE VTVL 360 — SUPABASE POSTGRESQL SCHEMA & MASTER SEED DATA
-- Căn cứ: Hướng dẫn 07-HD/BTCTW, Nghị định 232/2026/NĐ-CP,
--         Thông tư 31/2026/TT-BGDĐT (14/4/2026) & Hướng dẫn số 02 (1907/HD-ĐHCNKT)
-- =============================================================================

-- 1. BẢNG DANH MỤC 51 ĐƠN VỊ THUỘC HCM-UTE (DM_DON_VI)
CREATE TABLE IF NOT EXISTS public.dm_don_vi (
  ma_don_vi text PRIMARY KEY,
  ten_don_vi_vi text NOT NULL,
  ten_don_vi_en text NOT NULL,
  khoi_don_vi text NOT NULL CHECK (khoi_don_vi IN ('khoa-vien', 'phong-ban', 'trung-tam', 'dang-doanthe')),
  linh_vuc text,
  chuc_danh_thu_truong_vi text,
  chuc_danh_thu_truong_en text,
  so_nhan_su_mac_dinh integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. BẢNG DANH MỤC 28 MÃ CHỨC DANH & XẾP LƯƠNG NHÀ GIÁO (DM_CHUC_DANH_TT31)
CREATE TABLE IF NOT EXISTS public.dm_chuc_danh_tt31 (
  ma_so_chuc_danh text PRIMARY KEY,
  ten_chuc_danh text NOT NULL,
  khoan_dieu_tt31 text NOT NULL,
  loai_vien_chuc text NOT NULL,
  khung_he_so_luong text NOT NULL,
  dien_chuyen_tiep boolean NOT NULL DEFAULT false,
  ghi_chu_bo_nhiem text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. BẢNG KHUNG 38 VỊ TRÍ VIỆC LÀM CỦA TRƯỜNG (04 NHÓM — PHỤ LỤC I HD 1907/HD-ĐHCNKT & NĐ 232/2026)
CREATE TABLE IF NOT EXISTS public.dm_vtvl_khung_truong (
  ma_danh_muc_nd232 text PRIMARY KEY,
  tt_toan_truong integer NOT NULL,
  tt_trong_nhom integer NOT NULL,
  nhom_vtvl_4 text NOT NULL,
  ten_khung_vtvl_truong text NOT NULL,
  gioi_han_bac_nghe_nghiep text NOT NULL,
  ds_bac_cho_phep jsonb NOT NULL DEFAULT '[]'::jsonb,
  cong_thuc_ten_cu_the text NOT NULL,
  ma_so_chuc_danh text,
  ky_hieu_goi_y text,
  pham_vi_ap_dung text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. BẢNG DANH MỤC SẢN PHẨM CHUẨN NHÓM I–VI (11. DM_SAN_PHAM)
CREATE TABLE IF NOT EXISTS public.dm_san_pham (
  ma_sp_chuan text PRIMARY KEY,
  ten_loai_sp text NOT NULL,
  khoi_nganh_linh_vuc text NOT NULL,
  nhom_la_ma text NOT NULL CHECK (nhom_la_ma IN ('I', 'II', 'III', 'IV', 'V', 'VI')),
  phut_sp_chuan numeric(10,2) NOT NULL,
  van_ban_xac_nhan text,
  trang_thai text NOT NULL DEFAULT 'Đã xác nhận',
  co_quan_xac_nhan text,
  ngay_hieu_luc text,
  pham_vi_ap_dung text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. BẢNG C1_VTVL: DANH MỤC VTVL CỤ THỂ TẠI ĐƠN VỊ (PHỤ LỤC II HD 1907 & BIỂU 6. C1_VTVL)
CREATE TABLE IF NOT EXISTS public.c1_vtvl (
  ma_vtvl text PRIMARY KEY,
  ma_don_vi text NOT NULL REFERENCES public.dm_don_vi(ma_don_vi) ON DELETE CASCADE,
  nhom_vtvl_4 text NOT NULL,
  ten_khung_vtvl_truong text NOT NULL,
  ten_vtvl_cu_the_don_vi text NOT NULL,
  bac_nghe_nghiep_su_dung text NOT NULL,
  ma_ngach_chuc_danh text,
  loai_nhan_luc text NOT NULL DEFAULT 'Viên chức',
  che_do_lam_viec text NOT NULL DEFAULT 'Phổ biến (40 giờ/tuần)',
  gio_chuan_pp2 numeric(10,2) NOT NULL DEFAULT 1904,
  phuong_phap text NOT NULL DEFAULT 'PP2',
  gio_b1_nam numeric(12,2) NOT NULL DEFAULT 0,
  gio_b2_tac_dong numeric(12,2) NOT NULL DEFAULT 0,
  gio_rong_nam numeric(12,2) NOT NULL DEFAULT 0,
  nhu_cau_fte numeric(10,2) NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_c1_vtvl_ma_don_vi ON public.c1_vtvl(ma_don_vi);

-- 6. BẢNG T_TIEN_DO: TỔNG HỢP HỒ SƠ ĐƠN VỊ NỘP TRỰC TUYẾN (BIỂU 14. T_TienDo)
CREATE TABLE IF NOT EXISTS public.t_tien_do (
  ma_don_vi text PRIMARY KEY REFERENCES public.dm_don_vi(ma_don_vi) ON DELETE CASCADE,
  ten_don_vi text NOT NULL,
  phien_ban text NOT NULL DEFAULT 'v1',
  so_nhiem_vu_a1 integer NOT NULL DEFAULT 0,
  so_cong_viec_a2 integer NOT NULL DEFAULT 0,
  so_vtvl_c1 integer NOT NULL DEFAULT 0,
  tong_fte_c3 numeric(10,2) NOT NULL DEFAULT 0,
  trang_thai_ra_soat text NOT NULL DEFAULT 'Đã khởi tạo trực tuyến',
  du_lieu_ho_so_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. BẢNG S_NHAT_KY: NHẬT KÝ PHIÊN BẢN VÀ THAO TÁC TRỰC TUYẾN (BIỂU 15. S_NhatKy)
CREATE TABLE IF NOT EXISTS public.s_nhat_ky (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ma_don_vi text NOT NULL,
  ten_don_vi text NOT NULL,
  hanh_dong text NOT NULL,
  chi_tiet text NOT NULL,
  phien_ban text NOT NULL DEFAULT 'v1',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_s_nhat_ky_ma_don_vi ON public.s_nhat_ky(ma_don_vi);

-- =============================================================================
-- BẢO MẬT ROW LEVEL SECURITY (RLS) THEO CHUẨN SUPABASE
-- =============================================================================
ALTER TABLE public.dm_don_vi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_chuc_danh_tt31 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_vtvl_khung_truong ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_san_pham ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.c1_vtvl ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.t_tien_do ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.s_nhat_ky ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.dm_don_vi, public.dm_chuc_danh_tt31, public.dm_vtvl_khung_truong, public.dm_san_pham, public.c1_vtvl, public.t_tien_do, public.s_nhat_ky TO anon, authenticated;

DROP POLICY IF EXISTS "allow_read_dm_don_vi" ON public.dm_don_vi;
CREATE POLICY "allow_read_dm_don_vi" ON public.dm_don_vi FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "allow_write_dm_don_vi" ON public.dm_don_vi;
CREATE POLICY "allow_write_dm_don_vi" ON public.dm_don_vi FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "allow_upd_dm_don_vi" ON public.dm_don_vi;
CREATE POLICY "allow_upd_dm_don_vi" ON public.dm_don_vi FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_dm_chuc_danh_tt31" ON public.dm_chuc_danh_tt31;
CREATE POLICY "allow_read_dm_chuc_danh_tt31" ON public.dm_chuc_danh_tt31 FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "allow_write_dm_chuc_danh_tt31" ON public.dm_chuc_danh_tt31;
CREATE POLICY "allow_write_dm_chuc_danh_tt31" ON public.dm_chuc_danh_tt31 FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "allow_upd_dm_chuc_danh_tt31" ON public.dm_chuc_danh_tt31;
CREATE POLICY "allow_upd_dm_chuc_danh_tt31" ON public.dm_chuc_danh_tt31 FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_dm_vtvl_khung_truong" ON public.dm_vtvl_khung_truong;
CREATE POLICY "allow_read_dm_vtvl_khung_truong" ON public.dm_vtvl_khung_truong FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "allow_write_dm_vtvl_khung_truong" ON public.dm_vtvl_khung_truong;
CREATE POLICY "allow_write_dm_vtvl_khung_truong" ON public.dm_vtvl_khung_truong FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "allow_upd_dm_vtvl_khung_truong" ON public.dm_vtvl_khung_truong;
CREATE POLICY "allow_upd_dm_vtvl_khung_truong" ON public.dm_vtvl_khung_truong FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_dm_san_pham" ON public.dm_san_pham;
CREATE POLICY "allow_read_dm_san_pham" ON public.dm_san_pham FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "allow_write_dm_san_pham" ON public.dm_san_pham;
CREATE POLICY "allow_write_dm_san_pham" ON public.dm_san_pham FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "allow_upd_dm_san_pham" ON public.dm_san_pham;
CREATE POLICY "allow_upd_dm_san_pham" ON public.dm_san_pham FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_select_c1_vtvl" ON public.c1_vtvl;
CREATE POLICY "allow_select_c1_vtvl" ON public.c1_vtvl FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "allow_insert_c1_vtvl" ON public.c1_vtvl;
CREATE POLICY "allow_insert_c1_vtvl" ON public.c1_vtvl FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "allow_update_c1_vtvl" ON public.c1_vtvl;
CREATE POLICY "allow_update_c1_vtvl" ON public.c1_vtvl FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_select_t_tien_do" ON public.t_tien_do;
CREATE POLICY "allow_select_t_tien_do" ON public.t_tien_do FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "allow_insert_t_tien_do" ON public.t_tien_do;
CREATE POLICY "allow_insert_t_tien_do" ON public.t_tien_do FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "allow_update_t_tien_do" ON public.t_tien_do;
CREATE POLICY "allow_update_t_tien_do" ON public.t_tien_do FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_select_s_nhat_ky" ON public.s_nhat_ky;
CREATE POLICY "allow_select_s_nhat_ky" ON public.s_nhat_ky FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "allow_insert_s_nhat_ky" ON public.s_nhat_ky;
CREATE POLICY "allow_insert_s_nhat_ky" ON public.s_nhat_ky FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =============================================================================
-- NẠP DỮ LIỆU GỐC KHUNG 38 VTVL CỦA TRƯỜNG (PHỤ LỤC I — HD 1907/HD-ĐHCNKT)
-- =============================================================================
INSERT INTO public.dm_vtvl_khung_truong (
  ma_danh_muc_nd232, tt_toan_truong, tt_trong_nhom, nhom_vtvl_4,
  ten_khung_vtvl_truong, gioi_han_bac_nghe_nghiep, ds_bac_cho_phep,
  cong_thuc_ten_cu_the, ma_so_chuc_danh, ky_hieu_goi_y, pham_vi_ap_dung
) VALUES
  ('HD1907-I-01', 1, 1, 'I. Nhóm VTVL Quản lý', 'Hiệu trưởng', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Hiệu trưởng Trường ĐH Công nghệ Kỹ thuật TP.HCM', 'V.07.01.01', 'QL-HT', 'Quản lý cấp trường'),
  ('HD1907-I-02', 2, 2, 'I. Nhóm VTVL Quản lý', 'Phó hiệu trưởng', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Phó hiệu trưởng + [lĩnh vực phụ trách]', 'V.07.01.01', 'QL-PHT', 'Quản lý cấp trường'),
  ('HD1907-I-03', 3, 3, 'I. Nhóm VTVL Quản lý', 'Trưởng khoa', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Trưởng khoa + [Tên Khoa]', 'V.07.01.01', 'QL-TK', 'Đơn vị chuyên môn'),
  ('HD1907-I-04', 4, 4, 'I. Nhóm VTVL Quản lý', 'Viện trưởng', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Viện trưởng + [Tên Viện]', 'V.07.01.01', 'QL-VT', 'Đơn vị chuyên môn/chức năng'),
  ('HD1907-I-05', 5, 5, 'I. Nhóm VTVL Quản lý', 'Trưởng phòng', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Trưởng phòng + [Tên Phòng]', '01.002', 'QL-TP', 'Đơn vị chức năng'),
  ('HD1907-I-06', 6, 6, 'I. Nhóm VTVL Quản lý', 'Giám đốc', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Giám đốc + [Tên Trung tâm / Phân hiệu]', 'V.07.01.02', 'QL-GD', 'Đơn vị chuyên môn/chức năng'),
  ('HD1907-I-07', 7, 7, 'I. Nhóm VTVL Quản lý', 'Chánh văn phòng', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Chánh văn phòng + [Tên Văn phòng]', '01.002', 'QL-CVP', 'Đơn vị chức năng'),
  ('HD1907-I-08', 8, 8, 'I. Nhóm VTVL Quản lý', 'Tổng biên tập', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Tổng biên tập Tạp chí', 'V.07.01.01', 'QL-TBT', 'Đơn vị chức năng'),
  ('HD1907-I-09', 9, 9, 'I. Nhóm VTVL Quản lý', 'Trưởng trạm', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Trưởng trạm Y tế', 'V.08.01.02', 'QL-TT', 'Đơn vị chức năng'),
  ('HD1907-I-10', 10, 10, 'I. Nhóm VTVL Quản lý', 'Phó Trưởng khoa', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Phó Trưởng khoa + [lĩnh vực phụ trách / số thứ tự]', 'V.07.01.02', 'QL-PTK', 'Đơn vị chuyên môn'),
  ('HD1907-I-11', 11, 11, 'I. Nhóm VTVL Quản lý', 'Phó Viện trưởng', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Phó Viện trưởng + [lĩnh vực phụ trách]', 'V.07.01.02', 'QL-PVT', 'Đơn vị chuyên môn/chức năng'),
  ('HD1907-I-12', 12, 12, 'I. Nhóm VTVL Quản lý', 'Phó Trưởng phòng', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Phó Trưởng phòng + [lĩnh vực phụ trách]', '01.002', 'QL-PTP', 'Đơn vị chức năng'),
  ('HD1907-I-13', 13, 13, 'I. Nhóm VTVL Quản lý', 'Phó Giám đốc', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Phó Giám đốc + [lĩnh vực phụ trách]', 'V.07.01.02', 'QL-PGD', 'Đơn vị chuyên môn/chức năng'),
  ('HD1907-I-14', 14, 14, 'I. Nhóm VTVL Quản lý', 'Phó Chánh văn phòng', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Phó Chánh văn phòng + [lĩnh vực phụ trách]', '01.003', 'QL-PCVP', 'Đơn vị chức năng'),
  ('HD1907-I-15', 15, 15, 'I. Nhóm VTVL Quản lý', 'Phó Tổng biên tập', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Phó Tổng biên tập Tạp chí', 'V.07.01.02', 'QL-PTBT', 'Đơn vị chức năng'),
  ('HD1907-I-16', 16, 16, 'I. Nhóm VTVL Quản lý', 'Phó Trưởng trạm', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Phó Trưởng trạm Y tế', 'V.08.01.03', 'QL-PTT', 'Đơn vị chức năng'),
  ('HD1907-I-17', 17, 17, 'I. Nhóm VTVL Quản lý', 'Trưởng Bộ môn', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Trưởng Bộ môn + [Tên Bộ môn]', 'V.07.01.02', 'QL-TBM', 'Đơn vị chuyên môn'),
  ('HD1907-I-18', 18, 18, 'I. Nhóm VTVL Quản lý', 'Trưởng Ngành', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Trưởng Ngành + [Tên Ngành]', 'V.07.01.02', 'QL-TN', 'Đơn vị chuyên môn'),
  ('HD1907-I-19', 19, 19, 'I. Nhóm VTVL Quản lý', 'Phó Trưởng Bộ môn', 'Không áp dụng bậc', '["Không áp dụng bậc"]', 'Phó Trưởng Bộ môn + [Tên Bộ môn]', 'V.07.01.02', 'QL-PTBM', 'Đơn vị chuyên môn'),
  ('HD1907-II-01', 20, 1, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Giảng viên', 'Bậc 3', '["Bậc 3"]', 'Giảng viên (giữ nguyên tên khung)', 'V.07.01.03', 'DT-GV-03', 'Đơn vị chuyên môn'),
  ('HD1907-II-02', 21, 2, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Giảng viên chính', 'Bậc 4', '["Bậc 4"]', 'Giảng viên chính (giữ nguyên tên khung)', 'V.07.01.02', 'DT-GV-02', 'Đơn vị chuyên môn'),
  ('HD1907-II-03', 22, 3, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Giảng viên cao cấp', 'Bậc 5', '["Bậc 5"]', 'Giảng viên cao cấp (giữ nguyên tên khung)', 'V.07.01.01', 'DT-GV-01', 'Đơn vị chuyên môn'),
  ('HD1907-II-04', 23, 4, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Trợ lý nghiên cứu (hạng IV)', 'Bậc 2', '["Bậc 2"]', 'Trợ lý nghiên cứu (hạng IV)', 'V.05.01.04', 'NC-TL-01', 'Đơn vị chuyên môn'),
  ('HD1907-II-05', 24, 5, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Nghiên cứu viên (hạng III)', 'Bậc 3', '["Bậc 3"]', 'Nghiên cứu viên (hạng III)', 'V.05.01.03', 'NC-NCV-01', 'Đơn vị chuyên môn'),
  ('HD1907-II-06', 25, 6, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Nghiên cứu viên chính (hạng II)', 'Bậc 4', '["Bậc 4"]', 'Nghiên cứu viên chính (hạng II)', 'V.05.01.02', 'NC-NCVC-01', 'Đơn vị chuyên môn'),
  ('HD1907-II-07', 26, 7, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Thư viện viên', 'Từ bậc 3 đến bậc 4', '["Từ bậc 3 đến bậc 4","Bậc 3","Bậc 4","Bậc 3, Bậc 4"]', 'Thư viện viên + [lĩnh vực phụ trách]', 'V.10.02.06', 'CM-TVV-01', 'Đơn vị chức năng'),
  ('HD1907-II-08', 27, 8, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Chuyên viên', 'Từ bậc 3 đến bậc 4', '["Từ bậc 3 đến bậc 4","Bậc 3","Bậc 4","Bậc 3, Bậc 4"]', 'Tại Khoa/Viện: Thư ký khoa · Tại Phòng/Ban: Chuyên viên + [lĩnh vực phụ trách]', '01.003', 'CM-CV-01', 'Đơn vị chuyên môn/chức năng'),
  ('HD1907-II-09', 30, 9, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Kế toán viên', 'Từ bậc 3 đến bậc 4', '["Từ bậc 3 đến bậc 4","Bậc 3","Bậc 4","Bậc 3, Bậc 4"]', 'Kế toán viên + [mảng kế toán]', '06.031', 'CM-KTV-01', 'Đơn vị chức năng'),
  ('HD1907-II-10', 31, 10, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Bác sĩ', 'Từ bậc 3 đến bậc 4', '["Từ bậc 3 đến bậc 4","Bậc 3","Bậc 4","Bậc 3, Bậc 4"]', 'Bác sĩ y tế trường học', 'V.08.01.03', 'CM-BS-01', 'Đơn vị chức năng'),
  ('HD1907-II-11', 32, 11, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Y sĩ', 'Bậc 2', '["Bậc 2"]', 'Y sĩ y tế trường học', 'V.08.03.07', 'CM-YS-01', 'Đơn vị chức năng'),
  ('HD1907-II-12', 33, 12, 'II. Nhóm VTVL Chuyên môn, nghiệp vụ', 'Điều dưỡng', 'Từ bậc 2 đến bậc 4', '["Từ bậc 2 đến bậc 4","Bậc 2","Bậc 3","Bậc 4","Bậc 2, Bậc 3","Bậc 3, Bậc 4"]', 'Điều dưỡng y tế trường học', 'V.08.05.12', 'CM-DD-01', 'Đơn vị chức năng'),
  ('HD1907-III-01', 34, 1, 'III. Nhóm VTVL Hỗ trợ', 'Trợ giảng', 'Bậc 3', '["Bậc 3"]', 'Trợ giảng (giữ nguyên tên khung)', 'V.07.01.23', 'HT-TG-01', 'Đơn vị chuyên môn'),
  ('HD1907-III-02', 35, 2, 'III. Nhóm VTVL Hỗ trợ', 'Nhân sự phụ trách xưởng/phòng thí nghiệm', 'Bậc 2', '["Bậc 2"]', 'Nhân sự phụ trách phòng thí nghiệm + [Tên PTN/Xưởng]', 'V.05.02.07', 'HT-PTN-01', 'Đơn vị chuyên môn'),
  ('HD1907-III-03', 36, 3, 'III. Nhóm VTVL Hỗ trợ', 'Thủ quỹ', 'Bậc 2', '["Bậc 2"]', 'Thủ quỹ', '01.005', 'HT-TQ-01', 'Đơn vị chức năng'),
  ('HD1907-IV-01', 37, 1, 'IV. Nhóm VTVL Phục vụ', 'Nhân viên kỹ thuật', 'Từ bậc 1 đến bậc 2', '["Từ bậc 1 đến bậc 2","Bậc 1","Bậc 2","Bậc 1, Bậc 2"]', 'Nhân viên kỹ thuật + [điện, nước, hạ tầng...]', 'NV-KT', 'PV-KT-01', 'Đơn vị chức năng'),
  ('HD1907-IV-02', 38, 2, 'IV. Nhóm VTVL Phục vụ', 'Nhân viên lái xe', 'Từ bậc 1 đến bậc 2', '["Từ bậc 1 đến bậc 2","Bậc 1","Bậc 2","Bậc 1, Bậc 2"]', 'Nhân viên lái xe công vụ', 'NV-LX', 'PV-LX-01', 'Đơn vị chức năng'),
  ('HD1907-IV-03', 39, 3, 'IV. Nhóm VTVL Phục vụ', 'Nhân viên bảo vệ', 'Từ bậc 1 đến bậc 2', '["Từ bậc 1 đến bậc 2","Bậc 1","Bậc 2","Bậc 1, Bậc 2"]', 'Nhân viên bảo vệ an ninh trật tự', 'NV-BV', 'PV-BV-01', 'Đơn vị chức năng'),
  ('HD1907-IV-04', 40, 4, 'IV. Nhóm VTVL Phục vụ', 'Nhân viên lễ tân, phục vụ, tạp vụ', 'Từ bậc 1 đến bậc 2', '["Từ bậc 1 đến bậc 2","Bậc 1","Bậc 2","Bậc 1, Bậc 2"]', 'Nhân viên lễ tân, phục vụ, tạp vụ', 'NV-PV', 'PV-LT-01', 'Đơn vị chức năng')
ON CONFLICT (ma_danh_muc_nd232) DO UPDATE SET
  ten_khung_vtvl_truong = EXCLUDED.ten_khung_vtvl_truong,
  gioi_han_bac_nghe_nghiep = EXCLUDED.gioi_han_bac_nghe_nghiep,
  ds_bac_cho_phep = EXCLUDED.ds_bac_cho_phep,
  cong_thuc_ten_cu_the = EXCLUDED.cong_thuc_ten_cu_the;

