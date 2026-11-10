---
name: hcmute-ui-system
description: Hệ thống thiết kế giao diện chuẩn HCM-UTE Design System V2 & S-Link (học hỏi từ link.hcmute.edu.vn với hệ màu Xanh thẫm #004776, Xanh hành động #006cee, font Inter, typography bolder 110%, nút bấm CTA chuẩn S-Link, card bo góc và micro-interactions).
---

# Skill: Hệ thống thiết kế giao diện HCM-UTE (Design System V2 & S-Link UI)

## A. Thông tin Skill

- **Tên Skill:** `hcmute-ui-system`
- **Mô tả chức năng:** Định nghĩa toàn bộ quy chuẩn UI/UX đồng bộ dựa trên nghiên cứu và học hỏi từ hệ sinh thái **HCM-UTE S-Link** (`https://link.hcmute.edu.vn/`), cổng thông tin Trường Đại học Công nghệ Kỹ thuật TP.HCM và hệ thống **Vị trí việc làm 360**.
- **Mục tiêu sử dụng:**
  1. Giữ vững nhận diện thương hiệu đại học: chữ xanh thẫm `rgb(0, 71, 118)` (`#004776`), không dùng màu đen thuần `#000000` hay xám đen.
  2. Tạo giao diện hiện đại, sang trọng theo chuẩn S-Link: nút CTA xanh hoàng gia `#006cee`, font Inter, độ đậm tăng cường 110%, bo tròn mềm mại (`rounded-full` / `rounded-2xl`).
  3. Hoạt động tối ưu trên máy tính (Desktop), máy tính bảng (Tablet) và điện thoại di động (Mobile).
- **Điều kiện kích hoạt:** Kích hoạt khi xây dựng hoặc chỉnh sửa các tệp trong `src/app/`, `src/components/`, `globals.css` và các quy chuẩn thiết kế giao diện.

---

## B. Quy trình thực hiện

### 1. Áp dụng Bảng màu chuẩn S-Link & HCM-UTE (Color Palette)
Hệ thống màu sắc được trích xuất và đồng bộ hóa trực tiếp từ `link.hcmute.edu.vn`:

- **Màu chữ chính (`--foreground`):** `#004776` (`rgb(0, 71, 118)`). Dùng cho toàn bộ Heading, Body text, nhãn Form, Header bảng. Tuyệt đối cấm dùng `#000000`, `text-black`, `text-slate-900`, `text-gray-900`.
- **Màu hành động chính (`--primary` / S-Link Action Blue):** `#006cee` (hover: `#005ecc`). Dùng cho nút CTA chính, tab hoạt động, liên kết nổi bật và focus ring.
- **Màu chữ phụ (`--muted-foreground`):** `#20446c` (xanh xám thẫm trung tính thay vì xám tro). Dùng cho chú thích, ngày tháng, thông tin thứ cấp.
- **Màu nền phụ (`--secondary` / `--accent`):** `#e1edf8` và `#e3ecf6`. Dùng cho nút phụ, badge mã đơn vị, pill chọn biểu, hover state.
- **Màu đường viền (`--border`):** `#e1eaefe7` (viền xanh khói thanh thoát) và `#cbd5e1` (viền bảng tính).
- **Màu cảnh báo & Trạng thái:**
  - Lỗi nghiêm trọng / Nút xóa (`--destructive`): `#f4212e` (Đỏ HCM-UTE).
  - Hoàn thành / Đã lưu (`--success`): `#00b87a` / `#00c758` (Xanh ngọc bích).
  - Cần xem lại (`--warning`): `#f7b928` / `#f99c00` (Vàng cam ấm).

### 2. Quy chuẩn Font chữ & Phân cấp độ đậm (Typography & Bolder)
- **Phông chữ chuẩn:** `Inter, InterVariable, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`. Hỗ trợ toàn vẹn dải ký tự tiếng Việt Unicode với dấu thanh, dấu mũ chuẩn xác.
- **Quy tắc Bolder 110% (Tăng độ đậm phân cấp):**
  - Nội dung thường & Dữ liệu bảng: `font-weight: 440` (Normal tăng 110%).
  - Nhãn phụ, Chức danh, Ngày tháng: `font-weight: 500` (Medium).
  - Nút bấm, Thanh công cụ, Tiêu đề cột: `font-weight: 580 – 600` (Semibold).
  - Tiêu đề khối (Card Title), Mã đơn vị, Mã VTVL: `font-weight: 660 – 700` (Bold).
  - Tiêu đề Hero, Chỉ số KPI lớn: `font-weight: 715 – 800` (Extrabold).
- **Giãn chữ & Giãn dòng:**
  - Tiêu đề và nút CTA dùng `tracking-tight` (`-0.025em`).
  - Mã nhiệm vụ, số liệu định biên dùng `tabular-nums tracking-wide` (`0.025em`).

### 3. Quy chuẩn Call-to-Action (CTA) & Nút bấm chuẩn S-Link
- **Nút hành động chính (Primary CTA):**
  - Chiều cao `h-12` (48px) cho màn hình lớn; `h-10` (40px) hoặc `h-11` (44px) cho bàn làm việc.
  - Bo góc: `rounded-full` (hoặc `rounded-2xl` trên Desktop card).
  - Lớp CSS chuẩn:
    ```html
    <button class="inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold h-12 px-6 rounded-full bg-[#006cee] hover:bg-[#005ecc] text-white transition-all gap-2 shadow-sm hover:shadow-md cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-[#006cee]/50 active:scale-[0.98]">
      <span>Lưu &amp; Tiếp tục</span>
      <ArrowRight className="w-4 h-4 shrink-0" />
    </button>
    ```
- **Nút hành động phụ (Secondary Button):**
  - Nền `bg-[#e1edf8]` hover `bg-[#e3ecf6]`, chữ `text-[#004776] font-semibold`, bo `rounded-full` hoặc `rounded-xl`.
- **Nút lọc / Thẻ con (Filter Pill):**
  - Chiều cao `h-9` (36px), `rounded-full`, viền `#e1eaefe7`, chữ `#20446c` hover `text-[#004776]`, nền `hover:bg-[#e3ecf6]`.
- **Hiệu ứng gạch chân chuyển động mượt (S-Link Underline):**
  - Dùng cho các liên kết điều hướng:
    `relative inline-block w-fit text-sm font-medium tracking-tight text-[#004776] hover:text-[#006cee] transition-colors group after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[1.5px] after:w-0 after:bg-[#006cee] after:transition-all after:duration-300 after:ease-out hover:after:w-full`

### 4. Quy chuẩn Khung chứa, Thẻ (Card) & Bảng tính
- **Khung thẻ:** Nền trắng `#ffffff`, bo góc `rounded-2xl` hoặc `rounded-3xl`, viền `border border-[#cbd5e1]`, bóng mờ `shadow-2xs`.
- **Ô nhập liệu:** Nền `#f8fafc`, viền `#cbd5e1`, chữ `#004776`, focus viền `#006cee`, chiều cao dòng thoải mái không cắt dấu mũ tiếng Việt.

---

## C. Quy tắc kiểm tra

- **Kiểm tra tính chính xác màu chữ:** Quét mã nguồn để đảm bảo 100% văn bản, tiêu đề và nhãn ở chế độ sáng dùng màu xanh thẫm `rgb(0, 71, 118)` (`#004776`) hoặc `#20446c`. Tuyệt đối không dùng `text-black`, `text-slate-900`, `text-gray-900`.
- **Kiểm tra nút CTA:** Nút chính phải dùng tông xanh S-Link `#006cee`, có hiệu ứng hover mượt và focus ring an toàn (`ring-[3px] ring-[#006cee]/50`).
- **Kiểm tra độ đậm (Bolder):** Xác minh hệ thống chữ tuân thủ thang độ đậm tăng 110% (Normal 440, Medium 500, Semibold 580, Bold 660).
- **Kiểm tra thương hiệu:** Tên viết tắt luôn là **HCM-UTE** (có gạch nối `-`). Quy tắc viết hoa chuẩn **Sentence case** tiếng Việt.
- **Kiểm tra giới hạn tệp:** Mọi component trong `src/` phải dưới 300 dòng theo Quy tắc 8.

---

## D. Giới hạn

- **Những việc Skill không được thực hiện:** Không tự ý thay đổi schema 15 sheet, công thức tính toán, quy tắc kiểm tra K hoặc logic xử lý XML Excel.
- **Những trường hợp phải hỏi lại người dùng:** Khi có yêu cầu thay đổi màu sắc nhận diện thương hiệu cốt lõi (`#004776`) hoặc logo trường.
- **Những thay đổi cần được xác nhận:** Các sửa đổi phá vỡ cấu trúc layout bàn làm việc 2 khối hiện hành.
