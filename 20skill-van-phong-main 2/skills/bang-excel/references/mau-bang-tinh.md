# Mẫu bảng tính thường gặp ở văn phòng Việt Nam

> Mọi tỷ lệ, mức tiền dưới đây là **giá trị tham khảo để điền sheet Tham_so** và phải được kế toán xác nhận theo văn bản hiện hành.

## 1. Sheet Tham_so (gợi ý)

| Tham số | Giá trị tham khảo | Ghi chú |
|---|---|---|
| BHXH – NLĐ đóng | 8% | Quỹ hưu trí, tử tuất |
| BHYT – NLĐ | 1,5% | |
| BHTN – NLĐ | 1% | |
| Tổng NLĐ đóng | 10,5% | |
| BHXH – DN đóng | 17,5% | gồm 14% hưu trí-tử tuất, 3% ốm đau-thai sản, 0,5% TNLĐ-BNN (mức 0,3% nếu đủ điều kiện) |
| BHYT – DN | 3% | |
| BHTN – DN | 1% | |
| Tổng DN đóng | 21,5% | |
| Trần lương đóng BHXH, BHYT | 20 × mức tham chiếu/lương cơ sở | Kiểm tra mức hiện hành |
| Trần lương đóng BHTN | 20 × lương tối thiểu vùng | |
| Lương tối thiểu vùng I–IV | [nhập theo nghị định hiện hành] | Không tự điền nếu chưa xác nhận |
| Giảm trừ bản thân | [nhập] | Theo nghị quyết của UBTVQH hiện hành |
| Giảm trừ mỗi người phụ thuộc | [nhập] | |
| Biểu thuế lũy tiến từng phần | [nhập bảng bậc – thuế suất] | Biểu thuế có thể thay đổi theo Luật Thuế TNCN sửa đổi – kiểm tra |

## 2. Bảng lương tháng – cột gợi ý

| Cột | Công thức gợi ý |
|---|---|
| Mã NV, Họ tên, Bộ phận, Chức vụ | Nhập (Mã NV dạng Text) |
| Lương cơ bản (LCB) | Nhập |
| Phụ cấp (ăn trưa, xăng xe, điện thoại...) | Nhập; tách cột chịu thuế / không chịu thuế |
| Ngày công chuẩn | `=NETWORKDAYS.INTL(đầu_tháng; cuối_tháng; "0000011"; ds_ngày_lễ)` (nghỉ T7, CN) hoặc "0000001" (chỉ nghỉ CN) |
| Ngày công thực tế | Lấy từ sheet chấm công: `=COUNTIFS(...)` |
| Lương theo công | `=ROUND(LCB/Ngày_công_chuẩn*Ngày_công_TT;0)` |
| Lương làm thêm | Giờ OT × đơn giá × 150% (ngày thường) / 200% (nghỉ tuần) / 300% (lễ) – Điều 98 BLLĐ |
| Tổng thu nhập | Tổng các khoản |
| Lương đóng BH | `=MIN(Lương_đóng_BH; Trần)` |
| BHXH, BHYT, BHTN NLĐ | `=ROUND(Lương_đóng_BH*Tham_so!tỷ_lệ;0)` |
| Số người phụ thuộc | Nhập |
| Thu nhập tính thuế (TNTT) | `=MAX(0; Thu_nhập_chịu_thuế − BH_NLĐ − GT_bản_thân − GT_NPT*Số_NPT)` |
| Thuế TNCN | Lũy tiến: dùng SUMPRODUCT trên bảng bậc thuế (xem dưới) |
| Tạm ứng | Nhập |
| Thực lĩnh | `=Tổng_thu_nhập − BH_NLĐ − Thuế − Tạm_ứng` |
| Bằng chữ (nếu in phiếu lương) | Sinh bằng `doc_so.py` khi xuất file |

**Thuế lũy tiến bằng 1 công thức** (bảng bậc ở Tham_so: cột Ngưỡng_dưới (B), Thuế_suất (C), cột D = chênh lệch thuế suất so với bậc trước):

```
=SUMPRODUCT((TNTT>Tham_so!$B$2:$B$8)*(TNTT-Tham_so!$B$2:$B$8)*Tham_so!$D$2:$D$8)
```
Số bậc thay đổi thì sửa vùng tham chiếu cho khớp.

## 3. Chấm công

Sheet dạng: Mã NV | Họ tên | 1 | 2 | ... | 31 | Tổng công | Nghỉ phép | Nghỉ không lương.
Ký hiệu: `X` = đi làm, `P` = phép, `L` = lễ, `KL` = không lương, `1/2` = nửa ngày.
Tổng công: `=COUNTIF(C5:AG5;"X")+COUNTIF(C5:AG5;"1/2")*0,5`.
Tô màu T7/CN bằng Conditional Formatting: `=WEEKDAY(C$4;2)>5`.

## 4. Theo dõi công nợ khách hàng

Cột: Ngày HĐ | Số hóa đơn | Khách hàng | MST | Giá trị | Hạn TT | Đã thu | Còn nợ `=Giá_trị−Đã_thu` | Số ngày quá hạn `=MAX(0;TODAY()−Hạn_TT)` | Nhóm tuổi nợ `=IFS(Quá_hạn=0;"Trong hạn";Quá_hạn<=30;"1-30";Quá_hạn<=60;"31-60";TRUE;">60")`.
Tổng hợp theo khách: PivotTable hoặc `=SUMIFS(Còn_nợ;Khách_hàng;tên)`.

## 5. Tồn kho đơn giản

Sheet Nhap, Xuat (Ngày | Mã hàng | SL | Đơn giá), sheet Ton:
Tồn = Tồn đầu + `SUMIFS(Nhap!SL;Nhap!Mã;mã)` − `SUMIFS(Xuat!SL;Xuat!Mã;mã)`.
Cảnh báo tồn thấp: Conditional Formatting khi Tồn < Tồn tối thiểu.
