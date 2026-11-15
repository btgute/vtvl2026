#!/bin/bash
# =======================================================
# Script Tự Động Build, Khởi Tạo PostgreSQL & Deploy trên VPS
# Hệ thống: HCM-UTE VTVL 360 (ute.vtvl)
# Server VPS: 14.225.254.3 (App: 127.0.0.1:3360, DB: 127.0.0.1:5436)
# =======================================================
set -e

WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$WORK_DIR"

LOCK_PID_FILE="/tmp/utevtvl-deploy.pid"
if [ -f "$LOCK_PID_FILE" ]; then
  OLD_PID=$(cat "$LOCK_PID_FILE" 2>/dev/null || true)
  if [ -n "$OLD_PID" ] && [ "$OLD_PID" != "$$" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "⚠️ Hủy tiến trình deploy cũ đang chạy (PID $OLD_PID) để tránh quá tải CPU/RAM VPS..."
    pkill -TERM -P "$OLD_PID" 2>/dev/null || true
    kill -TERM "$OLD_PID" 2>/dev/null || true
    sleep 2
  fi
fi
echo "$$" > "$LOCK_PID_FILE"
trap 'rm -f "$LOCK_PID_FILE"' EXIT

echo "🚀 [1/6] Đang kéo mã nguồn mới nhất từ nhánh main..."
if [ -d .git ]; then
  git fetch origin main
  git checkout main
  git pull --ff-only origin main
fi

echo "📦 [2/6] Kiểm tra cấu hình môi trường (.env)..."
if [ -f .env.production ]; then
  cp .env.production .env
elif [ ! -f .env ]; then
  GEN_DB_PASS=$(openssl rand -hex 18)
  GEN_ADMIN_SECRET=$(openssl rand -hex 24)
  cat > .env <<EOF
# Tự động khởi tạo lần đầu trên VPS (có thể chỉnh sửa hoặc tạo .env.production)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SERVER_SECRET=${GEN_ADMIN_SECRET}

POSTGRES_USER=utevtvl_admin
POSTGRES_PASSWORD=${GEN_DB_PASS}
POSTGRES_DB=utevtvl_db
DATABASE_URL=postgresql://utevtvl_admin:${GEN_DB_PASS}@postgres:5432/utevtvl_db?schema=public
EOF
  chmod 600 .env
  echo "✓ Đã khởi tạo tệp .env mặc định với mật khẩu PostgreSQL riêng biệt."
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

# ==============================================================================
# KHÓA BẢO VỆ AN TOÀN CƠ SỞ DỮ LIỆU (DATABASE SAFETY GUARD)
# ==============================================================================
if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ LỖI: DATABASE_URL không tồn tại trong .env! Hủy deploy để bảo vệ dữ liệu."
  exit 1
fi

if [[ "$DATABASE_URL" != *"utevtvl_db"* ]]; then
  echo "❌ CẢNH BÁO BẢO MẬT: DATABASE_URL không trỏ vào cơ sở dữ liệu utevtvl_db!"
  echo "❌ ĐÃ DỪNG DEPLOY NGAY LẬP TỨC ĐỂ TRÁNH GHI ĐÈ CƠ SỞ DỮ LIỆU DỰ ÁN KHÁC!"
  exit 1
fi

if [[ "$DATABASE_URL" == *"uteform_db"* ]] || [[ "$DATABASE_URL" == *"uteframe_db"* ]] || [[ "$DATABASE_URL" == *"neondb"* ]] || [[ "$DATABASE_URL" == *"uteshort"* ]]; then
  echo "❌ CẢNH BÁO NGUY HIỂM: Phát hiện chuỗi kết nối chứa DB hệ thống khác! DỪNG NGAY LẬP TỨC!"
  exit 1
fi

echo "🛡️ Database safety check: HỢP LỆ (utevtvl_db)."

echo "🏗️ [3/6] Build & khởi chạy containers (utevtvl-postgres, utevtvl-app)..."
if docker compose version &>/dev/null; then
  docker compose up -d --build --remove-orphans
elif command -v docker-compose &>/dev/null; then
  docker-compose up -d --build --remove-orphans
else
  echo "❌ Không tìm thấy docker compose!"
  exit 1
fi

echo "🗄️ [4/6] Đồng bộ lược đồ PostgreSQL từ supabase/migrations/..."
PG_USER="${POSTGRES_USER:-utevtvl_admin}"
PG_DB="${POSTGRES_DB:-utevtvl_db}"

for _ in {1..15}; do
  if docker exec utevtvl-postgres pg_isready -U "$PG_USER" -d "$PG_DB" &>/dev/null; then
    break
  fi
  sleep 2
done

if [ -f "deploy/postgres/00-supabase-compat.sql" ]; then
  docker exec -i utevtvl-postgres psql -v ON_ERROR_STOP=1 -U "$PG_USER" -d "$PG_DB" < deploy/postgres/00-supabase-compat.sql >/dev/null
fi

TABLE_COUNT=$(docker exec utevtvl-postgres psql -U "$PG_USER" -d "$PG_DB" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null || echo "0")
if [ "${TABLE_COUNT:-0}" -lt 25 ]; then
  echo "📥 Khởi tạo các bảng quan hệ VTVL 360 từ supabase/migrations/..."
  ORDERED_MIGRATIONS=(
    "supabase/migrations/20261107_init_vtvl_hcmute.sql"
    "supabase/migrations/20261110_vtvl_server_workbooks.sql"
    "supabase/migrations/20261110_lockdown_supabase_rls.sql"
    "supabase/migrations/20261113_google_auth_rls_and_indexes.sql"
    "supabase/migrations/20261113_user_accounts_and_roles.sql"
  )
  for sql_file in "${ORDERED_MIGRATIONS[@]}"; do
    if [ -f "$sql_file" ]; then
      echo "   → Áp dụng $sql_file"
      docker exec -i utevtvl-postgres psql -v ON_ERROR_STOP=1 -U "$PG_USER" -d "$PG_DB" < "$sql_file" >/dev/null
    fi
  done
  for sql_file in $(ls -1 supabase/migrations/*.sql 2>/dev/null | sort); do
    case " ${ORDERED_MIGRATIONS[*]} " in
      *" $sql_file "*) ;;
      *)
        echo "   → Áp dụng bổ sung $sql_file"
        docker exec -i utevtvl-postgres psql -v ON_ERROR_STOP=1 -U "$PG_USER" -d "$PG_DB" < "$sql_file" >/dev/null
        ;;
    esac
  done
else
  echo "✓ Cơ sở dữ liệu $PG_DB đã có $TABLE_COUNT bảng hoạt động."
fi

echo "🩺 [5/6] Kiểm tra phản hồi HTTP máy chủ ứng dụng (127.0.0.1:3360)..."
HTTP_STATUS="000"
for _ in {1..15}; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3360/ || echo "000")
  if [ "$HTTP_STATUS" = "200" ]; then
    break
  fi
  sleep 2
done
echo "✓ HTTP Status trên cổng 3360: $HTTP_STATUS"
if [ "$HTTP_STATUS" != "200" ]; then
  echo "❌ Ứng dụng chưa phản hồi HTTP 200. Kiểm tra nhật ký: docker logs utevtvl-app --tail 50"
  exit 1
fi

git rev-parse HEAD > .deployed_sha 2>/dev/null || true

echo "🧹 [6/6] Dọn dẹp Docker image & bộ nhớ đệm cũ để tiết kiệm đĩa cứng..."
docker image prune -f >/dev/null 2>&1 || true
docker builder prune -f --keep-storage 512MB >/dev/null 2>&1 || true

echo "✅ Deploy HCM-UTE VTVL 360 hoàn tất thành công!"
