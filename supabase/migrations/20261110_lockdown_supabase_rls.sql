-- ==============================================================================
-- BẢN MIGRATION BẢO MẬT P0: KHÓA QUYỀN ĐỌC/GHI CÔNG KHAI SUPABASE (ANONYMOUS LOCKDOWN)
-- Ngày tạo: 10/11/2026
-- Dự án: HCM-UTE VTVL 360 & S-Link
-- Phiên bản: 20261110_lockdown_supabase_rls.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BẬT ROW LEVEL SECURITY (RLS) TRÊN TOÀN BỘ CÁC BẢNG NGHIỆP VỤ & DANH MỤC
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.s_nhat_ky ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.c1_vtvl ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.t_tien_do ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workbook_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workbook_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dm_don_vi ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dm_chuc_danh_tt31 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dm_vtvl_khung_truong ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dm_san_pham ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. XÓA BỎ TOÀN BỘ CÁC CHÍNH SÁCH CŨ CHO PHÉP ANONYMOUS TRUY CẬP BẢNG NGHIỆP VỤ
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "rls_select_s_nhat_ky" ON public.s_nhat_ky;
DROP POLICY IF EXISTS "rls_insert_s_nhat_ky" ON public.s_nhat_ky;
DROP POLICY IF EXISTS "rls_update_s_nhat_ky" ON public.s_nhat_ky;

DROP POLICY IF EXISTS "rls_select_c1_vtvl" ON public.c1_vtvl;
DROP POLICY IF EXISTS "rls_insert_c1_vtvl" ON public.c1_vtvl;
DROP POLICY IF EXISTS "rls_update_c1_vtvl" ON public.c1_vtvl;

DROP POLICY IF EXISTS "rls_select_t_tien_do" ON public.t_tien_do;
DROP POLICY IF EXISTS "rls_insert_t_tien_do" ON public.t_tien_do;
DROP POLICY IF EXISTS "rls_update_t_tien_do" ON public.t_tien_do;

DROP POLICY IF EXISTS "Cho phép đọc workbooks hợp lệ" ON public.workbooks;
DROP POLICY IF EXISTS "Cho phép cập nhật workbooks qua API" ON public.workbooks;
DROP POLICY IF EXISTS "Tra cứu participants theo email chuẩn hóa" ON public.session_participants;
DROP POLICY IF EXISTS "Ghi nhận participant trong phiên" ON public.session_participants;
DROP POLICY IF EXISTS "Đọc revisions của workbook" ON public.workbook_revisions;
DROP POLICY IF EXISTS "Ghi nhận revision mới" ON public.workbook_revisions;
DROP POLICY IF EXISTS "Chỉ cho phép thêm audit logs (Append-only)" ON public.audit_logs;
DROP POLICY IF EXISTS "Chỉ đọc audit logs" ON public.audit_logs;

-- ------------------------------------------------------------------------------
-- 3. THU HỒI TOÀN BỘ QUYỀN TRUY CẬP CỦA ROLE "anon" TRÊN CÁC BẢNG NGHIỆP VỤ
-- ------------------------------------------------------------------------------
REVOKE ALL ON public.s_nhat_ky FROM anon;
REVOKE ALL ON public.c1_vtvl FROM anon;
REVOKE ALL ON public.t_tien_do FROM anon;
REVOKE ALL ON public.workbooks FROM anon;
REVOKE ALL ON public.workbook_sessions FROM anon;
REVOKE ALL ON public.session_participants FROM anon;
REVOKE ALL ON public.workbook_revisions FROM anon;
REVOKE ALL ON public.audit_logs FROM anon;

-- Chỉ cấp quyền cho service_role trên backend máy chủ
GRANT ALL ON public.s_nhat_ky TO service_role;
GRANT ALL ON public.c1_vtvl TO service_role;
GRANT ALL ON public.t_tien_do TO service_role;
GRANT ALL ON public.workbooks TO service_role;
GRANT ALL ON public.workbook_sessions TO service_role;
GRANT ALL ON public.session_participants TO service_role;
GRANT ALL ON public.workbook_revisions TO service_role;
GRANT ALL ON public.audit_logs TO service_role;

-- ------------------------------------------------------------------------------
-- 4. BẢO VỆ DANH MỤC TRA CỨU CÔNG KHAI (CHỈ ĐỌC READ-ONLY, CẤM INSERT/UPDATE/DELETE)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "rls_select_dm_don_vi" ON public.dm_don_vi;
DROP POLICY IF EXISTS "rls_insert_dm_don_vi" ON public.dm_don_vi;
DROP POLICY IF EXISTS "rls_update_dm_don_vi" ON public.dm_don_vi;
CREATE POLICY "rls_read_only_dm_don_vi" ON public.dm_don_vi
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "rls_select_dm_chuc_danh_tt31" ON public.dm_chuc_danh_tt31;
DROP POLICY IF EXISTS "rls_insert_dm_chuc_danh_tt31" ON public.dm_chuc_danh_tt31;
DROP POLICY IF EXISTS "rls_update_dm_chuc_danh_tt31" ON public.dm_chuc_danh_tt31;
CREATE POLICY "rls_read_only_dm_chuc_danh_tt31" ON public.dm_chuc_danh_tt31
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "rls_select_dm_vtvl_khung_truong" ON public.dm_vtvl_khung_truong;
DROP POLICY IF EXISTS "rls_insert_dm_vtvl_khung_truong" ON public.dm_vtvl_khung_truong;
DROP POLICY IF EXISTS "rls_update_dm_vtvl_khung_truong" ON public.dm_vtvl_khung_truong;
CREATE POLICY "rls_read_only_dm_vtvl_khung_truong" ON public.dm_vtvl_khung_truong
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "rls_select_dm_san_pham" ON public.dm_san_pham;
DROP POLICY IF EXISTS "rls_insert_dm_san_pham" ON public.dm_san_pham;
DROP POLICY IF EXISTS "rls_update_dm_san_pham" ON public.dm_san_pham;
CREATE POLICY "rls_read_only_dm_san_pham" ON public.dm_san_pham
    FOR SELECT TO anon, authenticated USING (true);

-- ------------------------------------------------------------------------------
-- 5. LÀM SẠCH CHUỖI "chi_tiet" CŨ ĐÃ GHÉP EMAIL NGƯỜI THỰC HIỆN TRONG s_nhat_ky
-- ------------------------------------------------------------------------------
UPDATE public.s_nhat_ky
SET chi_tiet = trim(regexp_replace(chi_tiet, '\s*\[Người thực hiện:\s*[^\]]+\]', '', 'g'))
WHERE chi_tiet ~ '\[Người thực hiện:';

-- ------------------------------------------------------------------------------
-- 6. CHÍNH SÁCH BẢO VỆ BẢNG AUDIT_LOGS (APPEND-ONLY TRÊN BACKEND MÁY CHỦ)
-- ------------------------------------------------------------------------------
CREATE POLICY "audit_logs_insert_service" ON public.audit_logs
    FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "audit_logs_select_service" ON public.audit_logs
    FOR SELECT TO service_role USING (true);

-- ------------------------------------------------------------------------------
-- 7. KẾ HOẠCH ROLLBACK (KHI CẦN HỦY BỎ)
-- ------------------------------------------------------------------------------
-- Chạy khối lệnh sau để phục hồi trạng thái mở nếu cần:
-- GRANT ALL ON public.s_nhat_ky TO anon;
-- GRANT ALL ON public.c1_vtvl TO anon;
-- GRANT ALL ON public.t_tien_do TO anon;
-- CREATE POLICY "rls_select_s_nhat_ky" ON public.s_nhat_ky FOR SELECT TO anon USING (true);
-- CREATE POLICY "rls_select_c1_vtvl" ON public.c1_vtvl FOR SELECT TO anon USING (true);
-- CREATE POLICY "rls_select_t_tien_do" ON public.t_tien_do FOR SELECT TO anon USING (true);

