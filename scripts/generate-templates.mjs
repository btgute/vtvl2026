import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const mauDir = path.resolve(process.cwd(), 'public/mau');
fs.mkdirSync(mauDir, { recursive: true });

const templates = [
  { id: 'mau_khoa_vien_v1', title: 'Mẫu Khối Khoa & Viện đào tạo HCM-UTE', prefix: 'XXX-DT-GV' },
  { id: 'mau_phong_ban_v1', title: 'Mẫu Khối Phòng ban chức năng HCM-UTE', prefix: 'XXX-HC-CV' },
  { id: 'mau_trung_tam_v1', title: 'Mẫu Khối Trung tâm & Phân hiệu HCM-UTE', prefix: 'XXX-DV-KT' },
  { id: 'mau_dang_doanthe_v1', title: 'Mẫu Khối Quản trị & Đảng - Đoàn thể HCM-UTE', prefix: 'XXX-CT-CV' }
];

const manifest = {};

for (const tpl of templates) {
  const wb = XLSX.utils.book_new();
  const sheets = [
    '1. A1_ThongTinChung',
    '2. A2_CoCauToChuc',
    '3. B1_KhoiLuong',
    '4. B2_PhieuKhaoSat',
    '5. C1_DanhMucVTVL',
    '6. C2_MoTaVTVL',
    '7. C3_KhungNangLuc',
    '8. D1_NhanSuHienCo',
    '9. D2_DinhBien',
    '12. DM_NgachCDNN',
    '13. K_KiemTra',
    '14. T_TienDo',
    '15. S_NhatKy'
  ];

  for (const sh of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([
      [`${tpl.title} — ${sh}`],
      ['Mã mẫu', `${tpl.prefix}-01`, 'Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE)'],
      ['Ghi chú', 'Tệp mẫu gốc dùng cho bộ tách tệp đơn vị VTVL 360']
    ]);
    XLSX.utils.book_append_sheet(wb, ws, sh);
  }

  const filePath = path.join(mauDir, `${tpl.id}.xlsx`);
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  fs.writeFileSync(filePath, buf);

  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  manifest[tpl.id] = {
    name: `${tpl.id}.xlsx`,
    url: `/mau/${tpl.id}.xlsx`,
    sha256,
    bytes: buf.length
  };
}

fs.writeFileSync(
  path.join(mauDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf8'
);

console.log('Generated 4 HCM-UTE template workbooks in public/mau/ with SHA-256 manifest.');

