#!/usr/bin/env python3
"""Công cụ PDF đa năng. Cần: pip install pypdf pdfplumber

Lệnh:
  gop      ra.pdf a.pdf b.pdf ...           Gộp nhiều file
  tach     vao.pdf thu_muc/                  Tách mỗi trang thành 1 file
  trich    vao.pdf ra.pdf 1-3,5,8-10         Trích các trang (đánh số từ 1)
  xoay     vao.pdf ra.pdf 90 [1,3]           Xoay trang (mặc định tất cả)
  chu      vao.pdf [ra.txt]                  Rút chữ (PDF có lớp chữ)
  bang     vao.pdf ra.xlsx                   Rút bảng ra Excel (mỗi bảng 1 sheet)
  thongtin vao.pdf                           Số trang, có lớp chữ hay là bản scan
  ocr      vao.pdf ra.pdf                    OCR tiếng Việt (cần ocrmypdf + tesseract-ocr-vie)
"""
import os
import shutil
import subprocess
import sys


def _trang(chuoi, tong):
    kq = []
    for phan in chuoi.split(","):
        if "-" in phan:
            a, b = phan.split("-")
            kq += list(range(int(a), int(b) + 1))
        else:
            kq.append(int(phan))
    for t in kq:
        if not 1 <= t <= tong:
            sys.exit(f"Trang {t} không tồn tại (file có {tong} trang)")
    return kq


def gop(ra, *vao):
    from pypdf import PdfWriter
    w = PdfWriter()
    for f in vao:
        w.append(f)
    w.write(ra)


def tach(vao, thu_muc):
    from pypdf import PdfReader, PdfWriter
    os.makedirs(thu_muc, exist_ok=True)
    r = PdfReader(vao)
    goc = os.path.splitext(os.path.basename(vao))[0]
    for i, p in enumerate(r.pages, 1):
        w = PdfWriter()
        w.add_page(p)
        w.write(os.path.join(thu_muc, f"{goc}_trang_{i:03d}.pdf"))


def trich(vao, ra, chuoi):
    from pypdf import PdfReader, PdfWriter
    r = PdfReader(vao)
    w = PdfWriter()
    for t in _trang(chuoi, len(r.pages)):
        w.add_page(r.pages[t - 1])
    w.write(ra)


def xoay(vao, ra, goc, chuoi=None):
    from pypdf import PdfReader, PdfWriter
    r = PdfReader(vao)
    chon = set(_trang(chuoi, len(r.pages))) if chuoi else None
    w = PdfWriter()
    for i, p in enumerate(r.pages, 1):
        if chon is None or i in chon:
            p.rotate(int(goc))
        w.add_page(p)
    w.write(ra)


def chu(vao, ra=None):
    import pdfplumber
    with pdfplumber.open(vao) as pdf:
        noi_dung = "\n\n".join(f"--- Trang {i} ---\n{p.extract_text() or ''}"
                              for i, p in enumerate(pdf.pages, 1))
    if ra:
        with open(ra, "w", encoding="utf-8") as f:
            f.write(noi_dung)
    else:
        print(noi_dung)


def bang(vao, ra):
    import pdfplumber
    from openpyxl import Workbook
    wb = Workbook()
    wb.remove(wb.active)
    dem = 0
    with pdfplumber.open(vao) as pdf:
        for i, p in enumerate(pdf.pages, 1):
            for j, b in enumerate(p.extract_tables(), 1):
                dem += 1
                ws = wb.create_sheet(f"T{i}_B{j}")
                for hang in b:
                    ws.append([(o or "").replace("\n", " ") for o in hang])
    if dem == 0:
        sys.exit("Không tìm thấy bảng. Nếu là bản scan, chạy lệnh ocr trước.")
    wb.save(ra)
    print(f"Đã rút {dem} bảng")


def thongtin(vao):
    import pdfplumber
    with pdfplumber.open(vao) as pdf:
        tong = len(pdf.pages)
        co_chu = sum(1 for p in pdf.pages if (p.extract_text() or "").strip())
    print(f"Số trang: {tong}")
    print(f"Trang có lớp chữ: {co_chu}/{tong}")
    if co_chu < tong:
        print("=> Có trang là ảnh scan, cần OCR để đọc/tìm kiếm.")


def ocr(vao, ra):
    if not shutil.which("ocrmypdf"):
        sys.exit("Chưa có ocrmypdf. Cài: sudo apt install ocrmypdf tesseract-ocr-vie "
                 "(macOS: brew install ocrmypdf tesseract-lang)")
    subprocess.run(["ocrmypdf", "-l", "vie+eng", "--skip-text", "--deskew", vao, ra], check=True)


LENH = {"gop": gop, "tach": tach, "trich": trich, "xoay": xoay, "chu": chu,
        "bang": bang, "thongtin": thongtin, "ocr": ocr}

if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in LENH:
        sys.exit(__doc__)
    LENH[sys.argv[1]](*sys.argv[2:])
