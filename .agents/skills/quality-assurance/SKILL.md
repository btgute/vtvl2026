---
name: quality-assurance
description: Quy trình kiểm soát chất lượng toàn diện (QA) cho dự án HCM-UTE VTVL 360: kiểm tra biên dịch TypeScript, kiểm thử chu trình Excel 5 bước, quy chuẩn thương hiệu và giao diện responsive.
---

# Skill: Kiểm soát chất lượng và nghiệm thu (Quality Assurance)

## A. Thông tin Skill

- **Tên Skill:** `quality-assurance`
- **Mô tả chức năng:** Thực hiện rà soát chất lượng mã nguồn, tính đúng đắn của các tệp `.xlsx`/`.zip` sinh ra, kiểm tra giao diện thực tế trên trình duyệt và xác nhận tuân thủ mọi quy tắc trong `AGENTS.md`.
- **Mục tiêu sử dụng:** Đảm bảo không có lỗi biên dịch, lỗi runtime hay sai phạm thương hiệu trước khi bàn giao cho người dùng kiểm tra.
- **Điều kiện kích hoạt:** Kích hoạt ở Giai đoạn 5 (Kiểm thử) và trước mỗi lần báo cáo hoàn thành công việc.

## B. Quy trình thực hiện

1. **Dữ liệu đầu vào:** Toàn bộ mã nguồn trong `src/`, `scripts/`, `public/` và máy chủ phát triển cục bộ (`localhost`).
2. **Các bước xử lý:**
   - **Bước 1 — Kiểm tra cấu trúc và độ dài tệp:** Quét toàn bộ thư mục `src/` để xác nhận mọi tệp đều dưới `300 dòng` và đặt đúng thư mục chức năng.
   - **Bước 2 — Kiểm tra thương hiệu & ngôn ngữ:**
     - Xác nhận không có từ `HCMUTE` (thiếu gạch nối) hoặc tên trường cũ trong giao diện.
     - Xác nhận màu chữ chính là `rgb(0, 71, 118)` (`#004776`), không dùng `#000000` / `text-black`.
     - Xác nhận văn bản tiếng Việt tuân thủ quy tắc viết hoa Sentence case.
   - **Bước 3 — Kiểm tra biên dịch & chu trình nghiệp vụ 5 bước:**
     - Chạy kiểm tra TypeScript (`tsc --noEmit` / `next build`).
     - Kiểm tra luồng: Tạo tệp đơn vị (Bước 1–3) → Nạp phiếu đã điền (Bước 4) → Bấm giờ công việc (`/bam-gio`) → Rà soát 9 biểu (`/ra-soat`) → Tạo liên kết ngắn & QR thương hiệu (`/s-link`).
   - **Bước 4 — Xác nhận máy chủ cục bộ:** Khởi chạy máy chủ local và kiểm tra mã phản hồi HTTP `200 OK` trên tất cả các đường dẫn (`/`, `/tao-tep`, `/bam-gio`, `/ra-soat`, `/s-link`).
3. **Công cụ được phép sử dụng:** `run_command`, `read_file`, `edit_file`.
4. **Tiêu chuẩn chất lượng:** `0` lỗi TypeScript, `0` lỗi HTTP 500/404 trên các trang và tệp mẫu tải về.
5. **Kết quả đầu ra:** Báo cáo kiểm thử chi tiết theo 5 mục chuẩn quy tắc giao tiếp.

## C. Quy tắc kiểm tra

- **Kiểm tra tính chính xác:** Kiểm tra kích thước và cấu trúc các tệp mẫu trong `public/mau/` và gói tải ngoại tuyến trong `public/tai-ve/`.
- **Kiểm tra tính nhất quán:** Header, Footer, thanh mốc thời gian (Milestones) và màu sắc đồng nhất trên cả 5 trang.
- **Phát hiện lỗi & đề xuất cải tiến:** Nếu phát hiện bất kỳ tệp nào vượt 300 dòng hoặc lỗi hiển thị, phải tách module và sửa ngay trước khi báo cáo.

## D. Giới hạn

- **Những việc Skill không được thực hiện:** Không bao giờ tuyên bố hoàn thành nếu chưa thực sự chạy kiểm tra kết quả trên terminal/server.
- **Những trường hợp phải hỏi lại người dùng:** Khi phát hiện yêu cầu mâu thuẫn giữa quy định nghiệp vụ cũ và mới.
- **Những thay đổi cần được xác nhận:** Xóa các tệp dữ liệu đầu vào của người dùng.

