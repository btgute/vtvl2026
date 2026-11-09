#!/usr/bin/env python3
"""
scripts/parse_qd2266_missions.py
Trích xuất tự động danh mục nhiệm vụ gốc (Biểu 1. A1_NhiemVu) của 28 đơn vị
thuộc HCM-UTE từ Quyết định số 2266/QĐ-ĐHCNKT (văn bản ngày 23/6/2026).
"""

import docx
import re
import json
import os
import openpyxl

DOCX_PATH = 'docs/___V5_Quy dinh chuc nang nhiem vu cac don vi thuoc Truong nam 2026 - daky.docx'
EXCEL_TCNS_PATH = 'public/tai-ve/tcns-hcmute-bo-bieu-hd07.xlsx'
OUTPUT_JSON_PATH = 'src/configs/hcmute-qd2266-missions.json'

PL_MAP = {
    1: ('KHOA', 'Các Khoa, Viện đào tạo'),
    2: ('KDTTT', 'Khoa Đào tạo tiên tiến'),
    3: ('TTGDTC', 'Trung tâm Giáo dục thể chất'),
    4: ('TTGDQPAN', 'Trung tâm Giáo dục Quốc phòng và An ninh'),
    5: ('BANTT', 'Ban An ninh trật tự'),
    6: ('BQLKTX', 'Ban Quản lý ký túc xá'),
    7: ('PCTSV', 'Phòng Công tác sinh viên'),
    8: ('PDT', 'Phòng Đào tạo'),
    9: ('PHCTH', 'Phòng Hành chính - Tổng hợp'),
    10: ('PKTDBCL', 'Phòng Khảo thí và Đảm bảo chất lượng'),
    11: ('PKHTC', 'Phòng Kế hoạch - Tài chính'),
    12: ('PKHCN', 'Phòng Khoa học Công nghệ'),
    13: ('PQLDTXDDT', 'Phòng Quản lý đầu tư xây dựng và Đấu thầu'),
    14: ('PQHQT', 'Phòng Quan hệ Quốc tế'),
    15: ('PQHDN', 'Phòng Quan hệ Doanh nghiệp'),
    16: ('PQTTH&TT', 'Phòng Quản trị thương hiệu và Truyền thông'),
    17: ('PQTCSVC', 'Phòng Quản trị cơ sở vật chất'),
    18: ('TCNS', 'Phòng Tổ chức - Nhân sự'),
    19: ('TYT', 'Trạm Y tế'),
    20: ('TCKHGDKT', 'Tạp chí Khoa học Giáo dục Kỹ thuật'),
    21: ('TTCNPM', 'Trung tâm Công nghệ phần mềm'),
    22: ('TTHLDHS', 'Trung tâm Học liệu và Dạy học số'),
    23: ('TTSTKN&CGCN', 'Trung tâm Sáng tạo khởi nghiệp và Chuyển giao công nghệ'),
    24: ('TTTTMT', 'Trung tâm Thông tin - Máy tính'),
    25: ('VDTQT', 'Viện Đào tạo quốc tế'),
    26: ('VSDH', 'Viện Sau đại học'),
    27: ('VPDU', 'Văn phòng Đảng ủy'),
    28: ('PHBP', 'Phân hiệu tại Bình Phước'),
}

def load_tcns_excel():
    wb = openpyxl.load_workbook(EXCEL_TCNS_PATH, data_only=True)
    ws = wb['1. A1_NhiemVu']
    missions = []
    for r in range(3, 42):
        code = ws.cell(r, 1).value
        if not code:
            continue
        name = ws.cell(r, 2).value or ''
        can_cu = ws.cell(r, 4).value or 'QĐ 2266, PL18'
        nguon = ws.cell(r, 7).value or 'PL18; danh mục đã thống nhất'
        missions.append({
            'maNhiemVu': str(code).strip(),
            'tenNhiemVu': str(name).strip(),
            'coQuan': 'Phòng Tổ chức - Nhân sự',
            'canCu': str(can_cu).strip(),
            'ky': '01/10/2025–30/9/2026',
            'trangThai': 'Tiếp tục thực hiện',
            'nguon': str(nguon).strip(),
            'plNum': 18
        })
    return missions

def parse_docx():
    doc = docx.Document(DOCX_PATH)
    current_pl = None
    pl_paragraphs = {}
    for p in doc.paragraphs:
        t = p.text.strip()
        m = re.match(r'^PHỤ\s+LỤC\s+(\d+)', t, re.IGNORECASE)
        if m:
            current_pl = int(m.group(1))
            pl_paragraphs[current_pl] = []
        elif current_pl:
            pl_paragraphs[current_pl].append(p)

    tcns_missions = load_tcns_excel()
    result = {}

    for pl_num in sorted(pl_paragraphs.keys()):
        code, name = PL_MAP[pl_num]
        if code == 'TCNS':
            result[code] = {
                'plNum': pl_num,
                'unitCode': code,
                'unitName': name,
                'missions': tcns_missions
            }
            continue

        paras = pl_paragraphs[pl_num]
        in_section_2 = False
        current_section = None
        bullet_idx = 0
        missions = []

        for p in paras:
            t = p.text.strip()
            if not t:
                continue

            if re.match(r'^II\.\s*Nhiệm vụ', t, re.IGNORECASE):
                in_section_2 = True
                current_section = None
                continue

            if in_section_2 and re.match(r'^(III|IV|V)\.\s', t, re.IGNORECASE):
                in_section_2 = False
                break

            if not in_section_2:
                continue

            m_sec = re.match(r'^(\d+)\.\s*(.*)', t)
            if m_sec:
                current_section = m_sec.group(1)
                bullet_idx = 0
                continue

            if current_section is not None:
                bullet_idx += 1
                clean_text = re.sub(r'^[-\u2013\u2014\u2022\*\s]+', '', t).strip()
                task_num = len(missions) + 1
                task_code = f'{code}.NV{task_num:02d}'
                can_cu = f'QĐ 2266, PL{pl_num}, mục II.{current_section}, gạch {bullet_idx}'
                nguon = f'PL{pl_num}; QĐ 2266/QĐ-ĐHCNKT ngày 23/6/2026'

                missions.append({
                    'maNhiemVu': task_code,
                    'tenNhiemVu': clean_text,
                    'coQuan': name,
                    'canCu': can_cu,
                    'ky': '01/10/2025–30/9/2026',
                    'trangThai': 'Tiếp tục thực hiện',
                    'nguon': nguon,
                    'plNum': pl_num,
                    'secNum': current_section,
                    'bulletNum': bullet_idx
                })

        result[code] = {
            'plNum': pl_num,
            'unitCode': code,
            'unitName': name,
            'missions': missions
        }

    os.makedirs(os.path.dirname(OUTPUT_JSON_PATH), exist_ok=True)
    with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f'Successfully exported {len(result)} units to {OUTPUT_JSON_PATH}')

if __name__ == '__main__':
    parse_docx()

