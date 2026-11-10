# Bảng đối chiếu trường dữ liệu Biểu C2 và Biểu D1 giữa Website và Excel HD07

Tài liệu này xác lập mối tương quan chi tiết giữa các trường nhập liệu trên giao diện web VTVL HCM-UTE và các cột tương ứng trong biểu mẫu Excel chuẩn Hướng dẫn số 07-HD/BTCTW, Nghị định số 232/2026/NĐ-CP và Thông tư số 31/2026/TT-BGDĐT.

---

## 1. Biểu 7. C2_NangLuc (Bản mô tả VTVL & Khung năng lực Bậc 1–5)

### 1.1. Mục đích nghiệp vụ
Biểu C2 quy định bản mô tả khung năng lực chuẩn theo Nghị định 232/2026/NĐ-CP (Phụ lục I, II, III — Bậc nghề nghiệp 1 đến 5) và Thông tư 31/2026/TT-BGDĐT cho từng Vị trí việc làm (VTVL) thuộc cơ cấu đơn vị.

### 1.2. Bảng mapping chi tiết

| Cột Excel | Tên cột trong file Excel HD07 | Trường trên Website | Kiểu dữ liệu | Nguồn dữ liệu / Ràng buộc | Ghi chú nghiệp vụ |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **A** | Mã vị trí việc làm | `maVtvl` | Chuỗi (Code) | Khóa ngoại tham chiếu `C1!A` (`vtvlList`) | Mã chuẩn: `TCNS.QL01`, `TCNS.CM01`... |
| **B** | Tên vị trí việc làm | `tenVtvl` | Chuỗi văn bản | Tự động điền từ `C1!B` theo `maVtvl` | Tên theo danh mục chuẩn Nghị định 232 |
| **C** | Bậc nghề nghiệp | `bacNgheNghiep` | Danh mục chọn | Chọn từ 5 bậc: Bậc 1 đến Bậc 5 | Bậc 1 (Nhân viên) → Bậc 5 (Chuyên viên cao cấp / GVCC) |
| **D** | Nhóm năng lực | `nhomNangLuc` | Danh mục chọn | `Năng lực chung`, `Năng lực chuyên môn`, `Năng lực quản lý` | Phân loại 3 nhóm năng lực theo NĐ 232 |
| **E** | Tên năng lực cụ thể | `tenNangLuc` | Chuỗi văn bản | Nhập liệu hoặc mẫu khung năng lực | Ví dụ: Soạn thảo văn bản, Ứng dụng CNTT |
| **F** | Cấp độ yêu cầu | `capDoYeuCau` | Danh mục chọn | `Cấp độ 1`, `Cấp độ 2`, `Cấp độ 3`, `Cấp độ 4`, `Cấp độ 5`, `Đáp ứng năng lực` | Cấp độ từ 1 (cơ bản) đến 5 (chuyên gia) |
| **G** | Mô tả chi tiết năng lực | `moTaChiTiet` | Đoạn văn | Nhập tự do | Chi tiết biểu hiện hành vi và tiêu chuẩn đầu ra |

### 1.3. Ràng buộc toàn vẹn & Đồng bộ
1. Mỗi dòng C2 bắt buộc phải có `maVtvl` hợp lệ đã khai tại Biểu `6. C1_VTVL`.
2. Khi đổi `maVtvl` trên Biểu C1, hệ thống tự động đồng bộ sang tất cả các dòng C2 tương ứng.
3. Khi xóa một VTVL trên C1, cảnh báo người dùng về các dòng năng lực liên kết tại C2.

---

## 2. Biểu 9. D1_NhanLuc (Danh sách nhân sự hiện có chốt ngày 30/9/2026)

### 2.1. Mục đích nghiệp vụ
Biểu D1 thống kê toàn bộ đội ngũ viên chức và người lao động hiện có tại đơn vị tính đến thời điểm chốt số liệu đề án (ngày 30/9/2026), phục vụ so sánh giữa biên chế hiện có và nhu cầu tính toán (Biểu C3 và D2).

### 2.2. Bảng mapping chi tiết

| Cột Excel | Tên cột trong file Excel HD07 | Trường trên Website | Kiểu dữ liệu | Nguồn dữ liệu / Ràng buộc | Ghi chú nghiệp vụ |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **A** | Họ và tên nhân sự | `hoTen` | Chuỗi văn bản | Bắt buộc nhập | Tên viên chức / người lao động theo CCCD |
| **B** | Mã VTVL đảm nhận | `maVtvl` | Chuỗi (Code) | Khóa ngoại tham chiếu `C1!A` (`vtvlList`) | VTVL mà nhân sự đang thực tế đảm nhiệm |
| **C** | Ngày tháng năm sinh | `ngaySinh` | Ngày / Chuỗi | Định dạng `dd/mm/yyyy` hoặc năm sinh | Dùng để tính tuổi nghỉ hưu & dự báo biến động |
| **D** | Giới tính | `gioiTinh` | Danh mục chọn | `Nam`, `Nữ` | Phục vụ thống kê cơ cấu giới tính |
| **E** | Trình độ đào tạo cao nhất | `trinhDo` | Danh mục chọn | `Tiến sĩ`, `Thạc sĩ`, `Đại học`, `Cao đẳng`, `Trung cấp` | Đối chiếu với chuẩn trình độ tối thiểu của VTVL |
| **F** | Ngạch viên chức hiện giữ | `ngachVienChuc` | Chuỗi văn bản | Danh mục chuẩn Thông tư 31 & Bộ Nội vụ | Ví dụ: Chuyên viên chính, Giảng viên chính |
| **G** | Mã số ngạch | `maSoNgach` | Chuỗi (Code) | Chuẩn mã ngạch (VD: `01.002`, `V.07.01.02`) | Tra cứu theo danh mục ngạch viên chức nhà nước |
| **H** | Hệ số lương hiện hưởng | `heSoLuong` | Số thập phân | Bảng lương Nhà nước (VD: `4.40`, `5.08`) | Dùng để dự toán quỹ tiền lương |
| **I** | Loại hợp đồng / Tuyển dụng | `loaiHopDong` | Danh mục chọn | `Viên chức không thời hạn`, `Viên chức có thời hạn`, `Hợp đồng NĐ 111` | Căn cứ pháp lý về quan hệ lao động |
| **J** | Ghi chú / Kiêm nhiệm | `ghiChu` | Chuỗi văn bản | Tùy chọn | Ghi chú chức danh kiêm nhiệm hoặc quy hoạch |

### 2.3. Ràng buộc toàn vẹn & Kiểm tra chéo (K_KiemTra)
1. **Kiểm tra chéo D1 vs C1:** Mọi nhân sự trong D1 phải có `maVtvl` tồn tại trong C1. Nếu có nhân sự mang mã không tồn tại, hệ thống báo lỗi đỏ cấp độ "Phải sửa".
2. **Kiểm tra chéo D1 vs C3/D2:** Tổng số nhân sự hiện có trong D1 được tổng hợp lên Cột Hiện có của Biểu `10. D2_PhuongAn` để tính chênh lệch Thừa / Thiếu so với Nhu cầu.
