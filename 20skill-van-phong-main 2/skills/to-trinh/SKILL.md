---
name: to-trinh
description: Soạn tờ trình xin phê duyệt gửi cấp trên — xin chủ trương, phê duyệt dự toán/kinh phí, mua sắm, tuyển dụng, ban hành quy chế, ký hợp đồng, thanh lý tài sản. Dùng khi người dùng nói "viết tờ trình", "làm tờ trình xin duyệt", "trình giám đốc phê duyệt", "tờ trình mua sắm", "tờ trình xin kinh phí".
---

# Soạn tờ trình

Đọc `references/nguyen-tac-chung.md` và `references/the-thuc-nd30.md`.

Tờ trình khác đề xuất ở chỗ: **là văn bản hành chính có số, trình người có thẩm quyền ký duyệt** (thường kèm dự thảo quyết định). Đề xuất thì linh hoạt hơn, dùng skill `de-xuat`.

## 1. Thông tin cần có

Bắt buộc: việc xin duyệt, người/cấp duyệt, đơn vị trình. Nếu có tiền: tổng kinh phí và nguồn.
Còn thiếu thì để placeholder và liệt kê cuối văn bản.

## 2. Cấu trúc nội dung (5 phần)

```
                                TỜ TRÌNH
              Về việc [xin phê duyệt ...]

                    Kính gửi: [Giám đốc Công ty ABC]

I. CĂN CỨ / SỰ CẦN THIẾT
   - Căn cứ [kế hoạch năm, quy chế, chỉ đạo, hợp đồng...];
   - Thực trạng: [số liệu hiện tại → vấn đề → hậu quả nếu không làm].
II. NỘI DUNG ĐỀ NGHỊ PHÊ DUYỆT
   1. Mục tiêu
   2. Phạm vi, quy mô, số lượng
   3. Phương án thực hiện (nếu có nhiều phương án: bảng so sánh, nêu phương án đề xuất)
   4. Thời gian, tiến độ
III. KINH PHÍ VÀ NGUỒN KINH PHÍ
   Bảng dự toán: STT | Nội dung | ĐVT | SL | Đơn giá | Thành tiền | Ghi chú
   Tổng cộng (bằng số và bằng chữ); đã/chưa gồm VAT; nguồn: [ngân sách năm, quỹ...].
IV. HIỆU QUẢ / RỦI RO
   Lợi ích định lượng được (tiết kiệm, doanh thu, thời gian); rủi ro và biện pháp.
V. KIẾN NGHỊ
   "[Đơn vị] kính trình [Giám đốc] xem xét, phê duyệt:
    1. ...;
    2. Giao [đơn vị] tổ chức thực hiện."
   Kèm theo: [Dự thảo Quyết định, báo giá, hồ sơ...].
```

## 3. Quy tắc viết

- Câu đầu phần I phải cho người duyệt biết **vì sao phải duyệt ngay**.
- Dùng số liệu thật người dùng cung cấp; không có thì để `[CẦN SỐ LIỆU: ...]`, **không ước lượng hộ**.
- Mua sắm: khuyến nghị kèm ≥ 3 báo giá để so sánh (thông lệ quy chế mua sắm nội bộ của nhiều DN; kiểm tra quy chế của đơn vị người dùng).
- Thành tiền: kiểm tra phép nhân, phép cộng; số tiền bằng chữ dùng `scripts/doc_so.py` nếu chạy được Python.
- Văn phong: "kính trình", "đề nghị", không dùng "xin" lặp lại nhiều lần; kết thúc "./.".

## 4. Đầu ra

1. Tờ trình hoàn chỉnh (kèm phần đầu theo thể thức: tên cơ quan, số `.../TTr-...`, ngày tháng).
2. Bảng **Thông tin cần bổ sung**.
3. Gợi ý soạn kèm **dự thảo quyết định phê duyệt** (dùng skill `quyet-dinh`).
