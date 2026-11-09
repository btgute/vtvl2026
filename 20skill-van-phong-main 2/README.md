# 20 Skill AI Văn phòng – Kinh doanh (Việt Nam)

Bộ 20 skill giúp Claude (và ChatGPT) làm việc văn phòng **theo đúng thực tế Việt Nam**: thể thức văn bản theo Nghị định 30/2020/NĐ-CP, hợp đồng theo Bộ luật Dân sự 2015, Luật Thương mại 2005, Bộ luật Lao động 2019; báo giá có VAT và số tiền bằng chữ; content bán hàng có kiểm tra Luật Quảng cáo; địa giới hành chính mới (34 tỉnh, bỏ cấp huyện từ 01/7/2025); sửa lỗi font TCVN3/VNI.

Mọi skill tuân theo cùng nguyên tắc: **không bịa thông tin** (thiếu thì để `[CẦN BỔ SUNG]`), viện dẫn pháp luật luôn kèm lưu ý kiểm tra văn bản hiện hành, chỉ soạn nháp, không tự gửi.

## Danh sách skill

| # | Nhóm | Skill | Lệnh | Làm gì |
|---|---|---|---|---|
| 01 | Nội dung & giao tiếp | Soạn hợp đồng | `/tro-ly-hop-dong` | Soạn mới + rà rủi ro HĐ mua bán, dịch vụ, thuê, lao động, CTV, NDA |
| 02 | Nội dung & giao tiếp | Soạn báo giá | `/tro-ly-bao-gia` | Báo giá có VAT 8%/10%, chiết khấu, số tiền bằng chữ, xuất Excel |
| 17 | Nội dung & giao tiếp | Thông báo | `/thong-bao` | Bản chính thức NĐ 30 + bản ngắn Zalo/email; nghỉ lễ Tết |
| 18 | Nội dung & giao tiếp | Công văn | `/cong-van` | Công văn đề nghị, phúc đáp, đôn đốc, giải trình đúng thể thức |
| 03 | Dữ liệu & tài liệu | Bảng Excel | `/bang-excel` | Bảng lương, BHXH, thuế TNCN, công nợ, tồn kho; làm sạch dữ liệu tiếng Việt |
| 04 | Dữ liệu & tài liệu | Slide PPTX | `/slide-pptx` | Dàn ý theo kiểu thuyết trình + tạo file .pptx có speaker notes |
| 13 | Dữ liệu & tài liệu | Xử lý PDF | `/xu-ly-pdf` | Gộp, tách, trích trang, rút bảng ra Excel, OCR tiếng Việt |
| 14 | Dữ liệu & tài liệu | Chuyển đổi file | `/chuyen-doi-file` | Word/Excel/PPT ↔ PDF, file đời cũ, sửa lỗi font TCVN3/VNI |
| 05 | Sáng tạo & marketing | Prompt Master | `/prompt-master` | Viết lại yêu cầu mơ hồ thành prompt chuẩn |
| 06 | Sáng tạo & marketing | Content bán hàng | `/content-ban-hang` | Facebook, Zalo, TikTok, Shopee; lọc từ vi phạm quảng cáo |
| 08 | Sáng tạo & marketing | Viết như người | `/viet-nhu-nguoi` | Gỡ "giọng AI" tiếng Việt, giữ nguyên dữ kiện |
| 15 | Sáng tạo & marketing | Đề xuất | `/de-xuat` | Đề xuất ngắn gọn, có so sánh phương án, chi phí – lợi ích |
| 07 | Phân tích & tổng hợp | Kiểm tra lỗi AI | `/kiem-tra-loi-ai` | Rà thông tin bịa, luật hết hiệu lực, sai phép tính, chính tả |
| 09 | Phân tích & tổng hợp | Báo cáo | `/bao-cao` | Báo cáo tuần/tháng/quý, sự cố; kết luận trước, có so sánh |
| 11 | Phân tích & tổng hợp | Tóm tắt tài liệu | `/tom-tat-tai-lieu` | Tóm tắt 3 tầng + bảng việc cần làm (ai – hạn) |
| 12 | Phân tích & tổng hợp | Phân tích tài liệu | `/phan-tich-tai-lieu` | Rủi ro, nghĩa vụ, hàm ý thực thi; hồ sơ thầu, văn bản luật mới |
| 10 | Kế hoạch & quản trị | Kế hoạch | `/ke-hoach` | OKR/SMART, phân công, timeline, ngân sách, rủi ro |
| 16 | Kế hoạch & quản trị | Biên bản | `/bien-ban` | Họp, bàn giao, nghiệm thu, thanh lý HĐ, đối chiếu công nợ, sự việc |
| 19 | Kế hoạch & quản trị | Quyết định | `/quyet-dinh` | Bổ nhiệm, khen thưởng, kỷ luật, thành lập, ban hành quy chế |
| 20 | Kế hoạch & quản trị | Tờ trình | `/to-trinh` | Tờ trình xin phê duyệt có căn cứ, dự toán, kiến nghị |

## Cài đặt

### Claude Code – cài qua plugin marketplace (khuyên dùng)

Gõ trong Claude Code. Bước 1 làm một lần:

```
/plugin marketplace add nguyenvansuai/20skill-van-phong
```

Bước 2: cài skill cần dùng, ví dụ chỉ cài Soạn hợp đồng:

```
/plugin install tro-ly-hop-dong@20skill-van-phong
```

Hoặc cài cả 20 skill:

```
/plugin install tron-bo-20-skill@20skill-van-phong
```

Tên để cài chính là cột **Lệnh** trong bảng trên (bỏ dấu `/`). Cập nhật bản mới: `/plugin marketplace update 20skill-van-phong`.

### Claude Code – chép thủ công

```bash
git clone https://github.com/nguyenvansuai/20skill-van-phong.git
```

Cài cho mọi dự án (skill cá nhân):

```bash
mkdir -p ~/.claude/skills && cp -r 20skill-van-phong/skills/* ~/.claude/skills/
```

Hoặc chỉ cho một dự án: chép vào `<dự-án>/.claude/skills/`. Gọi bằng `/cong-van`, `/tro-ly-bao-gia`… hoặc cứ nói tự nhiên ("soạn công văn gửi…"), Claude tự chọn skill.

### Claude.ai (web / app)

1. Bật **Settings → Capabilities → Code execution and file creation**.
2. Vào **Settings → Capabilities → Skills → Upload skill**.
3. Tải lên từng file trong thư mục [`dist/`](dist/) (ví dụ `dist/cong-van.zip`).

### ChatGPT

Mỗi skill có một file hướng dẫn trong [`chatgpt/`](chatgpt/): tạo Custom GPT (hoặc Project), dán phần **Instructions**, tải các file `references/` lên mục **Knowledge**.

## Script đi kèm

| Script | Chức năng |
|---|---|
| `shared/scripts/doc_so.py` | Đọc số tiền thành chữ tiếng Việt (mốt, lăm, linh, không trăm, tỷ) |
| `skills/bang-excel/scripts/lam_sach.py` | Chuẩn hóa Unicode, khoảng trắng, SĐT, MST, email; báo dòng trùng |
| `skills/xu-ly-pdf/scripts/pdf_tool.py` | Gộp, tách, trích, xoay, rút chữ, rút bảng, OCR PDF |
| `skills/chuyen-doi-file/scripts/tcvn3_to_unicode.py` | Chuyển .txt/.docx font TCVN3 (.VnTime) sang Unicode |
| `skills/chuyen-doi-file/scripts/chuyen_doi.sh` | Chuyển đổi hàng loạt bằng LibreOffice |

Thư viện Python: `pip install pypdf pdfplumber openpyxl pandas python-docx python-pptx`.

## Cấu trúc repo

```
skills/<tên-skill>/SKILL.md        # hướng dẫn chính (frontmatter name + description)
skills/<tên-skill>/references/     # mẫu biểu, checklist, tóm tắt quy định
skills/<tên-skill>/scripts/        # script hỗ trợ (nếu có)
shared/                            # nguồn gốc tài liệu dùng chung -> build chép vào từng skill
chatgpt/                           # bản hướng dẫn cho ChatGPT (sinh tự động)
dist/                              # file zip để upload claude.ai (sinh tự động)
.claude-plugin/marketplace.json    # danh mục plugin cho Claude Code (sinh tự động)
scripts/build.py                   # đồng bộ shared, sinh chatgpt/, dist/, marketplace, kiểm tra lỗi
```

Sửa tài liệu dùng chung ở `shared/` rồi chạy:

```bash
python3 scripts/build.py
```

## Lưu ý pháp lý

Các tóm tắt quy định trong bộ skill phản ánh hiểu biết tại thời điểm soạn (2026) và **có thể đã thay đổi**. Mức lương tối thiểu, giảm trừ gia cảnh, thuế suất, biểu thuế TNCN… phải được kế toán/pháp chế kiểm tra theo văn bản hiện hành. Skill không thay thế tư vấn của luật sư, kế toán.

## Ghi nguồn

- Skill `viet-nhu-nguoi` chuyển thể khung quy trình từ [blader/humanizer](https://github.com/blader/humanizer) (MIT License).
- Danh sách 20 skill dựa trên infographic "20 Skill AI Văn phòng – Kinh doanh" lan truyền trên mạng xã hội; nội dung skill được viết mới cho thực tế Việt Nam.

## Giấy phép

MIT – xem [LICENSE](LICENSE).
