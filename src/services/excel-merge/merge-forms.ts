import * as XLSX from 'xlsx';

export interface MergeConflictItem {
  taskCode: string;
  taskName: string;
  field: string;
  formAName: string;
  valA: string | number;
  formBName: string;
  valB: string | number;
}

export interface MergeFormsResult {
  mergedFileName: string;
  mergedBlob: Blob;
  unitCode: string;
  oldVersion: number;
  newVersion: number;
  formsMergedCount: number;
  updatedTasksCount: number;
  measuredTasksCount: number;
  conflicts: MergeConflictItem[];
  logEntriesAdded: string[];
}

export async function mergeSurveyFormsIntoUnit(
  unitFile: File,
  formFiles: File[],
  mergeDate: string
): Promise<MergeFormsResult> {
  const unitBuf = await unitFile.arrayBuffer();
  const unitWb = XLSX.read(unitBuf, { type: 'array' });

  const nameMatch = /^([A-Za-z0-9-]+)_K2526_v(\d+)_(\d{8})\.xlsx$/i.exec(unitFile.name);
  const unitCode = nameMatch ? nameMatch[1].toUpperCase() : unitFile.name.split('_')[0].toUpperCase();
  const oldVersion = nameMatch ? parseInt(nameMatch[2], 10) : 1;
  const newVersion = oldVersion + 1;
  const compactDate = mergeDate.replace(/-/g, '');

  const b1SheetName =
    unitWb.SheetNames.find((s) => s.includes('B1_KhoiLuong') || s.includes('B1')) || unitWb.SheetNames[0];
  const b1Sheet = unitWb.Sheets[b1SheetName];
  const b1Data = XLSX.utils.sheet_to_json<(string | number)[]>(b1Sheet, { header: 1, defval: '' });

  const taskUpdates = new Map<
    string,
    {
      qty: number | string;
      measuredMin: number | string;
      sourceQty: string;
      sourceTime: string;
      fromFile: string;
    }
  >();
  const conflicts: MergeConflictItem[] = [];

  for (const formFile of formFiles) {
    const buf = await formFile.arrayBuffer();
    const fWb = XLSX.read(buf, { type: 'array' });
    const targetSheetName =
      fWb.SheetNames.find((s) => s.includes('B1') || s.includes('B2')) || fWb.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(fWb.Sheets[targetSheetName], {
      header: 1,
      defval: ''
    });

    // Detect if HD 07-HD/BTCTW 19-col B1 (col 0 = Mã công việc) or legacy B2 (col 3 = Mã công việc)
    const headerRow = rows[1] || [];
    const isHd07B1 = String(headerRow[0] || '').includes('Mã công việc');

    for (let r = 2; r < rows.length; r++) {
      const row = rows[r];
      const taskCode = String(isHd07B1 ? row[0] : row[3] || '').trim();
      if (!taskCode || !taskCode.includes('-')) continue;

      const qty = isHd07B1 ? row[2] : row[8];
      const measuredMin = isHd07B1 ? row[3] : row[10] !== '' ? row[10] : row[11];
      const sourceQty = String(isHd07B1 ? row[7] : row[9] || '').trim();
      const sourceTime = String(
        isHd07B1 ? row[8] : row[10] !== '' ? 'Phiếu đo bấm giờ thực tế' : 'Phiếu khảo sát đơn vị'
      ).trim();

      const prev = taskUpdates.get(taskCode);
      if (prev) {
        if (prev.qty !== '' && qty !== '' && Number(prev.qty) !== Number(qty)) {
          conflicts.push({
            taskCode,
            taskName: taskCode,
            field: 'Số SP/năm (Cột C)',
            formAName: prev.fromFile,
            valA: prev.qty,
            formBName: formFile.name,
            valB: qty
          });
        }
        if (
          prev.measuredMin !== '' &&
          measuredMin !== '' &&
          Number(prev.measuredMin) !== Number(measuredMin)
        ) {
          conflicts.push({
            taskCode,
            taskName: taskCode,
            field: 'Trung bình phút/SP (Cột D)',
            formAName: prev.fromFile,
            valA: prev.measuredMin,
            formBName: formFile.name,
            valB: measuredMin
          });
        }
      }

      taskUpdates.set(taskCode, {
        qty,
        measuredMin,
        sourceQty: sourceQty.replace(' (gợi ý – chưa đo)', '') || 'Phiếu khảo sát thực tế đơn vị',
        sourceTime:
          sourceTime.replace('Định mức gợi ý ban đầu (chờ nạp phiếu đo thực tế)', '') ||
          `Nạp từ ${formFile.name}`,
        fromFile: formFile.name
      });
    }
  }

  let updatedTasksCount = 0;
  let measuredTasksCount = 0;
  const b1HeaderRow = b1Data[1] || [];
  const isUnitHd07 = String(b1HeaderRow[0] || '').includes('Mã công việc');

  for (let r = 2; r < b1Data.length; r++) {
    const row = b1Data[r];
    const taskCode = String(isUnitHd07 ? row[0] : row[3] || '').trim();
    const upd = taskUpdates.get(taskCode);
    if (!upd) continue;

    if (isUnitHd07) {
      const newQty = upd.qty !== '' ? Number(upd.qty) : Number(row[2] || 0);
      const newMin = upd.measuredMin !== '' ? Number(upd.measuredMin) : Number(row[3] || 0);
      const extraHours = Number(row[4] || 0);
      const spHours = Number(((newQty * newMin) / 60).toFixed(1));
      const totalHours = Number((spHours + extraHours).toFixed(1));

      row[2] = newQty;
      row[3] = newMin;
      row[5] = spHours;
      row[6] = totalHours;
      row[7] = upd.sourceQty;
      row[8] = upd.sourceTime;
      row[15] = newMin;
      row[16] = upd.sourceTime;
      row[17] = newQty > 0 && newMin > 0 ? 'ĐẠT' : 'THIẾU DỮ LIỆU';
      measuredTasksCount++;
    } else {
      if (upd.qty !== '') row[8] = Number(upd.qty);
      if (upd.sourceQty) row[9] = upd.sourceQty;
      if (upd.measuredMin !== '') {
        row[10] = Number(upd.measuredMin);
        measuredTasksCount++;
      }
    }
    updatedTasksCount++;
  }

  unitWb.Sheets[b1SheetName] = XLSX.utils.aoa_to_sheet(b1Data);

  // Update 13. K_KiemTra indicator #3 to ĐẠT
  const kSheetName = unitWb.SheetNames.find((s) => s.includes('K_KiemTra'));
  if (kSheetName) {
    const kData = XLSX.utils.sheet_to_json<(string | number)[]>(unitWb.Sheets[kSheetName], {
      header: 1,
      defval: ''
    });
    if (kData[4] && kData[4].length >= 8) {
      kData[4][7] = 'ĐẠT';
    }
    unitWb.Sheets[kSheetName] = XLSX.utils.aoa_to_sheet(kData);
  }

  // Append 10-column log entry to 15. S_NhatKy
  const sSheetName = unitWb.SheetNames.find((s) => s.includes('S_NhatKy'));
  const mergedFileName = `${unitCode}_K2526_v${newVersion}_${compactDate}.xlsx`;
  const formNamesJoined = formFiles.map((f) => f.name).join('; ');
  if (sSheetName) {
    const sData = XLSX.utils.sheet_to_json<(string | number)[]>(unitWb.Sheets[sSheetName], {
      header: 1,
      defval: ''
    });
    sData.push([
      '01/10/2025–30/9/2026',
      '3. B1_KhoiLuong & 8. C3_NhuCau',
      unitCode,
      `Nạp và gộp ${formFiles.length} phiếu khảo sát (${updatedTasksCount} công việc)`,
      unitFile.name,
      mergedFileName,
      `Phiếu đã nạp: ${formNamesJoined}`,
      `Đầu mối đơn vị ${unitCode}`,
      mergeDate,
      `v${newVersion}`
    ]);
    unitWb.Sheets[sSheetName] = XLSX.utils.aoa_to_sheet(sData);
  }

  const outBuf = XLSX.write(unitWb, { bookType: 'xlsx', type: 'array' });
  const mergedBlob = new Blob([outBuf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  return {
    mergedFileName,
    mergedBlob,
    unitCode,
    oldVersion,
    newVersion,
    formsMergedCount: formFiles.length,
    updatedTasksCount,
    measuredTasksCount,
    conflicts,
    logEntriesAdded: formFiles.map((f) => f.name)
  };
}
