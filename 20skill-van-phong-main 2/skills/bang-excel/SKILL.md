---
name: bang-excel
description: Làm việc với Excel/Google Sheets cho văn phòng Việt Nam — tạo bảng tính có công thức (bảng lương, chấm công, BHXH, thuế TNCN, công nợ, tồn kho, doanh thu), viết/giải thích công thức (VLOOKUP, XLOOKUP, SUMIFS, IF lồng, PivotTable), làm sạch dữ liệu tiếng Việt (dấu, khoảng trắng, số điện thoại, trùng lặp), đọc số tiền thành chữ. Dùng khi người dùng nói "làm bảng Excel", "công thức Excel", "làm bảng lương", "chấm công", "làm sạch dữ liệu", "lọc trùng", "pivot", "Google Sheets".
---

# Bảng Excel

Đọc `references/nguyen-tac-chung.md` và `references/mau-bang-tinh.md`.

## 1. Xác định việc cần làm

| Yêu cầu | Cách làm |
|---|---|
| Viết/giải thích 1 công thức | Trả công thức + giải thích từng phần + ví dụ ô. Nêu cả bản Excel và Google Sheets nếu khác nhau |
| Tạo bảng tính mới | Thiết kế cột → tạo file `.xlsx` bằng `openpyxl` với **công thức thật**, không ghi số đã tính sẵn |
| Làm sạch dữ liệu | Chạy `scripts/lam_sach.py` hoặc viết pandas tương đương; báo cáo những gì đã sửa |
| Phân tích dữ liệu | Đọc file → tóm tắt (số dòng, cột, giá trị thiếu) → PivotTable/bảng tổng hợp → nhận xét |

## 2. Quy tắc thiết kế bảng tính

1. **Một sheet "Tham_so"** chứa mọi hằng số (lương tối thiểu vùng, tỷ lệ BHXH, mức giảm trừ gia cảnh, thuế suất). Công thức tham chiếu ô tham số, không gõ số cứng. Ghi chú ở mỗi tham số: "Nguồn/văn bản – cần kiểm tra mức hiện hành".
2. Dữ liệu dạng bảng chuẩn: 1 dòng tiêu đề, không gộp ô trong vùng dữ liệu, không dòng trống.
3. Định dạng: số tiền `#,##0` (hiển thị theo thiết lập vùng của máy: 1.000.000), ngày `dd/mm/yyyy`, cố định dòng tiêu đề (Freeze Panes), bật AutoFilter.
4. Mã nhân viên, SĐT, MST, số CCCD, số tài khoản: lưu dạng **Text** (tránh mất số 0 đầu và số dài bị đổi sang dạng 1,23E+11).
5. Tên cột tiếng Việt có dấu được, nhưng tên sheet nên không dấu, không khoảng trắng (dễ tham chiếu).
6. Dùng tên vùng (Named Range) hoặc Excel Table cho tham số và danh mục.

## 3. Lưu ý Excel tại Việt Nam

- **Dấu phân cách đối số**: máy cài định dạng vùng Việt Nam dùng dấu chấm phẩy `;` thay dấu phẩy `,` trong công thức (`=IF(A2>0;"Có";"Không")`). Khi đưa công thức, ghi chú điều này hoặc đưa cả hai dạng.
- Tìm kiếm tiếng Việt không khớp do Unicode tổ hợp vs dựng sẵn → chuẩn hóa NFC (script `lam_sach.py`).
- Đọc số thành chữ: Excel không có hàm sẵn. Phương án: (a) dùng `scripts/doc_so.py` khi tạo file; (b) add-in VnTools/ hàm VBA tự viết – nêu cho người dùng tự cài, không đính kèm macro lạ.
- Hàm mới (XLOOKUP, FILTER, UNIQUE, LET) chỉ có trên Excel 365/2021+ và Google Sheets; Excel 2016/2019 dùng INDEX/MATCH thay thế. Hỏi phiên bản nếu quan trọng.

## 4. Bảng lương, BHXH, thuế TNCN

Xem `references/mau-bang-tinh.md`. Luôn:
- Đặt tỷ lệ đóng BHXH/BHYT/BHTN, mức giảm trừ gia cảnh, biểu thuế lũy tiến trong sheet Tham_so.
- Ghi rõ trong kết quả: **"Các tỷ lệ và mức giảm trừ đã nhập theo hiểu biết hiện có; kế toán cần kiểm tra lại theo quy định hiện hành"**. Chính sách thuế TNCN có thay đổi lớn từ 2026 – không khẳng định con số nếu người dùng không xác nhận.

## 5. Đầu ra

- File `.xlsx` (nếu chạy được Python) + mô tả cấu trúc sheet, cột, công thức chính.
- Hoặc công thức + hướng dẫn từng bước nếu chỉ hỏi công thức.
- Luôn thử mở lại file đã tạo (openpyxl) để chắc chắn không lỗi trước khi giao.
