---
name: vtvl-audit-engine
description: Bộ máy kiểm tra và rà soát chéo bộ biểu Vị trí việc làm theo chuẩn Hướng dẫn số 07-HD/BTCTW (A1, A2, B1, B2_CT, B2, C1, C2, C3, D1, D2, DM_SAN_PHAM, DU_BAO_5_NAM, K_KiemTra), phân loại cảnh báo 3 cấp độ (Phải sửa, Cần bổ sung căn cứ, Nên xem lại).
---

# Skill: Bộ máy Rà soát & Thẩm định Vị trí việc làm (`vtvl-audit-engine`) — Chuẩn Hướng dẫn 07-HD/BTCTW

## A. Thông tin Skill

- **Tên Skill:** `vtvl-audit-engine`
- **Mô tả chức năng:** Kiểm tra chéo dữ liệu giữa các bảng trong tệp `.xlsx` đơn vị theo đúng quy tắc kiểm soát tự động của **Hướng dẫn số 07-HD/BTCTW** và `Huong_dan_chuan_nhap_du_lieu_Bo_bieu_VTVL.docx`.
- **Mục tiêu sử dụng:** Giúp đơn vị phát hiện và xử lý triệt để các lỗi công thức, lỗi thiếu căn cứ, trùng nguồn lực hoặc lệch chuẩn trước khi ký nộp về Phòng Tổ chức - Nhân sự.
- **Điều kiện kích hoạt:** Khi làm việc với `src/services/excel-audit/` hoặc giao diện `/ra-soat`.

## B. Quy trình thực hiện (Hệ thống quy tắc kiểm tra chuẩn Hướng dẫn số 07-HD/BTCTW)

### 1. Phân loại 3 mức độ cảnh báo
- 🔴 **Phải sửa (`fix`):** Lỗi cấu trúc hoặc vi phạm quy tắc bắt buộc khiến chỉ tiêu kiểm tra tại `13. K_KiemTra` báo `CẦN RÀ SOÁT`:
  - `B1` cột R báo: `THIẾU MÃ VTVL`, `THIẾU KỲ`, `THIẾU SẢN LƯỢNG`, `CHƯA CHỌN TRẠNG THÁI`, `THIẾU THỜI GIAN`.
  - `B2_CT` cột P báo: `LOẠI TÁC ĐỘNG KHÔNG HỢP LỆ`, `TRÙNG CÔNG ĐOẠN`, `SẢN PHẨM ÁP DỤNG VƯỢT B1`, `GIỜ GIẢM VƯỢT GIỜ B1`.
  - `C1` cột K báo: `CHƯA CHỌN CHẾ ĐỘ LÀM VIỆC`, `CHẾ ĐỘ KHÔNG HỢP LỆ`, `THIẾU GIỜ ĐẶC THÙ`, `THIẾU MẪU SỐ`.
  - `C3` cột M báo: `PHƯƠNG PHÁP KHÔNG HỢP LỆ`, `MÃ VTVL CHƯA CÓ Ở C1`, `PP2: CÒN DÒNG B1 CHƯA ĐẠT`, `GIỜ RÒNG ÂM`.
  - `D1` cột J báo: `TRÙNG MÃ NGUỒN LỰC`, `THIẾU NƠI TÍNH BIÊN CHẾ`, `Vượt quỹ giờ`.
  - `D2` cột J/M báo: `NĂM KHÔNG HỢP LỆ`, `C3 CHƯA ĐƯỢC XÁC NHẬN`.
- 🟡 **Cần bổ sung căn cứ (`evidence`):**
  - `B1` cột R báo: `THIẾU NGUỒN SẢN LƯỢNG/CÔNG VIỆC`, `THIẾU NGUỒN THỜI GIAN`, `CHỜ XÁC NHẬN KHÁC CHUẨN`, hoặc nguồn còn chữ gợi ý mẫu.
  - `B2_CT` cột P báo: `CHỜ SOÁT TRÙNG`, `THAM KHẢO – KHÔNG TÍNH`.
  - `C1` cột K báo: `GIỜ CHƯA XÁC NHẬN`.
  - `C3` cột M báo: `CHỜ XÁC NHẬN NGHIỆP VỤ`, `CHƯA ĐỦ CĂN CỨ`.
  - `D1` cột J báo: `Chưa đủ căn cứ`.
  - `D2` cột J/M báo: `CHƯA CÓ DỰ BÁO NĂM ĐÃ KIỂM CHỨNG`, `THIẾU VĂN BẢN THẨM ĐỊNH/QUYẾT ĐỊNH`.
- 🔵 **Nên xem lại (`review`):**
  - Định mức `Phút/SP` thực tế chênh lệch lớn so với `Phút/SP chuẩn` trong `11. DM_SAN_PHAM`.
  - Đề nghị điều chỉnh biên chế tại `10. D2_PhuongAn` tăng/giảm đột biến so với năm cơ sở `C3_NhuCau`.

## C. Quy tắc kiểm tra
- Hỗ trợ đọc đồng thời cả tệp mẫu chuẩn `03. Bo bieu VTVL 25-10-2026.xlsx` và tệp đơn vị HCM-UTE được tách từ hệ thống.
- Luôn chỉ rõ: `[Mã đơn vị] · [Tên bảng]!Ô tọa độ · [Mã cảnh báo chuẩn] · [Hướng dẫn khắc phục cụ thể]`.

## D. Giới hạn
- Không tự ý sửa ngầm số liệu trong tệp của đơn vị khi người dùng chỉ yêu cầu kiểm tra/rà soát.
