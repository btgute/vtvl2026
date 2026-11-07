import * as XLSX from 'xlsx';
import {
  AuditIssue,
  AuditReportResult,
  AuditSeverity,
  AuditSheetCode
} from '@/types/vtvl';
import { HCMUTE_UNITS } from '@/configs/hcmute-units';

export async function auditUnitWorkbooks(files: File[]): Promise<AuditReportResult> {
  const issues: AuditIssue[] = [];
  const unitSummaries: AuditReportResult['unitSummaries'] = [];

  for (const file of files) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });

    const nameMatch = /^([A-Za-z0-9-]+)_K2526_(v\d+)_(\d{8})\.xlsx$/i.exec(file.name);
    const unitCode = nameMatch ? nameMatch[1].toUpperCase() : file.name.split('_')[0].toUpperCase();
    const version = nameMatch ? nameMatch[2] : 'v1';
    const unitInfo = HCMUTE_UNITS.find((u) => u.code === unitCode);
    const unitName = unitInfo ? unitInfo.nameVi : `Đơn vị ${unitCode}`;

    let fileFix = 0;
    let fileEvidence = 0;
    let fileReview = 0;

    const pushIssue = (
      ruleId: string,
      sheet: AuditSheetCode,
      cellRef: string,
      severity: AuditSeverity,
      title: string,
      currentValue: string,
      suggestion: string
    ) => {
      if (severity === 'fix') fileFix++;
      else if (severity === 'evidence') fileEvidence++;
      else fileReview++;
      issues.push({
        id: `${file.name}-${ruleId}-${cellRef}-${issues.length}`,
        ruleId,
        fileName: file.name,
        unitCode,
        sheet,
        cellRef,
        severity,
        title,
        currentValue,
        suggestion
      });
    };

    const requiredPrefixes: { code: AuditSheetCode; match: string; desc: string }[] = [
      { code: 'A1', match: 'A1', desc: '1. A1_NhiemVu (Danh mục nhiệm vụ)' },
      { code: 'A2', match: 'A2', desc: '2. A2_CongViec (Danh mục công việc)' },
      { code: 'B1', match: 'B1', desc: '3. B1_KhoiLuong (Khối lượng & thời gian)' },
      { code: 'B2_CT', match: 'B2_CT', desc: '4. B2_CT_TacDong (Chi tiết tác động)' },
      { code: 'B2', match: 'B2_ThayDoi', desc: '5. B2_ThayDoi (Tổng hợp tác động)' },
      { code: 'C1', match: 'C1', desc: '6. C1_VTVL (Danh mục VTVL & quỹ giờ PP2)' },
      { code: 'C2', match: 'C2', desc: '7. C2_NangLuc (Bản mô tả & khung năng lực)' },
      { code: 'C3', match: 'C3', desc: '8. C3_NhuCau (Xác định nhu cầu PP1/PP2/PP3)' },
      { code: 'D1', match: 'D1', desc: '9. D1_NhanLuc (Nhân lực chốt 30/9/2026)' },
      { code: 'D2', match: 'D2', desc: '10. D2_PhuongAn (Phương án biên chế 2027–2031)' }
    ];

    for (const req of requiredPrefixes) {
      const found = wb.SheetNames.some((s) => s.includes(req.match) || (req.code === 'B2' && s.includes('B2')));
      if (!found) {
        pushIssue(`R-TEP-${req.code}`, 'Tệp', 'Workbook', 'fix', `Thiếu trang tính bắt buộc theo Hướng dẫn 07-HD/BTCTW: ${req.desc}`, `Không tìm thấy sheet ${req.match}`, 'Khởi tạo lại tệp đơn vị tại trang Tạo tệp đơn vị.');
      }
    }

    // Kiểm tra A2_CongViec xem có còn dẫn chiếu các Thông tư đã hết hiệu lực theo khoản 2 Điều 17 TT 31/2026/TT-BGDĐT không
    const a2Name = wb.SheetNames.find((s) => s.includes('A2'));
    if (a2Name) {
      const a2Rows = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[a2Name], { header: 1, defval: '' });
      for (let r = 2; r < a2Rows.length; r++) {
        const basis = String(a2Rows[r][7] || '').trim();
        if (/(40\/2020\/TT-BGDĐT|35\/2020\/TT-BGDĐT|07\/2023\/TT-BLĐTBXH|10\/2024\/TT-BLĐTBXH)/i.test(basis)) {
          pushIssue(
            'R-TT31-40',
            'A2',
            `A2_CongViec!H${r + 1}`,
            'fix',
            'Căn cứ pháp lý còn dẫn chiếu điều khoản Thông tư cũ đã hết hiệu lực theo khoản 2 Điều 17 Thông tư số 31/2026/TT-BGDĐT ngày 14/4/2026',
            basis,
            'Thay bằng: Nghị định số 232/2026/NĐ-CP & Thông tư số 31/2026/TT-BGDĐT ngày 14/4/2026.'
          );
        }
      }
    }

    // Kiểm tra 7. C2_NangLuc xem cột D (Chuyên môn) đã ghi rõ Bậc nghề nghiệp (Bậc 1–5) theo Nghị định 232/2026/NĐ-CP chưa
    const c2Name = wb.SheetNames.find((s) => s.includes('C2'));
    if (c2Name) {
      const c2Rows = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[c2Name], { header: 1, defval: '' });
      for (let r = 2; r < c2Rows.length; r++) {
        const vCode = String(c2Rows[r][0] || '').trim();
        const competency = String(c2Rows[r][3] || '').trim();
        if (!vCode) continue;
        if (!/bậc\s*[1-5]/i.test(competency) && !/phụ lục\s*i/i.test(competency)) {
          pushIssue(
            'R-ND232-BAC',
            'C2',
            `C2_NangLuc!D${r + 1}`,
            'review',
            `Khung năng lực chuyên môn của "${vCode}" chưa ghi rõ Bậc nghề nghiệp (Bậc 1 đến Bậc 5) theo Phụ lục II, III Nghị định 232/2026/NĐ-CP`,
            competency || 'Trống',
            'Ghi rõ Bậc nghề nghiệp theo Nghị định 232/2026/NĐ-CP (ví dụ: Bậc 5 - Giảng viên cao cấp; Bậc 4 - Giảng viên chính; từ Bậc 3 - Giảng viên; Bậc 2 đến Bậc 4 - Hành chính Tổng hợp).'
          );
        }
      }
    }

    const c1Name = wb.SheetNames.find((s) => s.includes('C1'));
    const validVtvlSet = new Set<string>();
    if (c1Name) {
      const c1Rows = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[c1Name], { header: 1, defval: '' });
      for (let r = 2; r < c1Rows.length; r++) {
        const row = c1Rows[r];
        const vCode = String(row[0] || '').trim();
        const vName = String(row[1] || '').trim();
        if (!vCode) continue;
        validVtvlSet.add(vCode);
        const excelRow = r + 1;
        const regime = String(row[9] || '').trim();
        const checkCol = String(row[10] || '').trim();
        if (vCode.startsWith('XXX')) {
          pushIssue('R-C1-01', 'C1', `C1_VTVL!A${excelRow}`, 'fix', 'Mã VTVL tại C1_VTVL còn giữ tiền tố mẫu XXX chưa đổi sang mã đơn vị HCM-UTE', vCode, `Đổi tiền tố XXX thành ${unitCode}.`);
        }
        if (vName.toLowerCase().includes('trợ giảng') || vCode.includes('V.07.01.23')) {
          pushIssue(
            'R-TT31-TG',
            'C1',
            `C1_VTVL!B${excelRow}`,
            'review',
            'Vị trí Trợ giảng (Bậc 3 đến Bậc 4 — Phụ lục II NĐ 232/2026/NĐ-CP; mã V.07.01.23) thuộc diện rà soát chuyển tiếp theo khoản 5 Điều 15 Thông tư số 31/2026/TT-BGDĐT',
            vName,
            'Rà soát: Nếu bổ nhiệm trước 31/3/2026 và đủ chuẩn nghề nghiệp Giảng viên (V.07.01.03) thì xét bổ nhiệm sang V.07.01.03.'
          );
        }
        if (regime && regime !== 'Phổ biến (40 giờ/tuần)' && regime !== 'Đặc thù') {
          pushIssue('R-C1-02', 'C1', `C1_VTVL!J${excelRow}`, 'fix', 'Chế độ làm việc tại C1_VTVL không thuộc danh mục chuẩn', regime, 'Chọn "Phổ biến (40 giờ/tuần)" hoặc "Đặc thù".');
        }
        if (checkCol && checkCol !== 'ĐẠT') {
          pushIssue('R-C1-03', 'C1', `C1_VTVL!K${excelRow}`, checkCol.includes('CHƯA XÁC NHẬN') ? 'evidence' : 'fix', `Cảnh báo kiểm tra quỹ giờ PP2 tại C1_VTVL: ${checkCol}`, checkCol, 'Kiểm tra cột Chế độ làm việc và xác nhận giờ riêng.');
        }
      }
    }

    const b1Name = wb.SheetNames.find((s) => s.includes('B1'));
    let taskCount = 0;
    if (b1Name) {
      const b1Rows = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[b1Name], { header: 1, defval: '' });
      const isHd07 = String(b1Rows[1]?.[0] || '').includes('Mã công việc');
      for (let r = 2; r < b1Rows.length; r++) {
        const row = b1Rows[r];
        const taskCode = String(isHd07 ? row[0] : row[3] || '').trim();
        const vtvlCode = String(row[1] || '').trim();
        if (!taskCode && !vtvlCode) continue;
        taskCount++;
        const excelRow = r + 1;
        const qty = Number(isHd07 ? row[2] : row[8]);
        const measuredMin = Number(isHd07 ? row[3] : row[10] || row[11]);
        const sourceQty = String(isHd07 ? row[7] : row[9] || '').trim();
        const sourceTime = String(isHd07 ? row[8] : '').trim();
        const stdMin = Number(isHd07 ? row[13] : row[15] || measuredMin);
        const warningColR = String(isHd07 ? row[17] : '').trim();
        const explanationColS = String(isHd07 ? row[18] : '').trim();

        if (!qty || qty <= 0) {
          pushIssue('R-B1-SL', 'B1', `B1_KhoiLuong!C${excelRow}`, 'fix', `THIẾU SẢN LƯỢNG: Công việc "${taskCode}" chưa có Số SP/năm (Cột C)`, String(qty || 'Trống'), 'Nhập số lượng sản phẩm thực tế phát sinh trong kỳ thống kê.');
        }
        if (!measuredMin || measuredMin <= 0) {
          pushIssue('R-B1-TG', 'B1', `B1_KhoiLuong!D${excelRow}`, 'fix', `THIẾU THỜI GIAN: Công việc "${taskCode}" chưa có Trung bình phút/SP (Cột D)`, String(measuredMin || 'Trống'), 'Đo tại trang Bấm giờ công việc hoặc nhập định mức Phút/SP hợp lệ.');
        }
        if (!sourceQty || sourceQty.includes('gợi ý – chưa đo') || sourceTime.includes('chờ nạp phiếu đo')) {
          pushIssue('R-B1-NGUON', 'B1', `B1_KhoiLuong!H${excelRow}`, 'evidence', `THIẾU NGUỒN XÁC THỰC: Nguồn sản lượng / thời gian của "${taskCode}" đang để gợi ý mẫu`, sourceQty || sourceTime || 'Trống', 'Nạp phiếu khảo sát ở Bước 4 hoặc ghi rõ nguồn văn bản E-Office.');
        }
        if (warningColR && warningColR !== 'ĐẠT') {
          pushIssue('R-B1-COLR', 'B1', `B1_KhoiLuong!R${excelRow}`, warningColR.includes('CHỜ XÁC NHẬN') || warningColR.includes('NGUỒN') ? 'evidence' : 'fix', `Cột R (Cảnh báo dữ liệu B1) báo mã lỗi: ${warningColR}`, warningColR, 'Hoàn thiện đầy đủ các cột bắt buộc trên dòng này.');
        }
        if (stdMin > 0 && measuredMin > 0 && Math.abs(measuredMin - stdMin) / stdMin > 0.3 && !explanationColS) {
          pushIssue('R-B1-LECH', 'B1', `B1_KhoiLuong!S${excelRow}`, 'review', `Phút/SP thực tế (${measuredMin}p) lệch trên 30% so với Phút/SP chuẩn (${stdMin}p) nhưng chưa ghi Giải trình (Cột S)`, `${measuredMin}p vs ${stdMin}p`, 'Ghi rõ nguyên nhân đặc thù tại Cột S biểu B1_KhoiLuong.');
        }
      }
    }

    const d1Name = wb.SheetNames.find((s) => s.includes('D1'));
    let staffCount = 0;
    if (d1Name) {
      const d1Rows = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[d1Name], { header: 1, defval: '' });
      const seenStaffIds = new Set<string>();
      for (let r = 2; r < d1Rows.length; r++) {
        const row = d1Rows[r];
        const sid = String(row[0] || row[1] || '').trim();
        if (!sid) continue;
        staffCount++;
        const excelRow = r + 1;
        if (seenStaffIds.has(sid)) {
          pushIssue('R-D1-TRUNG', 'D1', `D1_NhanLuc!A${excelRow}`, 'fix', `TRÙNG MÃ NGUỒN LỰC: Mã "${sid}" lặp lại nhiều dòng trên biểu 9. D1_NhanLuc`, sid, 'Mỗi cá nhân chốt tại 30/9/2026 chỉ khai 1 dòng duy nhất.');
        }
        seenStaffIds.add(sid);
        const stdH = Number(row[3] || 1904);
        const vtvlH = Number(row[4] || 0);
        const otherH = Number(row[5] || 0);
        if (stdH > 0 && vtvlH + otherH > stdH) {
          pushIssue('R-D1-VUOTGIO', 'D1', `D1_NhanLuc!E${excelRow}`, 'fix', `VƯỢT QUỸ GIỜ: Tổng giờ (${vtvlH + otherH}h) của "${sid}" vượt quỹ giờ năm (${stdH}h)`, `${vtvlH + otherH}h > ${stdH}h`, 'Điều chỉnh lại phân bổ giờ thực tế không vượt quá quỹ giờ chuẩn.');
        }
        const srcText = String(row[7] || '').trim();
        if (srcText.includes('V.07.01.23')) {
          pushIssue('R-TT31-TG-D1', 'D1', `D1_NhanLuc!H${excelRow}`, 'review', `Nhân lực "${sid}" đang giữ mã Trợ giảng (V.07.01.23) thuộc diện chuyển tiếp khoản 5 Điều 15 TT 31/2026/TT-BGDĐT`, srcText, 'Rà soát điều kiện bổ nhiệm sang chức danh Giảng viên (V.07.01.03) nếu bổ nhiệm trước 31/3/2026 và đủ chuẩn nghề nghiệp.');
        }
      }
    }

    const c3Name = wb.SheetNames.find((s) => s.includes('C3'));
    let proposedFte = 0;
    if (c3Name) {
      const c3Rows = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[c3Name], { header: 1, defval: '' });
      for (let r = 2; r < c3Rows.length; r++) {
        proposedFte += Number(c3Rows[r][9] || 0);
      }
    }

    unitSummaries.push({
      fileName: file.name, unitCode, unitName, version,
      vtvlCount: validVtvlSet.size, taskCount, staffCount,
      proposedFte: Number(proposedFte.toFixed(2)),
      fixCount: fileFix, evidenceCount: fileEvidence, reviewCount: fileReview
    });
  }

  const countsBySeverity: Record<AuditSeverity, number> = {
    fix: issues.filter((i) => i.severity === 'fix').length,
    evidence: issues.filter((i) => i.severity === 'evidence').length,
    review: issues.filter((i) => i.severity === 'review').length
  };
  const countsBySheet: Record<string, number> = {};
  issues.forEach((i) => {
    countsBySheet[i.sheet] = (countsBySheet[i.sheet] || 0) + 1;
  });

  return { filesCount: files.length, totalIssues: issues.length, countsBySeverity, countsBySheet, unitSummaries, issues };
}
