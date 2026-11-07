import { AuditReportResult, NgachAllocationRow, ProposedVtvlRow, SplitResultSummary, UnitScaleMetrics } from '@/types/vtvl';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';
import { ND232_2026_VTVL_CATALOG } from '@/configs/hcmute-nd232-catalog';
import { DM_CHUC_DANH_TT31_TABLE } from '@/configs/hcmute-erd-tables';
import { MISSIONS_BY_GROUP, STANDARD_PRODUCTS_CATALOG } from '@/configs/hcmute-hd07-catalog';

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
    Prefer: upsertConflictCol ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal'
  };
  if (apiKey.startsWith('eyJ')) headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

async function postRest(table: string, payload: unknown, upsertConflictCol?: string): Promise<boolean> {
  const apiKey = getSupabaseAnonKey();
  if (!SUPABASE_PROJECT_URL || !apiKey) return false;
  const query = upsertConflictCol ? `?on_conflict=${encodeURIComponent(upsertConflictCol)}` : '';
  const url = `${SUPABASE_PROJECT_URL}/rest/v1/${table}${query}`;
  try {
    const res = await fetch(url, { method: 'POST', headers: buildHeaders(apiKey, upsertConflictCol), body: JSON.stringify(payload) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncActivityToSupabase(
  unitCode: string,
  unitName: string,
  action: string,
  detail: string,
  actorEmail?: string,
  actorTitle?: string
): Promise<boolean> {
  const actorTag = actorEmail || actorTitle ? ` [Người thực hiện: ${actorTitle || 'Chưa rõ chức vụ'} — ${actorEmail || 'Chưa rõ email'}]` : '';
  const fullDetail = `${detail}${actorTag}`;
  const okWithCols = await postRest('s_nhat_ky', {
    ma_don_vi: unitCode,
    ten_don_vi: unitName,
    hanh_dong: action,
    chi_tiet: fullDetail,
    email_nguoi_thuc_hien: actorEmail || null,
    chuc_vu_nguoi_thuc_hien: actorTitle || null,
    phien_ban: 'v1'
  });
  if (okWithCols) return true;
  return postRest('s_nhat_ky', { ma_don_vi: unitCode, ten_don_vi: unitName, hanh_dong: action, chi_tiet: fullDetail, phien_ban: 'v1' });
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

export async function syncUnitSplitToSupabase(
  summary: SplitResultSummary,
  extra?: { scaleMetrics?: UnitScaleMetrics; ngachAllocations?: NgachAllocationRow[]; proposedPositions?: ProposedVtvlRow[] }
): Promise<boolean> {
  await seedMasterCatalogsToSupabase();

  const c1Rows = summary.positionBreakdown.map((p) => {
    const fwMatch = ND232_2026_VTVL_CATALOG.find((f) => f.positionName === (p.frameworkTitle || p.vtvlName));
    return {
      ma_vtvl: p.vtvlCode,
      ma_don_vi: summary.unitCode,
      ma_danh_muc_nd232: fwMatch?.maDanhMucNd232 || null,
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
    };
  });

  const a1Rows = (MISSIONS_BY_GROUP[summary.kind] || []).map((m) => ({
    ma_nhiem_vu: `${summary.unitCode}-${m.missionSuffix}`,
    ma_don_vi: summary.unitCode,
    ten_nhiem_vu: m.missionName,
    can_cu_phap_ly: m.legalBasis,
    ky_thong_ke: '01/10/2025–30/9/2026',
    trang_thai_nv: m.status,
    nguon_nhiem_vu: m.source
  }));

  const c3Rows = summary.positionBreakdown.map((p) => ({
    ma_vtvl: p.vtvlCode,
    ma_don_vi: summary.unitCode,
    phuong_phap: p.method,
    gio_b1_nam: p.b1HoursYear,
    gio_tac_dong_b2: p.b2NetHoursYear,
    gio_rong_nam: p.netHoursYear,
    gio_chuan_pp2: p.standardHoursYear,
    nguoi_quy_doi_pp2: p.recommendedFte,
    nguoi_dinh_bien_pp1: p.method.includes('PP1') ? 1 : 0,
    nguoi_can_bo_tri: p.recommendedFte
  }));

  await postRest('c1_vtvl', c1Rows, 'ma_vtvl');
  await postRest('a1_nhiem_vu', a1Rows, 'ma_nhiem_vu');
  await postRest('c3_nhu_cau', c3Rows, 'ma_vtvl');

  if (extra?.scaleMetrics) {
    const sm = extra.scaleMetrics;
    await postRest(
      'sldv_quy_mo_don_vi',
      {
        ma_don_vi: summary.unitCode,
        so_sinh_vien_quy_doi: sm.studentCount,
        so_nganh_ctdt: sm.programCount,
        so_lop_hoc_phan_nam: sm.courseSectionCount,
        so_phong_tn_xuong: sm.labWorkshopCount,
        so_de_tai_nckh_nam: sm.researchTopicCount,
        so_van_ban_ho_so_nam: sm.adminDocCount,
        he_so_quy_mo: sm.scaleMultiplier
      },
      'ma_don_vi'
    );
  }

  if (extra?.ngachAllocations && extra.ngachAllocations.length > 0) {
    const posMap = new Map((extra.proposedPositions || []).map((pos) => [pos.id, `${summary.unitCode}-${pos.vtvlSuffix}`]));
    const ngachRows = extra.ngachAllocations
      .map((ng) => ({
        id: `${summary.unitCode}-${ng.id}`,
        ma_don_vi: summary.unitCode,
        ma_ngach: ng.ngachCode,
        ten_ngach: ng.ngachName,
        so_nguoi: ng.count,
        ma_vtvl_xep_vao: posMap.get(ng.targetPositionId) || c1Rows[0]?.ma_vtvl || `${summary.unitCode}-GV-01`,
        la_dong_tach: Boolean(ng.isSplitRow),
        ghi_chu: ng.note || null
      }))
      .filter((r) => c1Rows.some((c) => c.ma_vtvl === r.ma_vtvl_xep_vao));
    if (ngachRows.length > 0) {
      await postRest('sldv_phan_bo_ngach', ngachRows, 'id');
    }
  }

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
      email_nguoi_thuc_hien: summary.actorEmail || null,
      chuc_vu_nguoi_thuc_hien: summary.actorTitle || null,
      trang_thai_ra_soat: 'Đã khởi tạo và đồng bộ trực tuyến Supabase',
      du_lieu_ho_so_json: {
        unitFileName: summary.unitFileName,
        actorEmail: summary.actorEmail || '',
        actorTitle: summary.actorTitle || '',
        positionBreakdown: summary.positionBreakdown
      }
    },
    'ma_don_vi'
  );
}

export async function syncAuditResultToSupabase(report: AuditReportResult, unitCode: string): Promise<boolean> {
  if (!unitCode || unitCode === 'X99') return false;
  const checkDefs = [
    { stt: 1, pair: 'A1 ↔ A2', label: 'Mọi nhiệm vụ A1 đều có đầu việc A2', sheet: 'A1' },
    { stt: 2, pair: 'A2 ↔ B1', label: 'Mọi đầu việc A2 đều có thống kê sản lượng & thời gian B1', sheet: 'B1' },
    { stt: 3, pair: 'B1 ↔ DM', label: 'Độ lệch phút/SP thực tế so với chuẩn có giải trình hợp lệ', sheet: 'DM' },
    { stt: 4, pair: 'B2_CT ↔ B2', label: 'Tổng giờ giảm số hóa khớp giữa B2_CT và B2', sheet: 'B2' },
    { stt: 5, pair: 'C1 ↔ C2 ↔ C3', label: 'Danh mục VTVL, khung năng lực bậc 1–5 và FTE đồng bộ', sheet: 'C3' },
    { stt: 6, pair: 'C3 ↔ D1 ↔ D2', label: 'Phương án biên chế D2 khớp chênh lệch giữa C3 và D1', sheet: 'D2' }
  ];
  const kRows = checkDefs.map((def) => {
    const errCount = report.issues.filter((iss) => iss.sheet === def.sheet && iss.severity === 'fix').length;
    return {
      ma_don_vi: unitCode,
      stt_chi_tieu: def.stt,
      nhom_bieu_doi_soat: def.pair,
      noi_dung_kiem_tra: def.label,
      so_dong_loi: errCount,
      ket_luan: errCount === 0 ? 'ĐẠT' : 'CẦN RÀ SOÁT'
    };
  });
  await postRest('k_kiem_tra', kRows, 'ma_don_vi,stt_chi_tieu');

  const evidenceRows = report.evidenceItems.slice(0, 50).map((ev) => ({
    ma_don_vi: unitCode,
    loai_bang: 'Chua_du_can_cu',
    bieu_nguon: ev.sheet,
    toa_do_o: ev.cellRef,
    ma_tham_chieu: ev.refCode,
    noi_dung_phat_hien: ev.taskOrPositionName,
    nguyen_nhan: ev.reasonHint,
    thoi_han_bo_sung: 'Trước khi trình Hội đồng Trường',
    dau_moi_phu_trach: unitCode
  }));
  if (evidenceRows.length > 0) {
    await postRest('ra_soat_chua_du_can_cu', evidenceRows);
  }
  return true;
}
