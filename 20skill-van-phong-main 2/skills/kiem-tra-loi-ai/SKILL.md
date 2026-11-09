---
name: kiem-tra-loi-ai
description: Rà soát nội dung do AI tạo ra (hoặc bất kỳ bản nháp nào) trước khi dùng — phát hiện thông tin bịa, số liệu không nguồn, điều luật sai/hết hiệu lực, tên riêng sai, mâu thuẫn nội bộ, lỗi tính toán, lỗi chính tả và dịch máy tiếng Việt; đánh dấu chỗ cần xác minh. Dùng khi người dùng nói "kiểm tra lỗi AI", "check lại bài này", "rà soát nội dung", "AI viết có đúng không", "fact-check", "soát chính tả", "kiểm tra trước khi gửi".
---

# Kiểm tra lỗi AI

Đọc `references/nguyen-tac-chung.md` và `references/checklist-ra-soat.md`.

## Nguyên tắc

- Skill **báo lỗi và đề xuất sửa**, không âm thầm viết lại toàn bộ.
- Phân biệt rõ 3 trạng thái cho mỗi khẳng định quan trọng:
  - ✅ **Kiểm chứng được**: đối chiếu được với tài liệu nguồn người dùng cung cấp, hoặc với kết quả tra cứu (ghi nguồn).
  - ⚠️ **Cần xác minh**: hợp lý nhưng không có nguồn trong tài liệu; không tra cứu được.
  - ❌ **Sai/mâu thuẫn**: trái với nguồn, trái với chính văn bản, sai phép tính.
- Không có công cụ tra cứu web → **không tự khẳng định đúng/sai** với dữ kiện bên ngoài; đánh dấu ⚠️.

## Quy trình

1. **Xác định nguồn đối chiếu**: tài liệu gốc người dùng đưa (nếu có), kiến thức chung, công cụ tìm kiếm (nếu có).
2. **Trích các khẳng định kiểm chứng được**: số liệu, ngày tháng, tên người/tổ chức, điều luật, trích dẫn, so sánh "nhất".
3. **Chạy checklist** `references/checklist-ra-soat.md` (7 nhóm).
4. **Tính lại mọi phép tính** (tổng, %, tăng trưởng). Dùng Python nếu có.
5. **Báo cáo**.

## Định dạng báo cáo

```
KẾT LUẬN: [Dùng được / Dùng được sau khi sửa N lỗi / Không nên dùng – lý do]

| # | Mức | Vị trí (trích nguyên văn) | Vấn đề | Đề xuất sửa |
|---|-----|---------------------------|--------|-------------|
Mức: 🔴 Sai nghiêm trọng (sai sự thật, sai luật, sai số tiền) · 🟡 Cần xác minh/sửa · 🔵 Văn phong, chính tả

CẦN NGƯỜI DÙNG XÁC MINH: danh sách khẳng định ⚠️ kèm gợi ý nguồn để kiểm (Cổng thông tin điện tử Chính phủ, Cơ sở dữ liệu quốc gia về văn bản pháp luật vbpl.vn, Tổng cục Thống kê/Cục Thống kê, website chính thức của doanh nghiệp...).
```

Hỏi người dùng có muốn bản đã sửa không; nếu có, trả bản sửa và đánh dấu chỗ thay đổi.
