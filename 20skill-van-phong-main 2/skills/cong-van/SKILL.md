---
name: cong-van
description: Soạn công văn hành chính đúng thể thức Nghị định 30/2020/NĐ-CP — công văn đề nghị, phúc đáp, đôn đốc, giải trình, xin ý kiến, thông báo gửi đối tác hoặc cơ quan nhà nước. Dùng khi người dùng nói "soạn công văn", "viết công văn gửi...", "công văn phúc đáp", "công văn đề nghị", "V/v ...", hoặc cần một văn bản giao dịch chính thức không có tên loại.
---

# Soạn công văn

Đọc `references/nguyen-tac-chung.md` và `references/the-thuc-nd30.md` trước khi soạn.

## 1. Xác định loại công văn

| Loại | Mục đích | Giọng điệu |
|---|---|---|
| Đề nghị / kiến nghị | Xin cấp trên, đối tác làm một việc | Lịch sự, nêu rõ căn cứ và lợi ích |
| Phúc đáp | Trả lời công văn/đơn đã nhận | Dẫn số, ngày văn bản được phúc đáp ngay câu đầu |
| Đôn đốc, nhắc nhở | Yêu cầu hoàn thành việc đã giao | Dứt khoát, có hạn chót |
| Giải trình | Làm rõ sự việc, số liệu | Khách quan, có số liệu, nhận trách nhiệm phần mình |
| Xin ý kiến | Hỏi hướng xử lý | Nêu phương án đề xuất kèm câu hỏi cụ thể |
| Mời, giới thiệu, cảm ơn | Giao dịch thông thường | Ngắn gọn |

Nếu không rõ loại, suy ra từ yêu cầu; chỉ hỏi khi không đoán được **người nhận** hoặc **việc cần người nhận làm**.

## 2. Thông tin cần có

Bắt buộc: cơ quan ban hành, người nhận (Kính gửi), nội dung chính, người ký (chức vụ + họ tên).
Không có thì để placeholder: số công văn, ngày, đơn vị soạn thảo, địa danh, nơi nhận khác.

## 3. Cấu trúc thân công văn (3 phần)

1. **Mở đầu – căn cứ/lý do**: "Căn cứ...", hoặc "Phúc đáp Công văn số 45/ABC-KD ngày 12/10/2026 của Quý Công ty về việc..., Công ty XYZ trả lời như sau:", hoặc "Thực hiện...". Một đoạn, không quá 3 câu.
2. **Nội dung chính**: trình bày sự việc, đề nghị cụ thể. Nhiều ý thì đánh số 1, 2, 3 hoặc gạch đầu dòng. Mỗi đề nghị trả lời được câu hỏi: *ai làm gì, đến khi nào*.
3. **Kết thúc**: "Công ty XYZ đề nghị Quý Cơ quan xem xét, giải quyết./." hoặc "Trân trọng./." Kết thúc văn bản bằng dấu `./.`.

## 4. Mẫu khung

```
[TÊN CƠ QUAN CHỦ QUẢN]                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
[TÊN CƠ QUAN BAN HÀNH]                      Độc lập - Tự do - Hạnh phúc
Số: [...]/[ABC]-[ĐV]
V/v [trích yếu ngắn ≤ 1 dòng]          [Địa danh], ngày ... tháng ... năm ...

                    Kính gửi: [Người nhận – tên cơ quan/chức danh cụ thể]

[Phần mở đầu]
[Phần nội dung]
[Phần kết thúc]./.

Nơi nhận:                                         [QUYỀN HẠN, CHỨC VỤ]
- Như trên;                                       (Chữ ký, dấu)
- [...];
- Lưu: VT, [ĐV].                                  [Họ và tên]
```

- Gửi nhiều nơi: "Kính gửi:" rồi xuống dòng, mỗi nơi một gạch đầu dòng.
- Trích yếu bắt đầu bằng "V/v", viết thường, không có dấu chấm cuối, nêu đúng việc (VD: "V/v đề nghị gia hạn thời gian thanh toán hợp đồng số 12/2026/HĐMB").

## 5. Kiểm tra trước khi trả kết quả

- [ ] Trích yếu khớp nội dung thân bài
- [ ] Văn bản được phúc đáp/viện dẫn ghi đủ số, ngày, cơ quan ban hành
- [ ] Ngày tháng < 10 và tháng 1, 2 có số 0 đứng trước (ngày 05 tháng 02)
- [ ] Địa chỉ không còn cấp quận/huyện (địa giới mới từ 01/7/2025) – nếu có địa chỉ cũ thì cảnh báo
- [ ] Không có từ khẩu ngữ, emoji, "mình", "bạn"
- [ ] Có "./." cuối nội dung; nơi nhận có "Lưu: VT"

## 6. Đầu ra

1. Công văn hoàn chỉnh (văn bản thuần, giữ bố cục 2 cột bằng bảng Markdown không tiêu đề nếu cần).
2. Bảng **Thông tin cần bổ sung** (các placeholder).
3. Hỏi người dùng có muốn xuất .docx đúng lề/phông NĐ 30 không. Nếu có và môi trường chạy được Python: dùng `python-docx`, A4, lề trái 30 mm, phải 15 mm, trên/dưới 20 mm, Times New Roman 14, phần đầu dùng bảng 2 cột không viền.
