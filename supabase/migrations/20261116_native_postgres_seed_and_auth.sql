-- =============================================================================
-- MIGRATION: 20261116_native_postgres_seed_and_auth.sql
-- Mô tả:
--   1. Bảng nhật ký phiên bản lược đồ CSDL (public.schema_migrations)
--   2. Khởi tạo đầy đủ danh mục 51 đơn vị thuộc/trực thuộc HCM-UTE (public.dm_don_vi)
--   3. Mở rộng public.user_accounts (has_selected_unit) & khởi tạo quản trị gốc TCNS
--   4. Bổ sung chỉ mục hiệu năng cao cho truy vấn PostgreSQL thuần 100%
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.schema_migrations (
  id serial PRIMARY KEY,
  filename text NOT NULL UNIQUE,
  checksum_sha256 text NOT NULL,
  execution_ms integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  applied_by text NOT NULL DEFAULT current_user,
  git_commit text,
  error_message text,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at
  ON public.schema_migrations(applied_at DESC);

-- 1. Khởi tạo danh mục chuẩn 51 đơn vị HCM-UTE (bảo đảm toàn vẹn khóa ngoại FK)
INSERT INTO public.dm_don_vi (
  ma_don_vi, ten_don_vi_vi, ten_don_vi_en, khoi_don_vi,
  linh_vuc, chuc_danh_thu_truong_vi, chuc_danh_thu_truong_en, so_nhan_su_mac_dinh
) VALUES
  -- Khối Khoa & Viện đào tạo (16 đơn vị)
  ('FME', 'Khoa Cơ khí Chế tạo máy', 'Faculty of Mechanical Engineering', 'khoa-vien', 'fme.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Mechanical Engineering', 78),
  ('FEET', 'Khoa Cơ khí Động lực', 'Faculty of Vehicle and Energy Engineering', 'khoa-vien', 'feet.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Vehicle and Energy Engineering', 64),
  ('FEEE', 'Khoa Điện - Điện tử', 'Faculty of Electrical and Electronics Engineering', 'khoa-vien', 'feee.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Electrical and Electronics Engineering', 82),
  ('FIT', 'Khoa Công nghệ Thông tin', 'Faculty of Information Technology', 'khoa-vien', 'fit.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Information Technology', 68),
  ('FCFT', 'Khoa Công nghệ Hóa học và Thực phẩm', 'Faculty of Chemical and Food Technology', 'khoa-vien', 'fcft.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Chemical and Food Technology', 46),
  ('FCE', 'Khoa Xây dựng', 'Faculty of Civil Engineering', 'khoa-vien', 'fce.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Civil Engineering', 52),
  ('FE', 'Khoa Kinh tế', 'Faculty of Economics', 'khoa-vien', 'fe.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Economics', 54),
  ('FAE', 'Khoa Đào tạo Tiên tiến', 'Faculty of Advanced Education', 'khoa-vien', 'fae.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Advanced Education', 38),
  ('FGAM', 'Khoa In và Truyền thông', 'Faculty of Graphic Arts and Media', 'khoa-vien', 'fgam.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Graphic Arts and Media', 48),
  ('FPI', 'Khoa Chính trị và Luật', 'Faculty of Political Theory and Law', 'khoa-vien', 'fpi.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Political Theory and Law', 36),
  ('FAS', 'Khoa Khoa học Ứng dụng', 'Faculty of Applied Sciences', 'khoa-vien', 'fas.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Applied Sciences', 44),
  ('FFL', 'Khoa Ngoại ngữ', 'Faculty of Foreign Languages', 'khoa-vien', 'ffl.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Foreign Languages', 42),
  ('FFT', 'Khoa Thời trang và Du lịch', 'Faculty of Fashion and Tourism', 'khoa-vien', 'fft.hcmute.edu.vn', 'Trưởng khoa', 'Dean of the Faculty of Fashion and Tourism', 32),
  ('ITE', 'Viện Sư phạm Kỹ thuật', 'Institute of Technical Education', 'khoa-vien', 'ite.hcmute.edu.vn', 'Viện trưởng', 'Director of the Institute of Technical Education', 30),
  ('IIE', 'Viện Đào tạo quốc tế', 'Institute of International Education', 'khoa-vien', 'iie.hcmute.edu.vn', 'Viện trưởng', 'Director of the Institute of International Education', 28),
  ('SDH', 'Viện Sau đại học', 'Postgraduate School', 'khoa-vien', 'sdh.hcmute.edu.vn', 'Viện trưởng', 'Director of the Postgraduate School', 18),
  -- Khối Phòng ban chức năng (14 đơn vị)
  ('BMC', 'Phòng Quản trị thương hiệu và Truyền thông', 'Office of Brand Management and Communications', 'phong-ban', 'bmc.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Office of Brand Management and Communications', 18),
  ('TCNS', 'Phòng Tổ chức - Nhân sự', 'Office of Organization and Personnel', 'phong-ban', 'tcns.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Office of Organization and Personnel', 16),
  ('AAO', 'Phòng Đào tạo', 'Academic Affairs Office', 'phong-ban', 'aao.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Academic Affairs Office', 26),
  ('OIA', 'Phòng Quan hệ Quốc tế', 'International Affairs Office', 'phong-ban', 'oia.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Office of International Affairs', 12),
  ('ERO', 'Phòng Quan hệ Doanh nghiệp', 'Enterprise Relations Office', 'phong-ban', 'pr.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Enterprise Relations Office', 12),
  ('FPO', 'Phòng Kế hoạch Tài chính', 'Finance and Planning Office', 'phong-ban', 'fpo.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Finance and Planning Office', 22),
  ('STIAO', 'Phòng Khoa học Công nghệ', 'Office of Science and Technology', 'phong-ban', 'stiao.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Office of Science and Technology', 14),
  ('OGA', 'Phòng Hành chính - Tổng hợp', 'Office of General Administration', 'phong-ban', 'uteoffice.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Office of General Administration', 28),
  ('SAO', 'Phòng Công tác Sinh viên', 'Office of Student Affairs', 'phong-ban', 'sao.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Office of Student Affairs', 20),
  ('QAO', 'Phòng Khảo thí và Đảm bảo Chất lượng', 'Office of Testing and Quality Assurance', 'phong-ban', 'qao.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Office of Testing and Quality Assurance', 16),
  ('EMO', 'Phòng Quản trị cơ sở vật chất', 'Office of Facilities Management', 'phong-ban', 'emo.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Office of Facilities Management', 32),
  ('CPM', 'Phòng Quản lý đầu tư xây dựng và Đấu thầu', 'Office of Construction Project Management and Bidding', 'phong-ban', 'cpm.hcmute.edu.vn', 'Trưởng phòng', 'Director of the Office of Construction Project Management and Bidding', 14),
  ('KTX', 'Ban Quản lý Ký túc xá', 'Dormitory Management Office', 'phong-ban', 'ktx.hcmute.edu.vn', 'Trưởng ban', 'Director of the Dormitory Management Office', 24),
  ('TYT', 'Trạm Y tế', 'Health Care Office', 'phong-ban', 'hd.hcmute.edu.vn', 'Trưởng trạm', 'Head of the Health Care Office', 10),
  -- Khối Trung tâm & Phân hiệu (16 đơn vị)
  ('PHBP', 'Phân hiệu Trường Đại học Công nghệ Kỹ thuật TP.HCM tại Bình Phước', 'HCM-UTE Binh Phuoc Campus', 'trung-tam', 'binhphuoc.hcmute.edu.vn', 'Giám đốc Phân hiệu', 'Director of Binh Phuoc Campus', 35),
  ('TCKHGDKT', 'Tạp chí Khoa học Giáo dục Kỹ thuật', 'Journal of Technical Education Science', 'trung-tam', 'jte.hcmute.edu.vn', 'Tổng biên tập', 'Editor-in-Chief of the Journal of Technical Education Science', 8),
  ('HLDHS', 'Trung tâm Học liệu và Dạy học số', 'Center for Learning Resources and Digital Learning', 'trung-tam', 'lib.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Center for Learning Resources and Digital Learning', 26),
  ('CISAT', 'Trung tâm Sáng tạo, Khởi nghiệp và Chuyển giao công nghệ', 'Center of Innovation, Startup and Technology Transfer', 'trung-tam', 'cisat.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Center of Innovation, Startup and Technology Transfer', 14),
  ('INC', 'Trung tâm Thông tin - Máy tính', 'Information and Computer Center', 'trung-tam', 'inc.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Information and Computer Center', 16),
  ('ITC', 'Trung tâm Công nghệ thông tin', 'Information Technology Center', 'trung-tam', 'itc.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Information Technology Center', 14),
  ('GDQPAN', 'Trung tâm Giáo dục Quốc phòng và An ninh', 'National Defense and Security Training Center', 'trung-tam', 'gdqp.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the National Defense and Security Training Center', 20),
  ('GDTC', 'Trung tâm Giáo dục Thể chất', 'Physical Education Center', 'trung-tam', 'gdtc.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Physical Education Center', 22),
  ('STC', 'Trung tâm Công nghệ phần mềm', 'Software Technology Center', 'trung-tam', 'stc.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Software Technology Center', 12),
  ('TPC', 'Trường Trung học Kỹ thuật thực hành', 'Technical Practice College', 'trung-tam', 'tpc.hcmute.edu.vn', 'Hiệu trưởng', 'Principal of the Technical Practice College', 24),
  ('CFL', 'Trung tâm Ngoại ngữ', 'Center for Foreign Languages', 'trung-tam', 'cfl.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Center for Foreign Languages', 15),
  ('VGC', 'Trung tâm Việt Đức', 'Vietnam - Germany Center', 'trung-tam', 'vgc.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Vietnam - Germany Center', 12),
  ('SRC', 'Trung tâm Robot thông minh', 'Smart Robotic Center', 'trung-tam', 'src.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Smart Robotic Center', 10),
  ('ESC', 'Trung tâm Kỹ thuật tổng hợp', 'Engineering Synthesis Center', 'trung-tam', 'esc.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Engineering Synthesis Center', 12),
  ('EETC', 'Trung tâm Kỹ thuật và Công nghệ môi trường', 'Environmental Engineering and Technology Center', 'trung-tam', 'eetc.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Environmental Engineering and Technology Center', 10),
  ('CERAC', 'Trung tâm Nghiên cứu và Ứng dụng kỹ thuật xây dựng', 'Civil Engineering Research and Application Center', 'trung-tam', 'cerac.hcmute.edu.vn', 'Giám đốc trung tâm', 'Director of the Civil Engineering Research and Application Center', 10),
  -- Khối Quản trị & Đảng - Đoàn thể (5 đơn vị)
  ('HDT', 'Hội đồng trường', 'University Council', 'dang-doanthe', 'hcmute.edu.vn', 'Chủ tịch Hội đồng trường', 'Chair of the University Council', 6),
  ('BGH', 'Ban Giám hiệu', 'Presidential Board', 'dang-doanthe', 'hcmute.edu.vn', 'Hiệu trưởng', 'President', 5),
  ('VPDU', 'Văn phòng Đảng ủy', 'Office of University Party Committee', 'dang-doanthe', 'danguy.hcmute.edu.vn', 'Bí thư Đảng ủy', 'Secretary of the Party Committee', 8),
  ('CDT', 'Công đoàn Trường', 'University Trade Union', 'dang-doanthe', 'congdoan.hcmute.edu.vn', 'Chủ tịch Công đoàn Trường', 'President of the University Trade Union', 6),
  ('DTN', 'Đoàn Thanh niên - Hội Sinh viên', 'Ho Chi Minh Communist Youth Union & Students Association', 'dang-doanthe', 'doanthanhnien.hcmute.edu.vn', 'Bí thư Đoàn Thanh niên', 'Secretary of the Ho Chi Minh Communist Youth Union', 9)
ON CONFLICT (ma_don_vi) DO UPDATE SET
  ten_don_vi_vi = EXCLUDED.ten_don_vi_vi,
  ten_don_vi_en = EXCLUDED.ten_don_vi_en,
  khoi_don_vi = EXCLUDED.khoi_don_vi,
  linh_vuc = EXCLUDED.linh_vuc,
  chuc_danh_thu_truong_vi = EXCLUDED.chuc_danh_thu_truong_vi,
  chuc_danh_thu_truong_en = EXCLUDED.chuc_danh_thu_truong_en,
  so_nhan_su_mac_dinh = EXCLUDED.so_nhan_su_mac_dinh;

-- 2. Mở rộng bảng user_accounts cho xác thực Google OAuth trực tiếp
ALTER TABLE public.user_accounts
  ADD COLUMN IF NOT EXISTS has_selected_unit boolean NOT NULL DEFAULT false;

INSERT INTO public.user_accounts (
  email, display_name, unit_code, unit_name_vi, title, role, auth_provider, status, has_selected_unit
) VALUES (
  'tcns@hcmute.edu.vn',
  'Quản trị Phòng Tổ chức – Nhân sự',
  'TCNS',
  'Phòng Tổ chức - Nhân sự',
  'Trưởng phòng',
  'admin',
  'google',
  'active',
  true
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  has_selected_unit = true;

-- 3. Bổ sung chỉ mục truy vấn tốc độ cao cho audit_logs, workbooks và session_participants
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_created
  ON public.audit_logs(record_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workbooks_active_updated
  ON public.workbooks(is_deleted, updated_at DESC);
