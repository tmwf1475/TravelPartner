# TravelPartner — Oracle Cloud Always Free 部署手冊

目標：把 TravelPartner backend + frontend 部署到 Oracle Cloud Always Free VM，SQLite 持久化存在 VPS 磁碟上。

---

## 架構

```
Internet
    │
    ▼ :80
  Nginx  (反向代理)
  ├── /api/*   → backend:3000
  ├── /health  → backend:3000
  └── /*       → frontend:4173

backend (Express + Gemini + SQLite)
  └── ./data/travelpartner.sqlite  (掛載到主機磁碟)

frontend (Vite preview)
```

---

## Step 1 — 申請 Oracle Cloud Always Free

1. 開 https://www.oracle.com/cloud/free/
2. 建立帳號（需要信用卡驗證，但不會扣款）
3. 登入後進 Console

---

## Step 2 — 建立 VM

1. Console → Compute → Instances → Create Instance
2. 設定：
   - Name: `travelpartner`
   - Image: `Ubuntu 22.04 LTS`
   - Shape: `VM.Standard.A1.Flex` (Always Free Arm)
   - CPU: 1 OCPU
   - RAM: 6 GB
3. 下載或貼上你的 SSH public key
4. 按 Create

---

## Step 3 — 開放防火牆

### Oracle Console 設定
1. Compute → Instances → 點進 instance
2. Primary VNIC → Subnet → Security List
3. Add Ingress Rules:

| Protocol | Port | Source |
| --- | --- | --- |
| TCP | 22 | 0.0.0.0/0 |
| TCP | 80 | 0.0.0.0/0 |

### VPS 系統防火牆
SSH 登入後執行：
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 22 -j ACCEPT
sudo netfilter-persistent save
```

---

## Step 4 — SSH 登入

```bash
ssh ubuntu@<YOUR_SERVER_IP>
```

---

## Step 5 — 安裝 Docker 與 Docker Compose

```bash
sudo apt update && sudo apt upgrade -y

# 安裝 Docker
curl -fsSL https://get.docker.com | sudo sh

# 安裝 docker-compose v2 standalone
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64 \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 把自己加入 docker 群組
sudo usermod -aG docker $USER

# 重新載入群組 (或重新登入)
newgrp docker

# 確認
docker --version
docker-compose version
```

> 如果是 x86_64 VM 把 `aarch64` 改成 `x86_64`

---

## Step 6 — 部署 TravelPartner

```bash
# 建立並進入 .env 設定
mkdir -p ~/TravelPartner
nano ~/TravelPartner/.env
```

`.env` 內容：
```env
NODE_ENV=production
PORT=3000
DATABASE_PATH=/app/data/travelpartner.sqlite
GEMINI_API_KEY=你的正式 Gemini API Key
```

儲存後執行部署：
```bash
curl -fsSL https://raw.githubusercontent.com/tmwf1475/TravelPartner/main/deploy.sh | bash
```

或手動：
```bash
git clone https://github.com/tmwf1475/TravelPartner.git ~/TravelPartner
cd ~/TravelPartner
bash deploy.sh
```

---

## Step 7 — 驗證上線

健康檢查：
```bash
curl http://localhost/health
```

預期：
```json
{ "status": "ok", "service": "TravelPartner", "timestamp": "..." }
```

驗證 API：
```bash
curl -X POST http://localhost/api/trips/generate-all \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "東京",
    "days": 3,
    "style": "自由行、美食、動漫",
    "start_date": "2026-08-01"
  }'
```

用回傳的 `trip.id` 查 dashboard：
```bash
curl http://localhost/api/trips/<TRIP_ID>/dashboard
```

打開前端：
```
http://<YOUR_SERVER_IP>
```

---

## Step 8 — 確認 SQLite 持久化

```bash
# 看資料目錄
ls -la ~/TravelPartner/data

# 進 SQLite
sqlite3 ~/TravelPartner/data/travelpartner.sqlite

# 查 trips
SELECT id, destination, days, created_at FROM trips;
.quit
```

重啟後確認資料還在：
```bash
docker-compose -f ~/TravelPartner/docker-compose.yml restart
curl http://localhost/api/trips/<TRIP_ID>/dashboard
```

---

## Step 9 — 更新流程

之後每次推新版本到 GitHub 後，在 VPS 執行：
```bash
cd ~/TravelPartner
bash deploy.sh
```

---

## 常用指令

```bash
# 看狀態
docker-compose ps

# 看 log
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# 重啟
docker-compose restart

# 停止
docker-compose down

# 停止並移除 volume (危險：資料會清掉)
# docker-compose down -v
```

---

## 備份 SQLite

```bash
# 備份到本機
scp ubuntu@<YOUR_SERVER_IP>:~/TravelPartner/data/travelpartner.sqlite ./backup.sqlite

# 或在 VPS 上備份
cp ~/TravelPartner/data/travelpartner.sqlite ~/TravelPartner/data/travelpartner.backup.$(date +%Y%m%d).sqlite
```

---

## 排錯

| 症狀 | 原因 | 解法 |
| --- | --- | --- |
| `GEMINI_API_KEY is required` | `.env` 未設定或未載入 | 確認 `.env` 存在且有 key |
| backend container 起不來 | SQLite 路徑或 port 問題 | `docker-compose logs backend` |
| 前端打 API 失敗 | Nginx proxy 設定 | `docker-compose logs nginx` |
| 資料重啟後不見 | volume 未掛載 | 確認 `docker-compose.yml` volume 設定 |
| port 80 連不到 | Oracle security list 未開 | 重新確認 Ingress Rules |
