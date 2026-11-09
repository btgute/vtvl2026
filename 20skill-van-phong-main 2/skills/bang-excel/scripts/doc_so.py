#!/usr/bin/env python3
"""Đọc số tiền thành chữ tiếng Việt.

Dùng:
    python3 doc_so.py 1250000            -> Một triệu hai trăm năm mươi nghìn đồng
    python3 doc_so.py 1250000 --khong-don-vi
    python3 doc_so.py 105000 --dung-ngan  (dùng "ngàn" thay "nghìn")

Hoặc import: from doc_so import doc_tien
"""
import sys

CHU_SO = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
DON_VI = ["", "nghìn", "triệu", "tỷ"]


def _doc_ba_so(n, day_du):
    """Đọc nhóm 3 chữ số. day_du=True khi nhóm không đứng đầu (phải đọc 'không trăm', 'linh')."""
    tram, chuc, dv = n // 100, (n // 10) % 10, n % 10
    kq = []
    if tram > 0 or day_du:
        kq += [CHU_SO[tram], "trăm"]
    if chuc == 0:
        if dv > 0 and (tram > 0 or day_du):
            kq.append("linh")
    elif chuc == 1:
        kq.append("mười")
    else:
        kq += [CHU_SO[chuc], "mươi"]
    if dv > 0:
        if dv == 1 and chuc >= 2:
            kq.append("mốt")
        elif dv == 5 and chuc >= 1:
            kq.append("lăm")
        elif dv == 4 and chuc >= 2:
            kq.append("tư")
        else:
            kq.append(CHU_SO[dv])
    return kq


def doc_so(n, ngan=False):
    if n == 0:
        return "không"
    if n < 0:
        return "âm " + doc_so(-n, ngan)
    don_vi = list(DON_VI)
    if ngan:
        don_vi[1] = "ngàn"
    # Tách thành các khối tỷ (vì "tỷ tỷ"), mỗi khối gồm tối đa 4 nhóm 3 chữ số
    nhom = []
    while n > 0:
        nhom.append(n % 1000)
        n //= 1000
    tu = []
    for i in range(len(nhom) - 1, -1, -1):
        g = nhom[i]
        dau = i == len(nhom) - 1
        bac = i % 3  # 0: đơn vị, 1: nghìn, 2: triệu
        so_ty = i // 3
        if g > 0:
            tu += _doc_ba_so(g, not dau)
            if bac:
                tu.append(don_vi[bac])
        if so_ty > 0 and bac == 0:
            # Chỉ ghi "tỷ" khi khối tỷ đó có giá trị
            khoi = nhom[i:i + 3]
            if any(khoi):
                tu += ["tỷ"] * so_ty
    return " ".join(tu)


def doc_tien(n, don_vi="đồng", ngan=False):
    s = doc_so(int(n), ngan)
    s = s[0].upper() + s[1:]
    return f"{s} {don_vi}".strip() if don_vi else s


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print(__doc__)
        sys.exit(1)
    so = int(args[0].replace(".", "").replace(",", ""))
    print(doc_tien(so, "" if "--khong-don-vi" in sys.argv else "đồng", "--dung-ngan" in sys.argv))
