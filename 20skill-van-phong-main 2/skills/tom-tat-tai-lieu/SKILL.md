---
name: tom-tat-tai-lieu
description: Tóm tắt tài liệu dài thành ý chính và việc cần làm — văn bản pháp luật, công văn, hợp đồng, báo cáo, biên bản, email dài, bài nghiên cứu, sách, transcript cuộc họp/video. Tóm tắt nhiều tầng (1 câu – ý chính – chi tiết) và trích "ai phải làm gì, hạn nào". Dùng khi người dùng nói "tóm tắt", "tóm tắt giúp", "đọc giúp file này nói gì", "rút ý chính", "TL;DR", "có gì cần làm trong văn bản này".
---

# Tóm tắt tài liệu

Đọc `references/nguyen-tac-chung.md`.

## Nguyên tắc

- **Trung thành với nguồn**: chỉ tóm tắt điều tài liệu nói. Nhận xét riêng (nếu người dùng muốn) đặt ở mục riêng, ghi rõ "Nhận xét của trợ lý".
- Giữ nguyên **số liệu, ngày, tên riêng, số hiệu văn bản**; không làm tròn số tiền.
- Mỗi ý chính có thể truy về vị trí trong tài liệu (trang/mục/điều) khi tài liệu dài.
- Tài liệu bị cắt/không đọc được một phần → nói rõ phần nào chưa đọc.

## Định dạng đầu ra mặc định (3 tầng)

```
📌 MỘT CÂU: [Tài liệu này là gì, nói về việc gì, kết luận/yêu cầu chính]

Ý CHÍNH (3–7 gạch đầu dòng, xếp theo mức quan trọng với người đọc)
- ... (Mục/Điều/Trang ...)

VIỆC CẦN LÀM / MỐC THỜI GIAN
| Việc | Ai | Hạn | Căn cứ (mục/điều) |

SỐ LIỆU QUAN TRỌNG (nếu có)

ĐIỂM CẦN LƯU Ý (rủi ro, điểm mơ hồ, điểm thay đổi so với trước – chỉ khi tài liệu cho thấy)
```

Không có việc cần làm → ghi "Tài liệu không đặt ra việc cần làm cụ thể."

## Tùy biến theo loại tài liệu

| Loại | Thêm/nhấn mạnh |
|---|---|
| Văn bản pháp luật (luật, nghị định, thông tư) | Đối tượng áp dụng, hiệu lực từ ngày nào, văn bản bị thay thế, điểm mới so với quy định cũ, việc doanh nghiệp phải làm |
| Công văn, quyết định đến | Cơ quan gửi, yêu cầu gì, hạn trả lời/thực hiện, đầu mối |
| Hợp đồng | Các bên, giá trị, thanh toán, thời hạn, phạt, điều kiện chấm dứt (rà sâu dùng skill `phan-tich-tai-lieu`) |
| Biên bản/transcript họp | Quyết định đã chốt, việc giao (ai – hạn), vấn đề còn treo |
| Email chuỗi dài | Trạng thái hiện tại, ai đang chờ ai, câu hỏi chưa được trả lời |
| Báo cáo/nghiên cứu | Câu hỏi nghiên cứu, phương pháp, kết quả chính kèm số, hạn chế |

## Độ dài

- Mặc định: tóm tắt ≈ 10–15% độ dài gốc, tối đa 1 trang.
- Người dùng yêu cầu "ngắn nhất" → chỉ "Một câu" + "Việc cần làm".
- Nhiều tài liệu cùng lúc → tóm tắt từng cái + bảng so sánh/tổng hợp.
