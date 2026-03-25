<div align="center">

<img src="png/login.png" alt="JobTracker Pro" width="100%" />

# JobTracker Pro

**A full-cycle job application tracking system**

Visualize every step from application to offer. Stay organized, never miss an interview.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-job.lifebytes.cn-3b82f6?style=for-the-badge)](http://job.lifebytes.cn)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)

**[中文文档](./README.zh-CN.md)**

</div>

---

## 📸 Screenshots

### Dashboard
<img src="png/toudi.png" alt="Dashboard" width="100%" />

> Key metrics, job funnel chart, and upcoming interview reminders — all at a glance.

### Kanban Board
<img src="png/kanban.png" alt="Kanban Board" width="100%" />

> 7-stage agile board with drag & drop. Color-coded columns for instant status recognition.

### Application List
<img src="png/list.png" alt="Application List" width="100%" />

> Full-text search, multi-column sorting, and status filters. Press `Ctrl+K` to search instantly.

### Calendar View
<img src="png/rili.png" alt="Calendar View" width="100%" />

> Monthly calendar showing all interviews and assessments. Click any event to open details.

### Settings
<img src="png/setting.png" alt="Settings" width="100%" />

> Change password, export/import JSON backup, and danger zone.

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 📊 **Dashboard** | Metrics cards, funnel ladder chart, 7-day upcoming reminders |
| 🗂 **Kanban Board** | 7-stage drag & drop board (Wishlist → Offer), color-coded columns |
| 📋 **List View** | Full-text search, sorting, status filter, `Ctrl+K` shortcut |
| 📅 **Calendar** | Monthly view of all interview/assessment events |
| 📝 **Reflection Editor** | Slide-out drawer with Markdown editor for interview notes |
| 🕒 **Timeline** | Per-application event history with timestamps |
| 🔐 **Auth System** | Register / Login / Forgot password, bcrypt + JWT |
| 🌙 **Dark Mode** | One-click light/dark theme toggle |
| 💾 **Data Backup** | Export/import JSON anytime |
| 🐳 **Docker Ready** | Hot-reload in container via volume mounts |

---

## 🛠 Tech Stack

```
Framework     Next.js 16 (App Router) + TypeScript
Styling       Tailwind CSS v4
UI            Radix UI Primitives
State         Zustand
Database      SQLite + Prisma ORM 7
Auth          NextAuth.js v5 Beta
Drag & Drop   @dnd-kit/core + @dnd-kit/sortable
Charts        Recharts
Markdown      react-markdown + remark-gfm
Theme         next-themes
Container     Docker + Docker Compose
```

---

## 🚀 Getting Started

### Local Development

```bash
# Clone the repo
git clone https://github.com/P2hemia/Jobtracker-Pro.git
cd Jobtracker-Pro

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
# Edit .env and fill in NEXTAUTH_SECRET

# Initialize the database
npx prisma db push

# Start dev server
npm run dev
# Open http://localhost:3000
```

### Environment Variables

```env
# Random secret, at least 32 chars (generate: openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-secret-here

# Your app URL
NEXTAUTH_URL=http://localhost:3000

# SQLite database path
DATABASE_URL=file:./prisma/dev.db
```

---

## 🐳 Docker Deployment

### 1. Clone & Configure

```bash
git clone https://github.com/P2hemia/Jobtracker-Pro.git
cd Jobtracker-Pro

cp .env.example .env
nano .env  # Set NEXTAUTH_SECRET and NEXTAUTH_URL
```

### 2. Build & Start

```bash
docker compose up -d --build
```

### 3. Initialize Database (first time only)

```bash
cat > /tmp/init_db.sh << 'EOF'
#!/bin/sh
apk add --no-cache sqlite
sqlite3 /data/dev.db "CREATE TABLE IF NOT EXISTS User (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);"
sqlite3 /data/dev.db "CREATE TABLE IF NOT EXISTS Job (id TEXT PRIMARY KEY, userId TEXT NOT NULL, company TEXT NOT NULL, role TEXT NOT NULL, department TEXT, status TEXT DEFAULT 'applied', applyDate TEXT NOT NULL, jdLink TEXT, referrer TEXT, channel TEXT, reflections TEXT DEFAULT '', nextInterviewDate TEXT, events TEXT DEFAULT '[]', createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE);"
sqlite3 /data/dev.db "CREATE TABLE IF NOT EXISTS PasswordReset (id TEXT PRIMARY KEY, userId TEXT NOT NULL, token TEXT UNIQUE NOT NULL, expiresAt DATETIME NOT NULL, used INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE);"
echo Done
EOF

docker compose cp /tmp/init_db.sh jobtracker:/tmp/init_db.sh
docker compose exec jobtracker sh /tmp/init_db.sh
```

### 4. Access

Open `http://your-server-ip:3000`, register an account and start tracking.

### Hot Reload on Host

`src/`, `public/`, and `prisma/` are mounted as Docker volumes.
**Edit code on the host machine — changes reflect instantly without restarting the container.**

### Useful Commands

```bash
# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down

# Enter container
docker compose exec jobtracker sh
```

---

## 📁 Project Structure

```
jobtracker-pro/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── kanban/               # Kanban board
│   │   ├── table/                # Application list
│   │   ├── calendar/             # Calendar view
│   │   ├── settings/             # Settings
│   │   ├── login/                # Login / Register
│   │   ├── forgot-password/      # Password recovery
│   │   └── api/                  # Backend API Routes
│   ├── components/
│   │   ├── ui/                   # Base UI components
│   │   ├── Navbar.tsx
│   │   ├── JobCard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── JobDetailDrawer.tsx
│   │   └── AddJobDialog.tsx
│   ├── store/
│   │   └── useJobStore.ts        # Zustand global state
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── png/                          # Screenshots
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 🤝 Contributing

Pull requests are welcome!

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE) © 2026 [@P2hemia](https://github.com/P2hemia)
