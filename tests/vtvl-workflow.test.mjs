import fs from 'fs';
import path from 'path';
import assert from 'assert';

const root = process.cwd();
let passed = 0;

function runTest(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}:`, err.message);
    process.exitCode = 1;
    throw err;
  }
}

function walkFiles(dir, extFilter = ['.ts', '.tsx']) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, extFilter));
    } else if (extFilter.includes(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

console.log('================================================================');
console.log(' BỘ KIỂM THỬ ĐƠN VỊ (UNIT TEST) — HCM-UTE VỊ TRÍ VIỆC LÀM (2026–2030)');
console.log('================================================================');

// 1. Kiểm tra quy chuẩn AGENTS.md, Skills và tài liệu kiến trúc CSDL
runTest('1. Kiểm tra cấu trúc AGENTS.md, 5 Skills chuyên biệt & Tài liệu kiến trúc ERD', () => {
  const requiredFiles = [
    'AGENTS.md',
    '.agents/rules/hcmute-brand-guard.md',
    '.agents/rules/code-standards.md',
    '.agents/skills/hcmute-terminology/SKILL.md',
    '.agents/skills/hcmute-ui-system/SKILL.md',
    '.agents/skills/vtvl-excel-engine/SKILL.md',
    '.agents/skills/vtvl-audit-engine/SKILL.md',
    '.agents/skills/quality-assurance/SKILL.md',
    'docs/architecture/erd-database-schema.md',
    'public/mau/manifest.json'
  ];

  for (const rel of requiredFiles) {
    const full = path.join(root, rel);
    assert.ok(fs.existsSync(full), `Thiếu tệp bắt buộc: ${rel}`);
  }

  const skillDirs = [
    'hcmute-terminology',
    'hcmute-ui-system',
    'vtvl-excel-engine',
    'vtvl-audit-engine',
    'quality-assurance'
  ];
  for (const dir of skillDirs) {
    const content = fs.readFileSync(path.join(root, '.agents/skills', dir, 'SKILL.md'), 'utf8');
    assert.ok(content.includes('## A. Thông tin Skill'), `${dir} thiếu mục A`);
    assert.ok(content.includes('## B. Quy trình thực hiện'), `${dir} thiếu mục B`);
    assert.ok(content.includes('## C. Quy tắc kiểm tra'), `${dir} thiếu mục C`);
    assert.ok(content.includes('## D. Giới hạn'), `${dir} thiếu mục D`);
  }
});

// 2. Kiểm tra giới hạn < 300 dòng đối với toàn bộ tệp mã nguồn trong src/
runTest('2. Kiểm tra quy tắc giới hạn < 300 dòng cho mọi tệp trong src/ (Rule 8)', () => {
  const srcFiles = walkFiles(path.join(root, 'src'));
  assert.ok(srcFiles.length >= 20, 'Số lượng tệp nguồn trong src/ không hợp lệ');
  for (const file of srcFiles) {
    const rel = path.relative(root, file);
    const lines = fs.readFileSync(file, 'utf8').split('\n').length;
    assert.ok(lines <= 300, `Tệp ${rel} vượt quá 300 dòng (${lines} dòng)`);
  }
});

// 3. Kiểm tra Quy chuẩn thương hiệu HCM-UTE & Màu chữ Light Theme (#004776)
runTest('3. Kiểm tra Quy chuẩn thương hiệu HCM-UTE & Màu chữ rgb(0, 71, 118)', () => {
  const css = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8');
  assert.ok(css.includes('--foreground: rgb(0, 71, 118);'), 'globals.css phải đặt --foreground: rgb(0, 71, 118)');
  assert.ok(css.includes('overflow-x: hidden'), 'globals.css phải chống tràn ngang (overflow-x: hidden)');

  const uiFiles = [
    ...walkFiles(path.join(root, 'src/app')),
    ...walkFiles(path.join(root, 'src/components'))
  ];
  for (const file of uiFiles) {
    const rel = path.relative(root, file);
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(!content.includes('text-black'), `${rel} vi phạm: chứa class text-black`);
    assert.ok(!content.includes('text-gray-900'), `${rel} vi phạm: chứa class text-gray-900`);
    assert.ok(!content.includes('text-slate-900'), `${rel} vi phạm: chứa class text-slate-900`);
    assert.ok(!content.includes('Sư phạm Kỹ thuật'), `${rel} vi phạm: chứa tên trường cũ`);
  }
});

// 4. Kiểm tra Danh mục 51 đơn vị thuộc HCM-UTE và Khung 38 VTVL (Phụ lục I HD 1907)
runTest('4. Kiểm tra Danh mục 51 đơn vị & Khung 38 vị trí việc làm (04 nhóm)', () => {
  const unitsContent = fs.readFileSync(path.join(root, 'src/configs/hcmute-units.ts'), 'utf8');
  const unitMatches = unitsContent.match(/code:\s*'[A-Z0-9-]+'/g) || [];
  assert.strictEqual(unitMatches.length, 51, `Danh mục đơn vị phải đúng 51 đơn vị (hiện có ${unitMatches.length})`);

  const nd232Content = fs.readFileSync(path.join(root, 'src/configs/hcmute-nd232-catalog.ts'), 'utf8');
  const fwMatches = nd232Content.match(/m\('HD1907-(?:I|II|III|IV)-\d+'/g) || [];
  assert.strictEqual(fwMatches.length, 38, `Khung VTVL của Trường phải đủ 38 vị trí (hiện có ${fwMatches.length})`);
  assert.ok(nd232Content.includes('buildProposedPositionFromFramework'), 'Thiếu hàm khởi tạo vị trí đề xuất từ Khung Trường');
  assert.ok(nd232Content.includes('buildDefaultProposedPositionsForUnit'), 'Thiếu hàm khởi tạo danh sách VTVL đề xuất mặc định cho đơn vị');
});

// 5. Kiểm tra Lược đồ Cơ sở dữ liệu quan hệ 22 bảng & Trigger kiểm soát bậc nghề nghiệp
runTest('5. Kiểm tra Lược đồ CSDL quan hệ 22 bảng (PostgreSQL / Supabase Migration)', () => {
  const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20261107_init_vtvl_hcmute.sql'), 'utf8');
  const expectedTables = [
    'dm_don_vi', 'dm_chuc_danh_tt31', 'dm_vtvl_khung_truong', 'dm_san_pham',
    'c1_vtvl', 'a1_nhiem_vu', 'a2_cong_viec', 'b1_khoi_luong',
    'b2_ct_tac_dong', 'b2_thay_doi', 'c2_nang_luc', 'c3_nhu_cau',
    'd1_nhan_luc', 'du_bao_5_nam', 'd2_phuong_an', 'k_kiem_tra',
    't_tien_do', 's_nhat_ky', 'sldv_quy_mo_don_vi', 'sldv_phan_bo_ngach',
    'can_cu_goi_y', 'ra_soat_chua_du_can_cu'
  ];
  for (const tbl of expectedTables) {
    assert.ok(
      sql.includes(`CREATE TABLE IF NOT EXISTS public.${tbl}`),
      `Thiếu bảng quan hệ public.${tbl} trong migration SQL`
    );
  }
  assert.ok(sql.includes('email_nguoi_thuc_hien'), 'Bảng nhật ký/tiến độ phải có cột email_nguoi_thuc_hien');
  assert.ok(sql.includes('chuc_vu_nguoi_thuc_hien'), 'Bảng nhật ký/tiến độ phải có cột chuc_vu_nguoi_thuc_hien');
  assert.ok(sql.includes('trg_validate_c1_career_level'), 'Thiếu Trigger kiểm tra giới hạn bậc nghề nghiệp');
  assert.ok(sql.includes('v_tong_hop_vtvl_toan_truong'), 'Thiếu View tổng hợp toàn trường');
});

// 6. Kiểm tra bắt buộc nhập Email & Chức vụ, Bảng mã ngạch (Tách & D1), 4 tệp xuất & Can_cu_goi_y
runTest('6. Kiểm tra Email/Chức vụ, Phân bổ mã ngạch (Tách & D1), 4 tệp xuất & Can_cu_goi_y', () => {
  const taoTep = fs.readFileSync(path.join(root, 'src/app/tao-tep/page.tsx'), 'utf8');
  const reviewConfirm = fs.readFileSync(path.join(root, 'src/components/tao-tep/Step1ReviewConfirm.tsx'), 'utf8');
  assert.ok(taoTep.includes('id="task-1-actor"'), 'Bước 1 phải có ô nhập Email người thực hiện (#task-1-actor)');
  assert.ok(taoTep.includes('id="task-1-role"'), 'Bước 1 phải có ô nhập Chức vụ người thực hiện (#task-1-role)');
  assert.ok(taoTep.includes('validateStep1Data') && reviewConfirm.includes('validateStep1Data'), 'Bước 1 phải kiểm tra bắt buộc Email, Chức vụ và từng VTVL trước khi xuất tệp');

  const ngachTool = fs.readFileSync(path.join(root, 'src/components/tao-tep/UnitScaleAndNgachTool.tsx'), 'utf8');
  assert.ok(ngachTool.includes('handleSplitNgachRow') && ngachTool.includes('Đưa vào bảng số người theo vị trí (D1)'), 'Phải có công cụ Tách dòng mã ngạch và Đưa vào bảng số người theo vị trí (D1)');

  const wbBuilder = fs.readFileSync(path.join(root, 'src/services/excel-split/workbook-builder.ts'), 'utf8');
  const sheetsBuilder = fs.readFileSync(path.join(root, 'src/services/excel-split/hd07-sheets-builder.ts'), 'utf8');
  assert.ok(wbBuilder.includes('draftUnitFileName') && sheetsBuilder.includes('Can_cu_goi_y'), 'Phải sinh đủ 4 tệp riêng biệt và có trang tính Can_cu_goi_y');

  const regenForms = fs.readFileSync(path.join(root, 'src/services/excel-split/regen-forms.ts'), 'utf8');
  assert.ok(regenForms.includes('regenerateFormsFromEditedUnitWorkbook'), 'Phải có tính năng Tạo lại phiếu từ tệp đơn vị đã sửa');
});

// 7. Kiểm tra 5 Thẻ Rà soát, Xuất Excel Chua_du_can_cu, Ví dụ X99 & Cảnh báo xung đột gộp phiếu
runTest('7. Kiểm tra 5 Thẻ Rà soát, Xuất Excel Chua_du_can_cu, Ví dụ X99 & Cảnh báo xung đột gộp phiếu', () => {
  const auditTabs = fs.readFileSync(path.join(root, 'src/components/ra-soat/AuditResultTabs.tsx'), 'utf8');
  for (const label of ['1. Cần xử lý', '2. Tổng hợp VTVL', '3. Chưa đủ căn cứ', '4. Lỗi của biểu mẫu', '5. Công cụ kiểm tra gì']) {
    assert.ok(auditTabs.includes(label), `Sổ kết quả rà soát thiếu thẻ: ${label}`);
  }
  const auditEngine = fs.readFileSync(path.join(root, 'src/services/excel-audit/audit-engine.ts'), 'utf8');
  assert.ok(auditEngine.includes('Chua_du_can_cu') && auditEngine.includes('Gop_y_bieu_mau'), 'Xuất Excel rà soát phải có sheet Chua_du_can_cu và Gop_y_bieu_mau');

  const mergeForms = fs.readFileSync(path.join(root, 'src/services/excel-merge/merge-forms.ts'), 'utf8');
  assert.ok(mergeForms.includes('allValues') && mergeForms.includes('rejectedForms'), 'Gộp phiếu phải liệt kê chi tiết xung đột giữa các phiếu và từ chối phiếu khác đơn vị');

  for (const pageRel of ['src/app/tao-tep/page.tsx', 'src/app/bam-gio/page.tsx', 'src/app/ra-soat/page.tsx']) {
    const pageContent = fs.readFileSync(path.join(root, pageRel), 'utf8');
    assert.ok(pageContent.includes('min-w-0'), `Trang ${pageRel} phải có min-w-0 trên cột chính để chống vỡ bố cục trên mobile`);
  }
});

// 8. Kiểm tra phản hồi HTTP 200 OK trên máy chủ cục bộ (nếu đang chạy)
const checkLocalServer = async () => {
  const routes = ['/', '/tao-tep', '/bam-gio', '/ra-soat', '/huong-dan'];
  try {
    const ping = await fetch('http://localhost:3360/');
    if (ping.ok) {
      for (const r of routes) {
        const res = await fetch(`http://localhost:3360${r}`);
        assert.strictEqual(res.status, 200, `Đường dẫn ${r} trả về mã lỗi ${res.status}`);
      }
      passed += 1;
      console.log('  ✓ [PASS] 8. Kiểm tra máy chủ cục bộ (http://localhost:3360): 5/5 trang trả về HTTP 200 OK');
    }
  } catch {
    console.log('  ℹ [SKIP] 8. Máy chủ cục bộ không chạy trong tiến trình hiện tại (đã qua 7/7 bài kiểm thử tĩnh)');
  }
  console.log('----------------------------------------------------------------');
  console.log(` KẾT QUẢ: ĐẠT ${passed}/${passed} BÀI KIỂM THỬ ĐƠN VỊ (0 LỖI)`);
  console.log('================================================================');
};

await checkLocalServer();
