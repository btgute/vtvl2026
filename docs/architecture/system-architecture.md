# Kiến trúc hệ thống Vị trí việc làm 360 — HCM-UTE (Chuẩn Hướng dẫn số 07-HD/BTCTW)

## 1. Bảo mật dữ liệu nội bộ (Zero Network Exposure)
- Toàn bộ tài liệu hướng dẫn gốc (`Tai lieu huong dan kem theo Huong dan so 07-HDVTVL/`) và kho kỹ năng (`20skill-van-phong-main/`) đã được khóa trong `.gitignore`, tuyệt đối không đẩy lên bất kỳ máy chủ hay kho lưu trữ từ xa nào.
- Mọi thao tác tách bộ biểu `.xlsx`, tạo gói `.zip`, đo bấm giờ, gộp phiếu và rà soát đều xử lý **100% cục bộ trên bộ nhớ trình duyệt (client-side)** bằng `xlsx` và `jszip`.

## 2. Cấu trúc bộ biểu chuẩn 21 Sheet (Theo `03. Bo bieu VTVL 25-10-2026.xlsx`)
Tệp đơn vị `[MÃ_ĐV]_K2526_v1_YYYYMMDD.xlsx` được khởi tạo gồm đúng 21 trang tính:
1. `HUONG_DAN` & `HD_DIEN_BIEU` (Thứ tự 12 bước nhập bảng; kỳ thống kê `01/10/2025–30/9/2026`; thời điểm chốt nhân lực `30/9/2026`; quỹ giờ chuẩn PP2 = `1.904 giờ/người/năm`; chế độ đặc thù Giảng viên/NCV = `1.760 giờ/người/năm`).
2. `1. A1_NhiemVu` (7 cột A–G)
3. `2. A2_CongViec` (8 cột A–H)
4. `3. B1_KhoiLuong` (19 cột A–S — tự động tra cứu `11. DM_SAN_PHAM`, tính `Giờ SP (tính)`, `Giờ tổng (tính)` và `Cảnh báo dữ liệu` ở cột R)
5. `4. B2_CT_TacDong` (19 cột A–S — chi tiết tác động số hóa, cải tiến quy trình, thuê dịch vụ, tự chủ, xã hội hóa)
6. `5. B2_ThayDoi` (9 cột A–I — tổng hợp giờ tác động ròng từ `B2_CT_TacDong`)
7. `6. C1_VTVL` (11 cột A–K — danh mục VTVL và kiểm tra quỹ giờ chuẩn PP2)
8. `7. C2_NangLuc` (7 cột A–G — bản mô tả công việc và khung năng lực)
9. `8. C3_NhuCau` (14 cột A–N — xác định nhu cầu nhân lực theo `PP1`, `PP2`, `PP3` và kết hợp)
10. `9. D1_NhanLuc` (11 cột A–K — nhân lực hiện có chốt tại `30/9/2026`)
11. `10. D2_PhuongAn` (14 cột A–N — phương án biên chế giai đoạn `2027–2031`)
12. `11. DM_SAN_PHAM` (10 cột A–J — danh mục sản phẩm chuẩn phân nhóm `I–VI`)
13. `12. CHIA_VUNG_CAP_XA`, `13. K_KiemTra` (6 chỉ tiêu kiểm soát tự động), `14. T_TienDo`, `15. S_NhatKy` (10 cột lịch sử phiên bản), `DM_06_NHOM`, `QUY_TAC_MA`, `DM_THAM_SO`, `DU_BAO_5_NAM`.


## 3. Sơ đồ Thực thể – Liên kết (`erDiagram`) toàn hệ thống

```mermaid
erDiagram
    DON_VI ||--o{ A1_NHIEM_VU : "thuc_hien"
    DON_VI ||--o{ C1_VTVL : "quan_ly"
    DON_VI ||--o{ D1_NHAN_LUC : "chot_nhan_su_30_09_2026"
    DON_VI ||--o{ S_NHAT_KY : "ghi_lich_su"
    DON_VI ||--o{ K_KIEM_TRA : "kiem_soat_cheo"

    DM_VTVL_ND232 ||--o{ C1_VTVL : "chuan_hoa_vi_tri_va_bac_1_5"
    DM_CHUC_DANH_TT31 ||--o{ C1_VTVL : "gan_ma_chuc_danh_va_he_so_luong"
    DM_CHUC_DANH_TT31 ||--o{ D1_NHAN_LUC : "xep_luong_va_chuyen_tiep"

    A1_NHIEM_VU ||--|{ A2_CONG_VIEC : "phan_ra_thanh"
    C1_VTVL ||--o{ A2_CONG_VIEC : "dam_nhiem"
    DM_SAN_PHAM ||--o{ A2_CONG_VIEC : "gan_san_pham_chuan_I_VI"

    A2_CONG_VIEC ||--|| B1_KHOI_LUONG : "thong_ke_san_luong_thoi_gian"
    DM_SAN_PHAM ||--o{ B1_KHOI_LUONG : "doi_chieu_dinh_muc_phut_sp"

    A2_CONG_VIEC ||--o{ B2_CT_TAC_DONG : "ke_khai_so_hoa_tu_chu"
    B1_KHOI_LUONG ||--o{ B2_CT_TAC_DONG : "lam_co_so_tinh_gio_giam"
    A2_CONG_VIEC ||--|| B2_THAY_DOI : "tong_hop_tac_dong_rong"
    B2_CT_TAC_DONG }o--|| B2_THAY_DOI : "cong_don_gio_hop_le"

    C1_VTVL ||--|{ C2_NANG_LUC : "mo_ta_khung_nang_luc"
    C1_VTVL ||--|| C3_NHU_CAU : "xac_dinh_fte_PP1_PP2_PP3"
    B1_KHOI_LUONG }o--|| C3_NHU_CAU : "tong_hop_gio_B1"
    B2_THAY_DOI }o--|| C3_NHU_CAU : "ket_chuyen_gio_tac_dong_B2"

    C1_VTVL ||--o{ D1_NHAN_LUC : "bo_tri_nhan_su_hien_co"
    C1_VTVL ||--|{ DU_BAO_5_NAM : "du_bao_khoi_luong_2027_2031"
    C1_VTVL ||--|{ D2_PHUONG_AN : "lap_phuong_an_bien_che_2027_2031"
    C3_NHU_CAU ||--|{ D2_PHUONG_AN : "lam_nam_co_so_2026"
    DU_BAO_5_NAM ||--|| D2_PHUONG_AN : "dieu_chinh_nhu_cau_theo_nam"
```
