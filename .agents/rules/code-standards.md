---
trigger: always_on
description: Quy chuẩn kiến trúc mã nguồn, giới hạn 300 dòng/tệp và quy trình kiểm soát chất lượng.
---

# Tiêu chuẩn kiến trúc và mã nguồn

1. **Nguyên lý thiết kế:**
   - Áp dụng **DRY**, **KISS**, **Separation of Concerns** và **Single Responsibility**.
   - Tách biệt hoàn toàn tầng xử lý dữ liệu Excel (`src/services/`) và tầng hiển thị giao diện (`src/components/`, `src/app/`).
2. **Giới hạn độ dài tệp:**
   - Không tạo bất kỳ tệp mã nguồn nào vượt quá **300 dòng**. Khi logic phức tạp, phải tách thành các module nhỏ theo chức năng.
3. **Xử lý lỗi an toàn:**
   - Mọi thao tác đọc/ghi tệp `.xlsx`, `.zip` trên trình duyệt phải bọc trong `try/catch` và trả về thông báo tiếng Việt rõ ràng, dễ hiểu cho người dùng đơn vị.

