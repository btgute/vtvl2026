import { SplitResultSummary } from '@/types/vtvl';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { ND232_2026_VTVL_CATALOG } from '@/configs/hcmute-nd232-catalog';
import { DM_CHUC_DANH_TT31_TABLE } from '@/configs/hcmute-erd-tables';
import { STANDARD_PRODUCTS_CATALOG } from '@/configs/hcmute-hd07-catalog';

export const SUPABASE_PROJECT_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();

export function getSupabaseAnonKey(): string {
  if (typeof window !== 'undefined') {
    const localKey = window.localStorage.getItem('HCMUTE_SUPABASE_ANON_KEY');
    if (localKey) return localKey.trim();
  }
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_PROJECT_URL && getSupabaseAnonKey());
}

function buildHeaders(apiKey: string, upsertConflictCol?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: apiKey,
    Prefer: upsertConflictCol
      ? 'resolution=merge-duplicates,return=minimal'
      : 'return=minimal'
  };
  if (apiKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}

async function postRest(table: string, payload: unknown, upsertConflictCol?: string): Promise<boolean> {
  const apiKey = getSupabaseAnonKey();
  if (!SUPABASE_PROJECT_URL || !apiKey) return false;

  const query = upsertConflictCol ? `?on_conflict=${encodeURIComponent(upsertConflictCol)}` : '';
  const url = `${SUPABASE_PROJECT_URL}/rest/v1/${table}${query}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(apiKey, upsertConflictCol),
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncActivityToSupabase(
  unitCode: string,
  unitName: string,
  action: string,
  detail: string
): Promise<boolean> {
  return postRest('s_nhat_ky', {
    ma_don_vi: unitCode,
    ten_don_vi: unitName,
    hanh_dong: action,
    chi_tiet: detail,
    phien_ban: 'v1'
  });
}

export async function seedMasterCatalogsToSupabase(): Promise<boolean> {
  const unitsPayload = HCMUTE_UNITS.map((u) => ({
    ma_don_vi: u.code,
    ten_don_vi_vi: u.nameVi,
    ten_don_vi_en: u.nameEn,
    khoi_don_vi: u.group,
    linh_vuc: u.domain,
    chuc_danh_thu_truong_vi: u.headTitleVi,
    chuc_danh_thu_truong_en: u.headTitleEn,
    so_nhan_su_mac_dinh: u.defaultStaffCount
  }));

  const tt31Payload = DM_CHUC_DANH_TT31_TABLE.map((c) => ({
    ma_so_chuc_danh: c.maSoChucDanh,
    ten_chuc_danh: c.tenChucDanh,
    khoan_dieu_tt31: c.khoanDieuTt31,
    loai_vien_chuc: c.loaiVienChuc,
    khung_he_so_luong: c.khungHeSoLuong,
    dien_chuyen_tiep: c.dienChuyenTiep,
    ghi_chu_bo_nhiem: c.ghiChuBoNhiem
  }));

  const vtvlPayload = ND232_2026_VTVL_CATALOG.map((v) => ({
    ma_danh_muc_nd232: v.maDanhMucNd232,
    tt_toan_truong: v.ttToanTruong,
    tt_trong_nhom: v.ttTrongNhom,
    nhom_vtvl_4: v.vtvlGroup4,
    ten_khung_vtvl_truong: v.positionName,
    gioi_han_bac_nghe_nghiep: v.careerLevel,
    ds_bac_cho_phep: v.allowedLevels,
    cong_thuc_ten_cu_the: v.namingFormulaRule,
    ma_so_chuc_danh: v.maChucDanhTt31,
    ky_hieu_goi_y: v.linkedCodeHint,
    pham_vi_ap_dung: v.hcmuteUnitsHint
  }));

  const spPayload = STANDARD_PRODUCTS_CATALOG.map((sp) => ({
    ma_sp_chuan: sp.productCode,
    ten_loai_sp: sp.productName,
    khoi_nganh_linh_vuc: sp.sector,
    nhom_la_ma: sp.romanGroup,
    phut_sp_chuan: sp.standardMinutes,
    van_ban_xac_nhan: sp.approvalDoc,
    trang_thai: sp.status,
    co_quan_xac_nhan: sp.authority,
    ngay_hieu_luc: sp.effectiveDate,
    pham_vi_ap_dung: sp.scopeNote
  }));

  const okUnits = await postRest('dm_don_vi', unitsPayload, 'ma_don_vi');
  await postRest('dm_chuc_danh_tt31', tt31Payload, 'ma_so_chuc_danh');
  await postRest('dm_vtvl_khung_truong', vtvlPayload, 'ma_danh_muc_nd232');
  await postRest('dm_san_pham', spPayload, 'ma_sp_chuan');
  return okUnits;
}

export async function syncUnitSplitToSupabase(summary: SplitResultSummary): Promise<boolean> {
  await seedMasterCatalogsToSupabase();

  const c1Rows = summary.positionBreakdown.map((p) => ({
    ma_vtvl: p.vtvlCode,
    ma_don_vi: summary.unitCode,
    nhom_vtvl_4: p.vtvlGroup4 || 'II. Nhóm VTVL Chuyên môn, nghiệp vụ',
    ten_khung_vtvl_truong: p.frameworkTitle || p.vtvlName,
    ten_vtvl_cu_the_don_vi: p.vtvlName,
    bac_nghe_nghiep_su_dung: p.careerLevel || 'Bậc 3',
    ma_ngach_chuc_danh: p.ngachCode,
    loai_nhan_luc: 'Viên chức',
    che_do_lam_viec: p.workingRegime,
    gio_chuan_pp2: p.standardHoursYear,
    phuong_phap: p.method,
    gio_b1_nam: p.b1HoursYear,
    gio_b2_tac_dong: p.b2NetHoursYear,
    gio_rong_nam: p.netHoursYear,
    nhu_cau_fte: p.recommendedFte
  }));

  await postRest('c1_vtvl', c1Rows, 'ma_vtvl');

  return postRest(
    't_tien_do',
    {
      ma_don_vi: summary.unitCode,
      ten_don_vi: summary.unitNameVi,
      phien_ban: `v${summary.version}`,
      so_nhiem_vu_a1: summary.missionCount,
      so_cong_viec_a2: summary.taskCount,
      so_vtvl_c1: summary.vtvlCount,
      tong_fte_c3: summary.totalStandardFte,
      trang_thai_ra_soat: 'Đã khởi tạo và đồng bộ trực tuyến Supabase',
      du_lieu_ho_so_json: {
        unitFileName: summary.unitFileName,
        positionBreakdown: summary.positionBreakdown
      }
    },
    'ma_don_vi'
  );
}
