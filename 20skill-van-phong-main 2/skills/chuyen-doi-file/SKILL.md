---
name: chuyen-doi-file
description: Chuyển đổi định dạng file văn phòng — Word ↔ PDF, Excel ↔ PDF/CSV, PowerPoint → PDF, .doc/.xls đời cũ → .docx/.xlsx, Markdown → Word, chuyển hàng loạt; sửa lỗi font tiếng Việt TCVN3 (.VnTime) và VNI sang Unicode. Dùng khi người dùng nói "chuyển Word sang PDF", "đổi PDF sang Word", "chuyển file", "file bị lỗi font", "chữ bị lỗi kiểu ViÖt Nam", "font .VnTime", "chuyển mã Unicode".
---

# Chuyển đổi file

Đọc `references/nguyen-tac-chung.md`.

## 1. Bảng chọn công cụ

| Chuyển đổi | Cách làm (ưu tiên từ trên xuống) |
|---|---|
| Word/Excel/PPT → PDF | `scripts/chuyen_doi.sh pdf file.docx` (LibreOffice). Trên Windows: File → Save As → PDF |
| .doc → .docx, .xls → .xlsx, .ppt → .pptx | `scripts/chuyen_doi.sh docx file.doc` |
| PDF có lớp chữ → Word | `scripts/chuyen_doi.sh docx file.pdf` (bố cục có thể lệch) hoặc Word mở trực tiếp PDF |
| PDF scan → Word | OCR trước (skill `xu-ly-pdf`), rồi chuyển |
| Excel → CSV (UTF-8) | `pandas.read_excel(...).to_csv(..., encoding="utf-8-sig")` – **utf-8-sig** để Excel mở CSV không lỗi dấu |
| CSV → Excel | `pandas.read_csv(..., dtype=str)` rồi `to_excel` (giữ số 0 đầu) |
| Markdown/HTML → Word | `pandoc file.md -o file.docx` (có thể dùng `--reference-doc` để áp mẫu Times New Roman 14) |
| Hàng loạt | `scripts/chuyen_doi.sh pdf *.docx` |

## 2. Sửa lỗi font tiếng Việt

### Nhận diện bảng mã

| Hiện tượng | Bảng mã gốc | Ví dụ |
|---|---|---|
| "ViÖt Nam", "Céng hßa", "§éc lËp" | **TCVN3 (ABC)** – font .VnTime, .VnArial | phổ biến ở văn bản cơ quan nhà nước cũ |
| "Vieät Nam", "Coäng hoøa", "Ñoäc laäp" | **VNI** – font VNI-Times | phổ biến ở miền Nam |
| "Viá»‡t Nam" | Unicode UTF-8 bị đọc thành Windows-1252 | lỗi mã hóa khi mở CSV/web |

### Cách xử lý

- **TCVN3**: `python3 scripts/tcvn3_to_unicode.py vao.docx ra.docx` (hoặc .txt). Script chỉ đổi các đoạn dùng font `.Vn*` và đổi font sang Times New Roman; font `.Vn...H` (chữ hoa) được in hoa.
- **VNI**: hướng dẫn dùng **UniKey Toolkit** (Ctrl+Shift+F6): copy văn bản → chọn Nguồn VNI Windows, Đích Unicode → Chuyển mã → dán lại. Hoặc EVKey có chức năng tương tự.
- **UTF-8 bị đọc sai**: `s.encode("cp1252").decode("utf-8")`, hoặc mở CSV bằng Excel qua Data → From Text/CSV → chọn File Origin "65001: Unicode (UTF-8)".
- Sau chuyển: rà lại tên riêng, chữ hoa có dấu; nhắc người dùng kiểm tra bằng mắt.

## 3. Kiểm tra sau chuyển đổi

- [ ] Số trang tương đương bản gốc
- [ ] Bảng không vỡ, ô gộp giữ nguyên
- [ ] Phông tiếng Việt hiển thị đúng (nếu PDF lỗi ô vuông → máy thiếu font: cài font hoặc nhúng font khi xuất)
- [ ] Số tiền, ngày tháng không bị đổi định dạng (Excel → CSV hay mất số 0 đầu)
- [ ] Đặt tên file kết quả không dấu, không khoảng trắng nếu gửi qua hệ thống cũ: `Hop_dong_ABC_2026.pdf`

## 4. Bảo mật

Không khuyến nghị tải file hợp đồng, hồ sơ nhân sự lên trang chuyển đổi trực tuyến. Ưu tiên LibreOffice/Word cục bộ.
