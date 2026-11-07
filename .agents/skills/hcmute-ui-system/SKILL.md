---
name: hcmute-ui-system
description: Hệ thống thiết kế giao diện chuẩn HCM-UTE Design System V2 và S-Link (hệ màu OKLCH, chữ xanh thẫm #004776, hiệu ứng Aurora, 3D Icons, Header/Footer hệ sinh thái, Mobile-First).
---

# Skill: Hệ thống thiết kế giao diện HCM-UTE (Design System V2 & S-Link UI)

## A. Thông tin Skill

- **Tên Skill:** `hcmute-ui-system`
- **Mô tả chức năng:** Định nghĩa toàn bộ quy chuẩn UI/UX đồng bộ với `https://link.hcmute.edu.vn/` và cổng thông tin `HCM-UTE`, kết hợp bố cục bàn làm việc trực quan của hệ thống `Vị trí việc làm 360`.
- **Mục tiêu sử dụng:** Tạo ra giao diện sắc nét, hiện đại, chuẩn thương hiệu HCM-UTE, hỗ trợ chế độ Sáng/Tối (Light/Dark Mode) và tương thích hoàn hảo trên cả máy tính lẫn điện thoại.
- **Điều kiện kích hoạt:** Kích hoạt khi xây dựng hoặc chỉnh sửa các tệp trong `src/app/`, `src/components/` và `globals.css`.

## B. Quy trình thực hiện

1. **Dữ liệu đầu vào:** Yêu cầu thiết kế trang, màn hình chức năng, bảng dữ liệu hoặc thành phần tương tác.
2. **Các bước xử lý:**
   - **Áp dụng bảng màu OKLCH & quy tắc màu chữ `#004776`:**
     - Màu nền sáng `--background: #ffffff` / `#f8fafc`, màu chữ chính `--foreground: rgb(0, 71, 118)` (`#004776`).
     - Màu chủ đạo `--primary: #0072BC` (HCM-UTE Blue), màu nhấn đỏ `--destructive: #ED1C24` (HCM-UTE Red).
   - **Cấu trúc khung trang chuẩn `link.hcmute.edu.vn`:**
     - Hai đường kẻ biên dọc cố định hai bên khung `max-w-7xl` (`pointer-events-none fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-7xl border-x border-border hidden xl:block`).
     - Header cố định hiệu ứng kính mờ (`bg-background/80 backdrop-blur-2xl border-b border-border`), hiển thị logo `horizontal-ute-logo.png` và thanh điều hướng giữa các phân hệ: **Trang chủ**, **Tạo tệp đơn vị**, **Rà soát 9 biểu**, **Bấm giờ**, **S-Link & QR**.
     - Hero section có lưới SVG nghiêng (`skew-y-12`), tiêu đề chữ chuyển sắc **Aurora HCM-UTE** và biểu tượng **3D Icon HCM-UTE** từ `/assets/3d-icons/`.
     - Footer nền xanh thương hiệu (`bg-primary text-white`) với đầy đủ 4 cột liên kết hệ sinh thái HCM-UTE và logo trắng `horizontal-ute-logo-white.png`.
   - **Tối ưu hiển thị di động (Mobile-First):**
     - Các nút bấm có chiều cao tối thiểu `44px` (`h-11` / `h-12`).
     - Bảng dữ liệu rộng bắt buộc bọc trong khối `overflow-x-auto`.
3. **Công cụ được phép sử dụng:** `read_file`, `write_file`, `edit_file`.
4. **Tiêu chuẩn chất lượng:** Không dùng màu đen thuần `#000000`, không tràn ngang màn hình di động, không cắt dấu tiếng Việt trong ô nhập liệu.
5. **Kết quả đầu ra:** Các React Component sạch, dưới 300 dòng mỗi tệp, đạt chuẩn thẩm mỹ HCM-UTE.

## C. Quy tắc kiểm tra

- **Kiểm tra tính chính xác:** Quét mã nguồn để đảm bảo không tồn tại các lớp `text-black`, `text-slate-900`, `text-gray-900` ở chế độ sáng.
- **Kiểm tra tính nhất quán:** Mọi thẻ tính năng dùng bo góc `rounded-2xl` hoặc `rounded-3xl`, viền `border-border`, hiệu ứng chuyển động mượt.
- **Phát hiện lỗi & đề xuất cải tiến:** Kiểm tra độ tương phản chữ ở cả chế độ Sáng và Tối; đảm bảo các số liệu thống kê dùng `tabular-nums`.

## D. Giới hạn

- **Những việc Skill không được thực hiện:** Không nhúng logic xử lý đọc/ghi XML Excel phức tạp trực tiếp vào bên trong file giao diện JSX.
- **Những trường hợp phải hỏi lại người dùng:** Khi cần thay đổi bố cục nhận diện thương hiệu cốt lõi của Header/Footer nhà trường.
- **Những thay đổi cần được xác nhận:** Thay đổi bảng màu gốc trong `globals.css`.

