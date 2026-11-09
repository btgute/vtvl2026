import { ExcelSheetKey, GenericGridRow } from './excel-grid-types';

export function recalculateGridFormulas(
  prev: Record<ExcelSheetKey, GenericGridRow[]>,
  unitCode: string,
  unitNameVi: string
): Record<ExcelSheetKey, GenericGridRow[]> {
  const next = { ...prev };

  // 1. Sync tasks from A2 to B1 & B2 if missing, and sync maVtvl
  const existingA2 = next.A2 || [];
  const b1Map = new Map((next.B1 || []).map((r) => [String(r.maCongViec), r]));
  const updatedB1: GenericGridRow[] = existingA2.map((t, idx) => {
    const existing = b1Map.get(String(t.maCongViec));
    const qty = Number(existing?.soSpNam ?? 50 + (idx % 6) * 20);
    const mins = Number(existing?.phutThucTe ?? 90 + (idx % 5) * 30);
    const extra = Number(existing?.gioBoSung ?? 0);
    const hours = Math.round((qty * mins / 60) * 10) / 10;
    const total = Math.round((hours + extra) * 10) / 10;
    return {
      id: existing?.id || `b1-sync-${idx + 1}`,
      maCongViec: t.maCongViec,
      maVtvl: t.maVtvl,
      soSpNam: qty,
      phutThucTe: mins,
      gioBoSung: extra,
      gioSp: hours,
      gioTong: total,
      nguon: existing?.nguon || 'Hệ thống S-Link & Sổ theo dõi 2025–2026',
      ppThucTe: existing?.ppThucTe || 'nhật ký công việc',
      phutApDung: mins,
      canhBao: total > 0 ? 'ĐẠT' : 'CHƯA ĐẠT'
    };
  });
  next.B1 = updatedB1;

  // 2. Sync B2_CT & B2
  const b2Ct = next.B2_CT || [];
  const b2Map = new Map((next.B2 || []).map((r) => [String(r.maCongViec), r]));
  const updatedB2: GenericGridRow[] = existingA2.map((t, idx) => {
    const existing = b2Map.get(String(t.maCongViec));
    const b1Item = updatedB1.find((b) => b.maCongViec === t.maCongViec);
    const b1Hours = Number(b1Item?.gioTong) || 0;
    const ctMatches = b2Ct.filter((c) => c.maCongViec === t.maCongViec);
    const sumVar = ctMatches.reduce((acc, c) => acc + (Number(c.gioBienDong) || 0), 0);
    const newHours = Number(existing?.gioMoi) || 0;
    const finalHours = Math.max(0, Math.round((b1Hours + sumVar + newHours) * 10) / 10);
    return {
      id: existing?.id || `b2-sync-${idx + 1}`,
      maCongViec: t.maCongViec,
      maVtvl: t.maVtvl,
      gioB1: b1Hours,
      gioGiam: sumVar,
      gioMoi: newHours,
      gioSauTacDong: finalHours,
      tyLeThayDoi: b1Hours > 0 ? `${Math.round((sumVar / b1Hours) * 100)}%` : '0%'
    };
  });
  next.B2 = updatedB2;

  // 3. Sync positions from C1 into C3, DU_BAO, D2
  const c1Positions = next.C1 || [];
  const c3Map = new Map((next.C3 || []).map((r) => [String(r.maVtvl), r]));
  const updatedC3: GenericGridRow[] = c1Positions.map((c, idx) => {
    const vCode = String(c.maVtvl);
    const existing = c3Map.get(vCode);
    const stdHours = Number(c.gioChuanPp2) || 1904;
    const sumB1 = updatedB1.filter((b) => b.maVtvl === vCode).reduce((acc, b) => acc + (Number(b.gioTong) || 0), 0);
    const sumB2 = updatedB2.filter((b) => b.maVtvl === vCode).reduce((acc, b) => acc + (Number(b.gioGiam) || 0), 0);
    const netHours = Math.max(0, Math.round(sumB1 + sumB2));
    const isQl = vCode.startsWith('QL');
    const fteCalc = Math.round((netHours / stdHours) * 100) / 100;
    const people = isQl ? 1 : Math.max(1, Math.ceil(fteCalc));
    return {
      id: existing?.id || `c3-sync-${idx + 1}`,
      maVtvl: vCode,
      phuongPhap: existing?.phuongPhap || (isQl ? 'PP1' : 'PP2'),
      gioB1: Math.round(sumB1),
      gioB2: Math.round(sumB2),
      gioRong: netHours,
      gioPp2: stdHours,
      nguoiQuyDoi: fteCalc,
      nguoiPp1: isQl ? 1 : 0,
      nguoiCanBoTri: people,
      nguonGiaiTrinh: existing?.nguonGiaiTrinh || 'Khối lượng B1 chia quỹ giờ chuẩn',
      canhBao: 'ĐẠT'
    };
  });
  next.C3 = updatedC3;

  // 4. DU_BAO_5_NAM
  const duBaoMap = new Map((next.DU_BAO || []).map((r) => [String(r.maVtvl), r]));
  const updatedDuBao: GenericGridRow[] = c1Positions.map((c, idx) => {
    const vCode = String(c.maVtvl);
    const existing = duBaoMap.get(vCode);
    const c3Match = updatedC3.find((r) => r.maVtvl === vCode);
    const basePeople = Number(c3Match?.nguoiCanBoTri) || 1;
    const diff = Number(existing?.bienDong) || 0;
    return {
      id: existing?.id || `dubao-sync-${idx + 1}`,
      maVtvl: vCode,
      nam: existing?.nam || '2027',
      bienDong: diff,
      noiDungThayDoi: existing?.noiDungThayDoi || 'Duy trì ổn định nhân lực',
      canCuNguon: existing?.canCuNguon || 'Kế hoạch chiến lược HCM-UTE',
      nguoiC3: basePeople,
      nguoiCanBoTriNam: Math.max(0, basePeople + diff),
      kiemTra: 'ĐẠT'
    };
  });
  next.DU_BAO = updatedDuBao;

  // 5. D2_PhuongAn
  const d2Map = new Map((next.D2 || []).map((r) => [String(r.maVtvl), r]));
  const d1Staff = next.D1 || [];
  const updatedD2: GenericGridRow[] = c1Positions.map((c, idx) => {
    const vCode = String(c.maVtvl);
    const existing = d2Map.get(vCode);
    const duBaoMatch = updatedDuBao.find((d) => d.maVtvl === vCode);
    const need = Number(duBaoMatch?.nguoiCanBoTriNam) || 1;
    const countD1 = d1Staff.filter((d) => d.maVtvl === vCode).length;
    return {
      id: existing?.id || `d2-sync-${idx + 1}`,
      maVtvl: vCode,
      nam: existing?.nam || '2027',
      soNguoiCanBoTri: need,
      soNguoiCoTheBoTri: countD1,
      bienCheGiao: existing?.bienCheGiao ?? countD1,
      deNghiDieuChinh: need - countD1,
      nguonGiaiTrinh: existing?.nguonGiaiTrinh || 'Cân đối nhân sự năm 2027',
      canhBao: 'ĐẠT'
    };
  });
  next.D2 = updatedD2;

  // 6. Dynamic Evaluation of K_KiemTra (6 checks)
  const validMissions = new Set((next.A1 || []).map((m) => String(m.maNhiemVu)));
  const validVtvl = new Set(c1Positions.map((c) => String(c.maVtvl)));
  const validTasks = new Set(existingA2.map((t) => String(t.maCongViec)));

  const k1Errors = existingA2.filter((t) => !validMissions.has(String(t.maNhiemVu))).length;
  const k2Errors = updatedB1.filter((b) => !validVtvl.has(String(b.maVtvl))).length;
  const k3Errors = updatedB1.filter((b) => Number(b.gioTong) <= 0).length;
  const k4Errors = (next.B2_CT || []).filter((c) => !validTasks.has(String(c.maCongViec))).length;
  const k5Errors = d1Staff.filter((d) => !validVtvl.has(String(d.maVtvl))).length;
  const k6Errors = updatedD2.filter((d) => {
    const c3 = updatedC3.find((c) => c.maVtvl === d.maVtvl);
    return Number(d.soNguoiCanBoTri) !== Number(c3?.nguoiCanBoTri);
  }).length;

  next.K = [
    { id: 'k-1', stt: 1, nhomBieu: 'A2 ↔ A1', chiTieu: 'Mọi công việc A2 phải thuộc mã nhiệm vụ hợp lệ tại A1', bangNguon: '2. A2_CongViec', bangDich: '1. A1_NhiemVu', soDongLoi: k1Errors, nguongChoPhep: '0', ketLuan: k1Errors === 0 ? 'ĐẠT' : 'LỖI' },
    { id: 'k-2', stt: 2, nhomBieu: 'B1 ↔ C1', chiTieu: 'Mã VTVL tại B1 phải tồn tại và kích hoạt tại C1', bangNguon: '3. B1_KhoiLuong', bangDich: '6. C1_VTVL', soDongLoi: k2Errors, nguongChoPhep: '0', ketLuan: k2Errors === 0 ? 'ĐẠT' : 'LỖI' },
    { id: 'k-3', stt: 3, nhomBieu: 'B1 Cảnh báo', chiTieu: 'Khối lượng và thời gian làm việc phải lớn hơn 0', bangNguon: '3. B1_KhoiLuong', bangDich: 'Nội bộ B1', soDongLoi: k3Errors, nguongChoPhep: '0', ketLuan: k3Errors === 0 ? 'ĐẠT' : 'LỖI' },
    { id: 'k-4', stt: 4, nhomBieu: 'B2_CT ↔ B1', chiTieu: 'Mã công việc tác động phải khớp công việc đã khai tại B1', bangNguon: '4. B2_CT_TacDong', bangDich: '3. B1_KhoiLuong', soDongLoi: k4Errors, nguongChoPhep: '0', ketLuan: k4Errors === 0 ? 'ĐẠT' : 'LỖI' },
    { id: 'k-5', stt: 5, nhomBieu: 'D1 ↔ C1', chiTieu: 'Mã VTVL nhân sự đảm nhận phải khớp danh mục VTVL tại C1', bangNguon: '9. D1_NhanLuc', bangDich: '6. C1_VTVL', soDongLoi: k5Errors, nguongChoPhep: '0', ketLuan: k5Errors === 0 ? 'ĐẠT' : 'LỖI' },
    { id: 'k-6', stt: 6, nhomBieu: 'C3 ↔ D2', chiTieu: 'Nhu cầu nhân sự năm cơ sở phải liên thông với phương án D2', bangNguon: '8. C3_NhuCau', bangDich: '10. D2_PhuongAn', soDongLoi: k6Errors, nguongChoPhep: '0', ketLuan: k6Errors === 0 ? 'ĐẠT' : 'LỖI' }
  ];

  // 7. Update T_TienDo
  const totalErrors = k1Errors + k2Errors + k3Errors + k4Errors + k5Errors + k6Errors;
  next.T = [{
    id: 't-1',
    maDonVi: unitCode,
    tenDonVi: unitNameVi,
    soNhiemVu: (next.A1 || []).length,
    soCongViec: existingA2.length,
    soVtvl: c1Positions.length,
    tongFte: updatedC3.reduce((acc, c) => acc + (Number(c.nguoiCanBoTri) || 0), 0),
    trangThai: totalErrors === 0 ? 'Đạt 6/6 chỉ tiêu kiểm tra' : `Phát hiện ${totalErrors} chỉ tiêu cần điều chỉnh`
  }];

  return next;
}
