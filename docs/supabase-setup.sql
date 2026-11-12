-- ====================================================================
-- HƯỚNG DẪN THIẾT LẬP CƠ SỞ DỮ LIỆU SUPABASE CHO HCM-UTE VTVL 360
-- Chạy đoạn mã SQL này trong phần "SQL Editor" tại Supabase Dashboard:
-- https://supabase.com/dashboard/project/qhjodwlvwzlaasvpkhkr/sql
-- ====================================================================

-- 1. BẢNG TIẾN ĐỘ VÀ HỒ SƠ VỊ TRÍ VIỆC LÀM (t_tien_do)
CREATE TABLE IF NOT EXISTS public.t_tien_do (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ma_don_vi TEXT UNIQUE NOT NULL,
    ten_don_vi TEXT NOT NULL,
    phien_ban TEXT DEFAULT 'v1',
    so_nhiem_vu_a1 INTEGER DEFAULT 0,
    so_cong_viec_a2 INTEGER DEFAULT 0,
    so_vtvl_c1 INTEGER DEFAULT 0,
    tong_fte_c3 NUMERIC(8, 2) DEFAULT 0,
    trang_thai_ra_soat TEXT DEFAULT 'Đang khởi tạo',
    du_lieu_ho_so_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tối ưu chỉ mục tìm kiếm theo mã đơn vị và thời gian cập nhật
CREATE INDEX IF NOT EXISTS idx_t_tien_do_ma_don_vi ON public.t_tien_do(ma_don_vi);
CREATE INDEX IF NOT EXISTS idx_t_tien_do_updated_at ON public.t_tien_do(updated_at DESC);

-- 2. BẢNG NHẬT KÝ KIỂM TOÁN VÀ THAO TÁC (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_code TEXT NOT NULL,
    unit_name TEXT,
    action TEXT NOT NULL,
    details TEXT,
    actor_email TEXT,
    actor_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_unit ON public.audit_logs(unit_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 3. CẤP QUYỀN TRUY CẬP CHO ANON VÀ AUTHENTICATED
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.t_tien_do TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.audit_logs TO anon, authenticated, service_role;

-- 4. KÍCH HOẠT CHÍNH SÁCH BẢO VỆ DỮ LIỆU (RLS - Row Level Security)
ALTER TABLE public.t_tien_do ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc tiến độ và hồ sơ
DROP POLICY IF EXISTS "Allow select t_tien_do" ON public.t_tien_do;
CREATE POLICY "Allow select t_tien_do"
ON public.t_tien_do FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- Cho phép thêm hoặc cập nhật tiến độ
DROP POLICY IF EXISTS "Allow insert update t_tien_do" ON public.t_tien_do;
CREATE POLICY "Allow insert update t_tien_do"
ON public.t_tien_do FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- Cho phép ghi nhật ký thao tác
DROP POLICY IF EXISTS "Allow insert audit_logs" ON public.audit_logs;
CREATE POLICY "Allow insert audit_logs"
ON public.audit_logs FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- ====================================================================
-- HƯỚNG DẪN BẬT GOOGLE AUTH TRÊN SUPABASE:
-- 1. Vào Authentication -> Providers -> Google (Bật Enable Google)
-- 2. Điền Google Client ID & Google Client Secret (từ Google Cloud Console)
-- 3. Tại Google Cloud Console (Credentials -> OAuth 2.0 Client IDs):
--    Thêm Authorized redirect URI:
--    https://qhjodwlvwzlaasvpkhkr.supabase.co/auth/v1/callback
-- ====================================================================

