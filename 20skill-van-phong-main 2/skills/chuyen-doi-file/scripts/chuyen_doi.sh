#!/usr/bin/env bash
# Chuyển đổi định dạng file văn phòng bằng LibreOffice (miễn phí).
# Dùng: ./chuyen_doi.sh <định dạng đích> <file1> [file2 ...]
#   ./chuyen_doi.sh pdf  hop-dong.docx           Word -> PDF
#   ./chuyen_doi.sh docx cong-van.doc            .doc cũ -> .docx
#   ./chuyen_doi.sh xlsx bao-cao.xls             .xls cũ -> .xlsx
#   ./chuyen_doi.sh pdf  *.pptx                  Hàng loạt PowerPoint -> PDF
#   ./chuyen_doi.sh docx scan.pdf                PDF có lớp chữ -> Word (bố cục có thể lệch)
# File kết quả nằm trong thư mục ./da-chuyen/
set -euo pipefail

if [ $# -lt 2 ]; then sed -n '2,10p' "$0"; exit 1; fi

DICH="$1"; shift
SOFFICE="$(command -v soffice || command -v libreoffice || true)"
if [ -z "$SOFFICE" ]; then
  echo "Chưa cài LibreOffice. Ubuntu: sudo apt install libreoffice | macOS: brew install --cask libreoffice"
  exit 1
fi

mkdir -p da-chuyen
for f in "$@"; do
  case "${f,,}" in
    *.pdf)
      # PDF -> Word cần bộ lọc nhập PDF của Writer
      "$SOFFICE" --headless --infilter="writer_pdf_import" --convert-to "$DICH" --outdir da-chuyen "$f" ;;
    *)
      "$SOFFICE" --headless --convert-to "$DICH" --outdir da-chuyen "$f" ;;
  esac
done
echo "Xong. Kết quả trong ./da-chuyen/"
