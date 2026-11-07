import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import {
  NGACH_LIST_BY_GROUP,
  TASK_TEMPLATES_BY_GROUP
} from '@/configs/hcmute-quotas';
import { HD07_CONSTANTS, MISSIONS_BY_GROUP } from '@/configs/hcmute-hd07-catalog';
import { buildDefaultSpecificVtvlName } from '@/configs/hcmute-nd232-catalog';
import { HCMUTE_UNITS, UNIT_GROUPS } from '@/configs/hcmute-units';
import { SplitResultSummary, UnitSplitOptions } from '@/types/vtvl';
import { buildHd07CoreSheets } from './hd07-core-sheets';
import { appendHd07GuideAndRefSheets } from './hd07-sheets-builder';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function toWorkbookBlob(wb: XLSX.WorkBook): Blob {
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([out], { type: XLSX_MIME });
}

export async function generateUnitFiles(opts: UnitSplitOptions): Promise<SplitResultSummary> {
  const unit = HCMUTE_UNITS.find((u) => u.code === opts.unitCode) || HCMUTE_UNITS[0];
  const groupMeta = UNIT_GROUPS.find((g) => g.id === opts.kind) || UNIT_GROUPS[0];
  const ngachList = NGACH_LIST_BY_GROUP[opts.kind];
  const missions = MISSIONS_BY_GROUP[opts.kind];
  const templates = TASK_TEMPLATES_BY_GROUP[opts.kind];
  const compactDate = opts.exportDate.replace(/-/g, '');

  const vtvlMap = new Map<string, SplitResultSummary['positionBreakdown'][number]>();

  // Nếu đơn vị đã tự tạo & cấu hình danh sách VTVL đề xuất tại Bước 1
  if (opts.proposedPositions && opts.proposedPositions.length > 0) {
    opts.proposedPositions.forEach((pos) => {
      const cleanSuffix = pos.vtvlSuffix.replace(new RegExp(`^${opts.unitCode}-`), '');
      const vtvlCode = `${opts.unitCode}-${cleanSuffix}`;
      const matchedTasks = templates.filter(
        (t) => t.vtvlSuffix === cleanSuffix || t.ngachCode === pos.ngachCode
      );
      const b1HoursYear =
        matchedTasks.length > 0
          ? Number(
              matchedTasks
                .reduce(
                  (acc, t) =>
                    acc +
                    (t.defaultQtyPerYear * t.defaultMinutesPerProduct) / 60 +
                    t.extraRelatedHoursYear,
                  0
                )
                .toFixed(1)
            )
          : Number((pos.proposedFte * pos.standardHoursYear).toFixed(1));
      const b2Reduction =
        matchedTasks.length > 0
          ? Number(
              matchedTasks
                .reduce(
                  (acc, t) =>
                    acc +
                    (t.digitalMinutesBefore && t.digitalMinutesAfter
                      ? ((t.digitalMinutesBefore - t.digitalMinutesAfter) * t.defaultQtyPerYear) / 60
                      : 0),
                  0
                )
                .toFixed(1)
            )
          : 0;
      const netHoursYear = Number(Math.max(100, b1HoursYear - b2Reduction).toFixed(1));

      vtvlMap.set(vtvlCode, {
        vtvlCode,
        vtvlName: pos.specificName,
        frameworkTitle: pos.frameworkTitle,
        vtvlGroup4: pos.vtvlGroup4,
        careerLevel: pos.careerLevel,
        ngachCode: pos.ngachCode,
        method: pos.method,
        workingRegime: pos.workingRegime,
        standardHoursYear: pos.standardHoursYear,
        taskCount: Math.max(1, matchedTasks.length),
        b1HoursYear,
        b2NetHoursYear: -b2Reduction,
        netHoursYear,
        recommendedFte: pos.proposedFte
      });
    });
  } else {
    templates.forEach((t) => {
      const vtvlCode = `${opts.unitCode}-${t.vtvlSuffix}`;
      const spHours = Number(((t.defaultQtyPerYear * t.defaultMinutesPerProduct) / 60).toFixed(1));
      const totalB1Hours = Number((spHours + t.extraRelatedHoursYear).toFixed(1));
      const b2ReductionHours =
        t.digitalMinutesBefore && t.digitalMinutesAfter
          ? Number((((t.digitalMinutesBefore - t.digitalMinutesAfter) * t.defaultQtyPerYear) / 60).toFixed(1))
          : 0;
      const ngach = ngachList.find((n) => n.code === t.ngachCode);
      const stdHours = ngach ? ngach.standardHoursPerYear : HD07_CONSTANTS.STANDARD_PP2_HOURS;
      const workingRegime = ngach ? ngach.workingRegime : 'Phổ biến (40 giờ/tuần)';
      const frameworkTitle = t.frameworkTitle || ngach?.frameworkTitle || t.vtvlName;
      const vtvlGroup4 = t.vtvlGroup4 || ngach?.vtvlGroup4 || 'II. Nhóm VTVL Chuyên môn, nghiệp vụ';
      const defaultSpecificName = buildDefaultSpecificVtvlName(
        frameworkTitle,
        opts.unitNameVi,
        ngach?.specificNameSuffix,
        opts.kind
      );
      const specificVtvlName =
        opts.customPositionNames?.[t.ngachCode]?.trim() || defaultSpecificName;
      const selectedCareerLevel =
        opts.customCareerLevels?.[t.ngachCode] ||
        t.defaultCareerLevel ||
        ngach?.defaultCareerLevel ||
        'Bậc 3';

      const existing = vtvlMap.get(vtvlCode);
      if (existing) {
        existing.taskCount += 1;
        existing.b1HoursYear = Number((existing.b1HoursYear + totalB1Hours).toFixed(1));
        existing.b2NetHoursYear = Number((existing.b2NetHoursYear - b2ReductionHours).toFixed(1));
        existing.netHoursYear = Number((existing.b1HoursYear + existing.b2NetHoursYear).toFixed(1));
        existing.recommendedFte =
          t.method === 'PP1' ? 1 : Math.max(1, Number((existing.netHoursYear / stdHours).toFixed(2)));
      } else {
        const netH = Number((totalB1Hours - b2ReductionHours).toFixed(1));
        vtvlMap.set(vtvlCode, {
          vtvlCode,
          vtvlName: specificVtvlName,
          frameworkTitle,
          vtvlGroup4,
          careerLevel: selectedCareerLevel,
          ngachCode: t.ngachCode,
          method: t.method,
          workingRegime,
          standardHoursYear: stdHours,
          taskCount: 1,
          b1HoursYear: totalB1Hours,
          b2NetHoursYear: -b2ReductionHours,
          netHoursYear: netH,
          recommendedFte: t.method === 'PP1' ? 1 : Math.max(1, Number((netH / stdHours).toFixed(2)))
        });
      }
    });
  }

  const positionBreakdown = Array.from(vtvlMap.values());
  const totalStandardFte = Number(
    positionBreakdown.reduce((acc, p) => acc + p.recommendedFte, 0).toFixed(2)
  );

  const wb = XLSX.utils.book_new();
  const { b1Header, b1Rows, wsB1, wsB2Ct, wsD1 } = buildHd07CoreSheets(
    wb,
    opts,
    groupMeta.sourceRule,
    ngachList,
    templates,
    positionBreakdown
  );

  appendHd07GuideAndRefSheets(wb, opts, unit.headTitleVi, positionBreakdown, compactDate);

  const formWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(formWb, wsB1, '3. B1_KhoiLuong');
  XLSX.utils.book_append_sheet(formWb, wsB2Ct, '4. B2_CT_TacDong');
  XLSX.utils.book_append_sheet(formWb, wsD1, '9. D1_NhanLuc');

  const unitFileName = `${opts.unitCode}_K2526_v1_${compactDate}.xlsx`;
  const fullFormFileName = `Phieu_KhaoSat_B1_B2_${opts.unitCode}_K2526_${compactDate}.xlsx`;
  const unitBlob = toWorkbookBlob(wb);
  const fullFormBlob = toWorkbookBlob(formWb);

  let zipFileName: string | undefined;
  let zipBlob: Blob | undefined;
  if (opts.includeZipPerPosition) {
    const zip = new JSZip();
    positionBreakdown.forEach((pos) => {
      const posWb = XLSX.utils.book_new();
      const posRows = b1Rows.filter((r) => r[1] === pos.vtvlCode);
      const wsPosB1 = XLSX.utils.aoa_to_sheet([
        [`PHIẾU KHẢO SÁT KHỐI LƯỢNG B1 VỊ TRÍ ${pos.vtvlCode} — ${pos.vtvlName} (Khung: ${pos.frameworkTitle} · ${pos.careerLevel})`],
        b1Header,
        ...posRows
      ]);
      XLSX.utils.book_append_sheet(posWb, wsPosB1, '3. B1_KhoiLuong');
      const posBuf = XLSX.write(posWb, { bookType: 'xlsx', type: 'array' });
      zip.file(`Phieu_ViTri_${pos.vtvlCode}_${compactDate}.xlsx`, posBuf);
    });
    zipFileName = `Phieu_TungViTri_${opts.unitCode}_K2526_${compactDate}.zip`;
    zipBlob = await zip.generateAsync({ type: 'blob' });
  }

  return {
    unitCode: opts.unitCode,
    unitNameVi: opts.unitNameVi,
    kind: opts.kind,
    version: 1,
    missionCount: missions.length,
    taskCount: templates.length,
    vtvlCount: positionBreakdown.length,
    totalStandardFte,
    unitFileName,
    unitBlob,
    fullFormFileName,
    fullFormBlob,
    zipFileName,
    zipBlob,
    positionBreakdown
  };
}
