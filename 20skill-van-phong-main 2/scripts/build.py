#!/usr/bin/env python3
"""Đồng bộ tài liệu dùng chung, sinh bản ChatGPT và đóng gói zip.

Chạy từ thư mục gốc repo:  python3 scripts/build.py

1. Chép shared/*.md vào skills/<skill>/references/ (mỗi skill tự đủ, cài riêng lẻ được)
2. Chép shared/scripts/doc_so.py vào các skill cần đọc số thành chữ
3. Sinh chatgpt/<skill>.md: hướng dẫn dán vào Custom GPT / Project
4. Đóng gói dist/<skill>.zip (upload lên claude.ai) và dist/tat-ca-skill.zip
5. Sinh .claude-plugin/marketplace.json (cài bằng /plugin trong Claude Code)
"""
import re
import shutil
import zipfile
from pathlib import Path

GOC = Path(__file__).resolve().parent.parent
SKILLS = GOC / "skills"
SHARED = GOC / "shared"

CAN_THE_THUC = {"cong-van", "quyet-dinh", "to-trinh", "thong-bao", "bien-ban", "bao-cao", "ke-hoach"}
CAN_DOC_SO = {"tro-ly-bao-gia", "tro-ly-hop-dong", "to-trinh", "bang-excel"}
GIOI_HAN_GPT = 8000  # ký tự tối đa ô Instructions của Custom GPT


def dong_bo():
    for sk in sorted(p for p in SKILLS.iterdir() if p.is_dir()):
        ref = sk / "references"
        ref.mkdir(exist_ok=True)
        shutil.copy(SHARED / "nguyen-tac-chung.md", ref)
        if sk.name in CAN_THE_THUC:
            shutil.copy(SHARED / "the-thuc-nd30.md", ref)
        if sk.name in CAN_DOC_SO:
            (sk / "scripts").mkdir(exist_ok=True)
            shutil.copy(SHARED / "scripts" / "doc_so.py", sk / "scripts")


def tach_frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    meta = dict(re.findall(r"^(\w+):\s*(.*)$", m.group(1), re.M))
    return meta, m.group(2).strip()


def sinh_chatgpt():
    out = GOC / "chatgpt"
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir()
    bao_cao = []
    for sk in sorted(p for p in SKILLS.iterdir() if p.is_dir()):
        meta, body = tach_frontmatter((sk / "SKILL.md").read_text(encoding="utf-8"))
        # Trong ChatGPT, file references được tải lên mục Knowledge
        body = body.replace("references/", "file Knowledge ").replace("scripts/", "")
        huong_dan = (
            "Bạn là trợ lý văn phòng cho người dùng Việt Nam. Luôn trả lời bằng tiếng Việt có dấu.\n"
            "Các file nhắc tới (nguyen-tac-chung.md, ...) đã được tải lên mục Knowledge; hãy đọc chúng khi cần.\n\n"
            + body
        )
        files = sorted(f.name for f in (sk / "references").glob("*.md"))
        scripts = sorted(f.name for f in (sk / "scripts").glob("*")) if (sk / "scripts").exists() else []
        noi_dung = [
            f"# {sk.name} – bản dùng cho ChatGPT",
            "",
            f"**Mô tả:** {meta.get('description', '')}",
            "",
            "## Cách cài",
            "1. ChatGPT → Explore GPTs → Create → tab Configure (hoặc tạo Project và mở Project instructions).",
            f"2. Name: `{sk.name}`. Description: copy dòng Mô tả ở trên.",
            "3. Dán toàn bộ khối **Instructions** bên dưới vào ô Instructions.",
            "4. Knowledge: tải lên các file " + ", ".join(f"`skills/{sk.name}/references/{f}`" for f in files) + ".",
        ]
        if scripts:
            noi_dung.append("5. Bật **Code Interpreter & Data Analysis** và tải thêm " +
                            ", ".join(f"`skills/{sk.name}/scripts/{s}`" for s in scripts) + " vào Knowledge.")
        noi_dung += ["", "## Instructions", "", "````markdown", huong_dan, "````", ""]
        (out / f"{sk.name}.md").write_text("\n".join(noi_dung), encoding="utf-8")
        if len(huong_dan) > GIOI_HAN_GPT:
            bao_cao.append(f"  ! {sk.name}: Instructions {len(huong_dan)} ký tự > {GIOI_HAN_GPT}")
    return bao_cao


def dong_goi():
    dist = GOC / "dist"
    shutil.rmtree(dist, ignore_errors=True)
    dist.mkdir()
    with zipfile.ZipFile(dist / "tat-ca-skill.zip", "w", zipfile.ZIP_DEFLATED) as tat_ca:
        for sk in sorted(p for p in SKILLS.iterdir() if p.is_dir()):
            with zipfile.ZipFile(dist / f"{sk.name}.zip", "w", zipfile.ZIP_DEFLATED) as z:
                for f in sorted(sk.rglob("*")):
                    if f.is_file() and "__pycache__" not in f.parts:
                        z.write(f, f.relative_to(SKILLS))
                        tat_ca.write(f, f.relative_to(SKILLS))


def sinh_marketplace():
    """Sinh .claude-plugin/marketplace.json: mỗi skill là 1 plugin + 1 gói cài cả bộ."""
    import json
    plugins = []
    for sk in sorted(p for p in SKILLS.iterdir() if p.is_dir()):
        meta, _ = tach_frontmatter((sk / "SKILL.md").read_text(encoding="utf-8"))
        plugins.append({
            "name": sk.name,
            "source": f"./skills/{sk.name}",
            "description": meta["description"],
            "category": "van-phong",
        })
    plugins.append({
        "name": "tron-bo-20-skill",
        "source": "./",
        "description": "Cài cả 20 skill văn phòng – kinh doanh Việt Nam trong một lần.",
        "category": "van-phong",
    })
    data = {
        "name": "20skill-van-phong",
        "description": "20 skill AI văn phòng – kinh doanh cho thị trường Việt Nam: hợp đồng, báo giá, "
                       "công văn, quyết định, tờ trình, biên bản, Excel, PDF, content bán hàng...",
        "owner": {"name": "nguyenvansuai", "url": "https://github.com/nguyenvansuai"},
        "plugins": plugins,
    }
    out = GOC / ".claude-plugin"
    out.mkdir(exist_ok=True)
    (out / "marketplace.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def kiem_tra():
    loi = []
    for sk in sorted(p for p in SKILLS.iterdir() if p.is_dir()):
        meta, body = tach_frontmatter((sk / "SKILL.md").read_text(encoding="utf-8"))
        if meta.get("name") != sk.name:
            loi.append(f"{sk.name}: name trong frontmatter không khớp tên thư mục")
        if not 50 < len(meta.get("description", "")) <= 1024:
            loi.append(f"{sk.name}: description dài {len(meta.get('description', ''))} ký tự (cần ≤ 1024)")
        for ref in re.findall(r"`(references/[\w./-]+|scripts/[\w./-]+)`", body):
            if not (sk / ref).exists():
                loi.append(f"{sk.name}: thiếu file {ref}")
    return loi


if __name__ == "__main__":
    dong_bo()
    canh_bao = sinh_chatgpt()
    sinh_marketplace()
    loi = kiem_tra()
    dong_goi()
    n = len([p for p in SKILLS.iterdir() if p.is_dir()])
    print(f"Đã build {n} skill.")
    for c in canh_bao:
        print(c)
    if loi:
        print("LỖI:")
        print("\n".join("  - " + l for l in loi))
        raise SystemExit(1)
