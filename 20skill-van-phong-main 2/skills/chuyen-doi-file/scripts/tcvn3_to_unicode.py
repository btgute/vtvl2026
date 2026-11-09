#!/usr/bin/env python3
"""Chuyển văn bản bảng mã TCVN3 (ABC, font .VnTime, .VnArial...) sang Unicode.

Dùng:
    python3 tcvn3_to_unicode.py vao.txt ra.txt
    python3 tcvn3_to_unicode.py vao.docx ra.docx   (cần python-docx)

Với .docx: chỉ chuyển các đoạn chữ dùng font bắt đầu bằng ".Vn"
(hoặc toàn bộ nếu thêm --tat-ca), đồng thời đổi font sang Times New Roman.
Font kết thúc bằng "H" (.VnTimeH, .VnArialH) là font chữ hoa: kết quả được in hoa.

Giới hạn: chỉ hỗ trợ TCVN3. File VNI (font VNI-Times) dùng UniKey Toolkit
hoặc EVKey để chuyển. Luôn rà lại kết quả bằng mắt.
"""
import sys
import unicodedata

TCVN3 = {
    0xA1: "Ă", 0xA2: "Â", 0xA3: "Ê", 0xA4: "Ô", 0xA5: "Ơ", 0xA6: "Ư", 0xA7: "Đ",
    0xA8: "ă", 0xA9: "â", 0xAA: "ê", 0xAB: "ô", 0xAC: "ơ", 0xAD: "ư", 0xAE: "đ",
    0xB5: "à", 0xB6: "ả", 0xB7: "ã", 0xB8: "á", 0xB9: "ạ",
    0xBB: "ằ", 0xBC: "ẳ", 0xBD: "ẵ", 0xBE: "ắ", 0xC6: "ặ",
    0xC7: "ầ", 0xC8: "ẩ", 0xC9: "ẫ", 0xCA: "ấ", 0xCB: "ậ",
    0xCC: "è", 0xCE: "ẻ", 0xCF: "ẽ", 0xD0: "é", 0xD1: "ẹ",
    0xD2: "ề", 0xD3: "ể", 0xD4: "ễ", 0xD5: "ế", 0xD6: "ệ",
    0xD7: "ì", 0xD8: "ỉ", 0xDC: "ĩ", 0xDD: "í", 0xDE: "ị",
    0xDF: "ò", 0xE1: "ỏ", 0xE2: "õ", 0xE3: "ó", 0xE4: "ọ",
    0xE5: "ồ", 0xE6: "ổ", 0xE7: "ỗ", 0xE8: "ố", 0xE9: "ộ",
    0xEA: "ờ", 0xEB: "ở", 0xEC: "ỡ", 0xED: "ớ", 0xEE: "ợ",
    0xEF: "ù", 0xF1: "ủ", 0xF2: "ũ", 0xF3: "ú", 0xF4: "ụ",
    0xF5: "ừ", 0xF6: "ử", 0xF7: "ữ", 0xF8: "ứ", 0xF9: "ự",
    0xFA: "ỳ", 0xFB: "ỷ", 0xFC: "ỹ", 0xFD: "ý", 0xFE: "ỵ",
}
BANG = {chr(k): v for k, v in TCVN3.items()}


def chuyen(text, in_hoa=False):
    kq = "".join(BANG.get(c, c) for c in text)
    kq = unicodedata.normalize("NFC", kq)
    return kq.upper() if in_hoa else kq


def chuyen_docx(vao, ra, tat_ca=False):
    try:
        import docx
    except ImportError:
        sys.exit("Cần cài: pip install python-docx")
    d = docx.Document(vao)

    def xu_ly_doan(doan_list):
        for p in doan_list:
            for r in p.runs:
                font = (r.font.name or "")
                if tat_ca or font.lower().startswith(".vn"):
                    r.text = chuyen(r.text, in_hoa=font.lower().endswith("h"))
                    r.font.name = "Times New Roman"

    xu_ly_doan(d.paragraphs)
    for bang in d.tables:
        for hang in bang.rows:
            for o in hang.cells:
                xu_ly_doan(o.paragraphs)
    for sec in d.sections:
        xu_ly_doan(sec.header.paragraphs)
        xu_ly_doan(sec.footer.paragraphs)
    d.save(ra)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 2:
        sys.exit(__doc__)
    vao, ra = args
    if vao.lower().endswith(".docx"):
        chuyen_docx(vao, ra, "--tat-ca" in sys.argv)
    else:
        with open(vao, encoding="latin-1") as f:
            noi_dung = f.read()
        with open(ra, "w", encoding="utf-8") as f:
            f.write(chuyen(noi_dung))
    print(f"Đã chuyển: {ra}")
