---
name: vtvl-excel-engine
description: Lõi xử lý tệp Excel (.xlsx) và gói nén (.zip) theo chuẩn Hướng dẫn số 07-HD/BTCTW cho hệ thống Vị trí việc làm 360 HCM-UTE: tách bộ 15+ bảng tính chuẩn (A1, A2, B1, B2_CT, B2, C1, C2, C3, D1, D2, DM_SAN_PHAM, K_KiemTra, T_TienDo, S_NhatKy, DU_BAO_5_NAM), sinh phiếu khảo sát B2, bấm giờ đo định mức và nạp gộp nhiều phiếu.
---

# Skill: Lõi xử lý Excel & ZIP Vị trí việc làm 360 (`vtvl-excel-engine`) — Chuẩn Hướng dẫn số 07-HD/BTCTW

## A. Thông tin Skill

- **Tên Skill:** `vtvl-excel-engine`
- **Mô tả chức năng:** Xử lý tạo lập, tách, đọc và gộp tệp bảng tính `.xlsx` cùng gói nén `.zip` hoàn toàn trên trình duyệt (100% client-side, tuyệt đối không đẩy dữ liệu nội bộ lên mạng) theo đúng cấu trúc **Hướng dẫn số 07-HD/BTCTW** và tệp chuẩn **`03. Bo bieu VTVL 25-10-2026.xlsx`**.
- **Mục tiêu sử dụng:** Tự động hóa chu trình lập hồ sơ Vị trí việc làm (kỳ số liệu `01/10/2025–30/9/2026`, phương án biên chế `2027–2031`) cho 51 đơn vị thuộc HCM-UTE.
- **Điều kiện kích hoạt:** Khi làm việc với các dịch vụ trong `src/services/excel-split/`, `src/services/excel-merge/`, trang `/tao-tep` hoặc `/bam-gio`.

## B. Quy trình thực hiện & Cấu trúc bảng chuẩn Hướng dẫn 07-HD/BTCTW

### 1. Thứ tự 12 bước nhập và liên kết dữ liệu chuẩn
1. `6. C1_VTVL` (Danh mục VTVL & Quỹ giờ chuẩn PP2 = `1.904 giờ/năm` theo chế độ 40h/tuần hoặc giờ riêng theo chế độ `Đặc thù` của Giảng viên/NCV).
2. `1. A1_NhiemVu` (Danh mục nhiệm vụ từ chức năng, nhiệm vụ được giao).
3. `2. A2_CongViec` (Phân rã nhiệm vụ thành công việc, sản phẩm đầu ra, đơn vị tính và gắn `Mã VTVL`).
4. `11. DM_SAN_PHAM` (Danh mục sản phẩm chuẩn phân nhóm `I–VI` và định mức phút/SP chuẩn nếu có).
5. `3. B1_KhoiLuong` (Thống kê sản lượng kỳ `01/10/2025–30/9/2026`, đo thời gian thực tế, tra cứu định mức chuẩn, tự tính `Giờ SP (tính)` và `Giờ tổng (tính)`).
6. `4. B2_CT_TacDong` (Chi tiết tác động của `Số hóa`, `Cải tiến quy trình`, `Thuê dịch vụ/đặt hàng`, `Tự chủ`, `Xã hội hóa`, `Công việc mới phát sinh`).
7. `5. B2_ThayDoi` (Bảng tự động tổng hợp từ `B2_CT_TacDong`, tính `Giờ tác động ròng`).
8. `7. C2_NangLuc` (Bản mô tả VTVL và khung năng lực).
9. `9. D1_NhanLuc` (Nhân lực hiện có chốt tại `30/9/2026`, kiểm soát không trùng mã nguồn lực và không vượt quỹ giờ).
10. `8. C3_NhuCau` (Xác định nhu cầu nhân lực theo `PP1`, `PP2`, `PP3` hoặc kết hợp `PP1+PP2`, `PP2+PP3`, `PP1+PP2+PP3`).
11. `DU_BAO_5_NAM` (Dự báo thay đổi khối lượng công việc giai đoạn `2027–2031`).
12. `10. D2_PhuongAn` (Phương án biên chế từng năm `2027–2031`).

### 2. Danh mục 21 Sheet trong tệp đơn vị `[MÃ_ĐV]_K2526_v1_YYYYMMDD.xlsx`
- `HUONG_DAN`, `HD_DIEN_BIEU`
- `1. A1_NhiemVu` (7 cột A–G)
- `2. A2_CongViec` (8 cột A–H)
- `3. B1_KhoiLuong` (19 cột A–S)
- `4. B2_CT_TacDong` (19 cột A–S)
- `5. B2_ThayDoi` (9 cột A–I)
- `6. C1_VTVL` (11 cột A–K)
- `7. C2_NangLuc` (7 cột A–G)
- `8. C3_NhuCau` (14 cột A–N)
- `9. D1_NhanLuc` (11 cột A–K)
- `10. D2_PhuongAn` (14 cột A–N)
- `11. DM_SAN_PHAM` (10 cột A–J)
- `12. CHIA_VUNG_CAP_XA` (Tham chiếu)
- `13. K_KiemTra` (Kiểm tra chéo tự động 6 chỉ tiêu H3:H8)
- `14. T_TienDo` (Theo dõi tiến độ hoàn thành)
- `15. S_NhatKy` (Nhật ký phiên bản `Kỳ | Biểu | Mã | Trường | Giá trị cũ | Giá trị mới | Nguồn | Người xác nhận | Ngày | Phiên bản`)
- `DM_06_NHOM`, `QUY_TAC_MA`, `THAO_TAC_NHANH`, `DM_THAM_SO`, `DU_BAO_5_NAM`

## C. Quy tắc kiểm tra
- Kiểm tra mọi dòng dữ liệu bắt đầu từ **dòng 3** (dòng 1 là tiêu đề biểu, dòng 2 là tiêu đề cột chuẩn).
- Kiểm tra việc thay thế hoàn toàn tiền tố mẫu `XXX` bằng mã đơn vị HCM-UTE (`FME`, `FIT`, `TCNS`, `BMC`...).
- Kiểm tra khi tách phiếu riêng từng vị trí (`.zip`): chỉ chứa công việc của vị trí đó, không đính kèm `D1_NhanLuc` để tránh nhân sự kiêm nhiệm bị tính hai lần.

## D. Giới hạn
- Tuyệt đối không gửi bất kỳ tệp `.xlsx` hoặc dữ liệu đơn vị nào ra ngoài trình duyệt (100% xử lý cục bộ trên bộ nhớ trình duyệt).
