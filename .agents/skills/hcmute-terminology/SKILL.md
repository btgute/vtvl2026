---
name: hcmute-terminology
description: Chuẩn hóa tên gọi chính thức của Trường Đại học Công nghệ Kỹ thuật TP.HCM (HCM-UTE), danh mục 51 đơn vị, danh mục Vị trí việc làm theo Nghị định số 232/2026/NĐ-CP (Phụ lục I, II, III — Bậc nghề nghiệp 1–5) và chức danh/xếp lương nhà giáo theo Thông tư số 31/2026/TT-BGDĐT ngày 14/4/2026.
---

# Skill: Chuẩn hóa thuật ngữ HCM-UTE, VTVL Nghị định 232/2026/NĐ-CP và chức danh nhà giáo Thông tư 31/2026/TT-BGDĐT

## A. Thông tin Skill

- **Tên Skill:** `hcmute-terminology`
- **Mô tả chức năng:** Cung cấp bộ từ điển chuẩn hóa chính thức của **HCM-UTE** (Song ngữ Việt – Anh), bao gồm tên trường, mã viết tắt của 51 đơn vị thuộc/trực thuộc trường, danh mục Vị trí việc làm viên chức và **Bậc nghề nghiệp (Bậc 1 đến Bậc 5)** theo **Nghị định số 232/2026/NĐ-CP** (Phụ lục I, Phụ lục II, Phụ lục III), cùng danh mục mã số chức danh, xếp lương nhà giáo theo **Thông tư số 31/2026/TT-BGDĐT ngày 14/4/2026**.
- **Mục tiêu sử dụng:** Đảm bảo 100% văn bản, mã vị trí việc làm, bậc nghề nghiệp, tên chức danh nhà giáo, hệ số lương và căn cứ pháp lý tuân thủ đúng quy định hiện hành năm 2026.
- **Điều kiện kích hoạt:** Kích hoạt khi khởi tạo hoặc cập nhật danh mục đơn vị, vị trí việc làm hoặc chức danh nhà giáo trong `src/configs/`, tạo tệp mẫu Excel, hiển thị trên giao diện hoặc biên soạn tài liệu hướng dẫn.

## B. Danh mục Vị trí việc làm và Bậc nghề nghiệp theo Nghị định số 232/2026/NĐ-CP

1. **Vị trí việc làm lãnh đạo, quản lý (Phụ lục I — Nghị định 232/2026/NĐ-CP):**
   - Hiệu trưởng, Giám đốc, Viện trưởng và tương đương.
   - Phó Hiệu trưởng, Phó Giám đốc, Phó Viện trưởng và tương đương.
   - Lãnh đạo cấp phòng, ban, khoa, viện trực thuộc trường đại học và các tổ chức tương đương.
2. **Vị trí việc làm chuyên môn, nghiệp vụ trong trường đại học (Phụ lục II — Nghị định 232/2026/NĐ-CP):**
   - **Giảng viên cao cấp (bao gồm Giáo sư, Phó giáo sư):** Áp dụng bậc nghề nghiệp **Bậc 5** (`V.07.01.01` — `A3.1: 6,20 – 8,00`).
   - **Giảng viên chính:** Áp dụng bậc nghề nghiệp **Bậc 4** (`V.07.01.02` — `A2.1: 4,40 – 6,78`).
   - **Giảng viên:** Áp dụng bậc nghề nghiệp **từ Bậc 3** (`V.07.01.03` — `A1: 2,34 – 4,98`).
   - **Trợ giảng** & **Nhân sự hỗ trợ giảng dạy:** Áp dụng bậc nghề nghiệp **từ Bậc 3 đến Bậc 4**.
   - **Quản lý đào tạo, bồi dưỡng**, **Quản lý học sinh, sinh viên**, **Tư vấn học sinh, sinh viên**, **Kết nối doanh nghiệp:** Áp dụng bậc nghề nghiệp **từ Bậc 3 đến Bậc 4**.
   - **Hỗ trợ tổ chức hoạt động giáo dục**, **Thiết bị, thí nghiệm**, **Giáo vụ:** Áp dụng bậc nghề nghiệp **từ Bậc 2 đến Bậc 3**.
3. **Vị trí việc làm hỗ trợ, phục vụ / dùng chung (Phụ lục III — Nghị định 232/2026/NĐ-CP):**
   - **Hành chính - Tổng hợp**, **Truyền thông:** **Bậc 2 đến Bậc 4**.
   - **Tài chính, Kế toán, Kế toán trưởng**, **Ứng dụng công nghệ thông tin và chuyển đổi số:** **Bậc 1 đến Bậc 5** (tùy vị trí).
   - **Văn thư, Lưu trữ:** **Bậc 1 đến Bậc 4**.
   - **Thủ quỹ**, **Y tế trường học:** **Bậc 1 đến Bậc 3**.
   - **Pháp chế**, **Tổ chức cán bộ, thi đua khen thưởng**, **Hợp tác, hội nhập quốc tế:** **Bậc 3 đến Bậc 5**.

## C. Quy chuẩn chức danh nhà giáo theo Thông tư số 31/2026/TT-BGDĐT

1. **Chức danh giảng viên đại học (Khoản 9 Điều 2 & Điều 14 TT 31/2026/TT-BGDĐT):**
   - **Giảng viên cao cấp** (`V.07.01.01` — `A3.1: 6,20 – 8,00`), **Giảng viên chính** (`V.07.01.02` — `A2.1: 4,40 – 6,78`), **Giảng viên** (`V.07.01.03` — `A1: 2,34 – 4,98`).
2. **Điều khoản chuyển tiếp đối với chức danh Trợ giảng (`V.07.01.23` — Khoản 5 Điều 15 TT 31/2026/TT-BGDĐT):**
   - Viên chức đã bổ nhiệm Trợ giảng trước `31/3/2026` nếu đáp ứng chuẩn nghề nghiệp Giảng viên (`V.07.01.03`) thì Hiệu trưởng xem xét bổ nhiệm vào chức danh **Giảng viên (`V.07.01.03`)**; nếu chưa đáp ứng thì tiếp tục giữ mã số hiện giữ theo diện chuyển tiếp.
3. **Căn cứ pháp lý thay thế (Khoản 2 Điều 17 TT 31/2026/TT-BGDĐT):**
   - Không dẫn chiếu các Điều 2, 8, 9, 10 của `Thông tư 40/2020/TT-BGDĐT` (đã hết hiệu lực). Bắt buộc dẫn chiếu **Nghị định số 232/2026/NĐ-CP, Thông tư số 31/2026/TT-BGDĐT ngày 14/4/2026, Nghị định số 93/2026/NĐ-CP ngày 31/3/2026 và Luật Nhà giáo số 73/2025/QH15**.
