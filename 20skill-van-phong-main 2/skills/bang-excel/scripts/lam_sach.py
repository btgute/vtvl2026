#!/usr/bin/env python3
"""Làm sạch dữ liệu tiếng Việt trong file Excel/CSV. Cần: pip install pandas openpyxl

Dùng:
    python3 lam_sach.py vao.xlsx ra.xlsx [--sheet "Tên sheet"]

Việc script làm (mọi cột chữ):
  - Chuẩn hóa Unicode về dựng sẵn (NFC): sửa lỗi "tìm không ra" do chữ tổ hợp
  - Xóa khoảng trắng thừa, ký tự ẩn (non-breaking space, zero-width)
Theo tên cột (không phân biệt hoa thường, có/không dấu):
  - Cột chứa "ho ten"/"ten": viết hoa chữ cái đầu mỗi từ
  - Cột chứa "dien thoai"/"sdt"/"phone": chuẩn về 0xxxxxxxxx (đổi +84/84), đánh dấu số sai độ dài
  - Cột chứa "email": chữ thường
  - Cột chứa "mst"/"ma so thue": giữ dạng chữ, kiểm tra 10 hoặc 10-3 hoặc 12 số (MST cá nhân = số CCCD)
Kết quả: file sạch + sheet "Bao_cao" liệt kê dòng trùng và giá trị nghi sai.
"""
import re
import sys
import unicodedata

import pandas as pd

AN = dict.fromkeys(map(ord, " ​‌‍﻿"), " ")


def bo_dau(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.replace("đ", "d").replace("Đ", "D").lower()


def sach_chu(v):
    if not isinstance(v, str):
        return v
    v = unicodedata.normalize("NFC", v.translate(AN))
    return re.sub(r"\s+", " ", v).strip()


def sdt(v):
    if pd.isna(v):
        return v, None
    s = re.sub(r"\D", "", str(v).split(".")[0] if isinstance(v, float) else str(v))
    if s.startswith("84") and len(s) == 11:
        s = "0" + s[2:]
    elif len(s) == 9 and s[0] in "35789":  # Excel làm mất số 0 đầu
        s = "0" + s
    return s, (None if re.fullmatch(r"0[35789]\d{8}", s) else "SĐT di động không hợp lệ (cần 10 số, đầu 03/05/07/08/09)")


def mst(v):
    if pd.isna(v):
        return v, None
    s = re.sub(r"\s", "", str(v))
    return s, (None if re.fullmatch(r"\d{10}(-\d{3})?|\d{12}", s) else "MST không đúng dạng 10, 10-3 hoặc 12 số")


def main(vao, ra, sheet=None):
    df = (pd.read_csv(vao, dtype=str) if vao.lower().endswith(".csv")
          else pd.read_excel(vao, sheet_name=sheet or 0, dtype=str))
    van_de = []
    for c in df.columns:
        df[c] = df[c].map(sach_chu)
        ten = bo_dau(str(c))
        if any(k in ten for k in ("dien thoai", "sdt", "phone", "so dt")):
            ham = sdt
        elif "mst" in ten or "ma so thue" in ten:
            ham = mst
        else:
            ham = None
        if ham:
            kq = df[c].map(ham)
            df[c] = kq.map(lambda x: x[0])
            for i, (gt, loi) in kq.items():
                if loi:
                    van_de.append({"Dòng": i + 2, "Cột": c, "Giá trị": gt, "Vấn đề": loi})
        elif "email" in ten:
            df[c] = df[c].map(lambda x: x.lower() if isinstance(x, str) else x)
        elif "ho ten" in ten or ten.strip() in ("ten", "ho va ten", "khach hang", "ten khach hang"):
            df[c] = df[c].map(lambda x: x.title() if isinstance(x, str) else x)
    trung = df[df.duplicated(keep=False)]
    for i in trung.index:
        van_de.append({"Dòng": i + 2, "Cột": "(cả dòng)", "Giá trị": "", "Vấn đề": "Dòng trùng lặp"})
    with pd.ExcelWriter(ra, engine="openpyxl") as w:
        df.to_excel(w, sheet_name="Du_lieu_sach", index=False)
        pd.DataFrame(van_de or [{"Vấn đề": "Không phát hiện vấn đề"}]).to_excel(w, sheet_name="Bao_cao", index=False)
    print(f"Xong: {len(df)} dòng, {len(van_de)} vấn đề -> {ra}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) < 2:
        sys.exit(__doc__)
    sh = a[a.index("--sheet") + 1] if "--sheet" in a else None
    main(a[0], a[1], sh)
