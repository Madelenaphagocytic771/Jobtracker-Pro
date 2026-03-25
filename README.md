# JobTracker Pro

<div align="center">

![JobTracker Pro](https://img.shields.io/badge/JobTracker-Pro-3b82f6?style=for-the-badge&logo=briefcase&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**个人求职全链路追踪系统 — 从投递到 Offer，全程可视化**

[在线演示](#) · [快速开始](#快速开始) · [Docker 部署](#docker-部署) · [功能截图](#功能截图)

</div>

---

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 📊 **数据看板** | 核心指标卡、求职漏斗阶梯图、未来 7 天面试提醒 |
| 🗂 **拖拽看板** | 7 阶段敏捷看板，拖拽卡片即可更新状态 |
| 📋 **列表视图** | 全文搜索、多维排序、状态筛选，`Ctrl+K` 快捷唤起 |
| 📅 **日历视图** | 月历展示所有面试安排，点击直达详情 |
| 📝 **深度复盘** | 原生 Markdown 编辑器，支持代码块、列表、引用 |
| 🔐 **多用户系统** | 注册/登录/忘记密码，bcrypt 加密，JWT 鉴权 |
| �� **暗色模式** | 明/暗主题一键切换，护眼夜间复盘 |
| 💾 **数据备份** | 一键导出/导入 JSON，数据永不丢失 |
| 🐳 **Docker 部署** | 开箱即用，宿主机代码热更新 |

## 🖼 功能截图

> *(部署后可在此处添加截图)*

## 🛠 技术栈

```
前端框架    Next.js 16 (App Router) + TypeScript
样式        Tailwind CSS v4
UI 组件     Radix UI Primitives
状态管理    Zustand
数据库      SQLite + Prisma ORM
认证        NextAuth.js v5 (Credentials)
拖拽        @dnd-kit
图表        Recharts
Markdown    react-markdown + remark-gfm
主题        next-themes
容器化      Docker + Docker Compose
```

## 📁 项目结构

```
src/
├── app/
│   ├── page.tsx              # 数据看板
│   ├── kanban/page.tsx       # 拖拽看板
│   ├── table/page.tsx        # 列表视图
│   ├── calendar/page.tsx     # 日历视图
│   ├── settings/page.tsx     # 设置页
│   ├── login/page.tsx        # 登录/注册
│   ├── forgot-password/      # 找回密码
│   └── api/                  # API Routes
├── components/
│   ├── ui/                   # 基础 UI 组件
│   ├── Navbar.tsx
│   ├── JobCard.tsx
│   ├── KanbanColumn.tsx
│   ├── JobDetailDrawer.tsx
│   └── AddJobDialog.tsx
├── store/
│   └── useJobStore.ts        # Zustand 状态管理
├── lib/
│   ├── db.ts                 # Dexie IndexedDB
│   ├── prisma.ts             # Prisma Client
│   └── utils.ts
└── types/
    └── index.ts              # TypeScript 类型定义
```

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/YOUR_USERNAME/jobtracker-pro.git
cd jobtracker-pro

# 安装依赖
npm install --legacy-peer-deps

# 配置环境变量
cp .env.example .env
# 编辑 .env，填写 NEXTAUTH_SECRET

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 环境变量

```env
# 随机字符串，至少32位（生成命令：openssl rand -base64 32）
NEXTAUTH_SECRET=your-secret-here

# 应用访问地址
NEXTAUTH_URL=http://localhost:3000

# 数据库路径
DATABASE_URL=file:./prisma/dev.db
```

## 🐳 Docker 部署

### 1. 克隆并配置

```bash
git clone https://github.com/YOUR_USERNAME/jobtracker-pro.git
cd jobtracker-pro

cp .env.example .env
nano .env  # 填写 NEXTAUTH_SECRET 和 NEXTAUTH_URL
```

### 2. 构建并启动

```bash
docker compose up -d --build
```

### 3. 初始化数据库

```bash
# 创建脚本并执行
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

### 4. 访问应用

打开 `http://你的服务器IP:3000`，注册账号开始使用。

### 常用命令

```bash
# 查看日志
docker compose logs -f

# 重启容器
docker compose restart

# 停止
docker compose down

# 进入容器
docker compose exec jobtracker sh
```

### 宿主机热更新

`src/`、`public/`、`prisma/` 目录已通过 Volume 挂载到容器内。
在宿主机直接修改代码，浏览器刷新即可看到效果，**无需重启容器**。

```bash
# 服务器上直接编辑代码
vim /opt/jobtracker/src/app/page.tsx
# 保存后刷新浏览器即可
```

## 📊 数据模型

```typescript
interface Job {
  id: string           // UUID
  company: string      // 公司名
  role: string         // 岗位名
  department?: string  // 部门
  status: JobStatus    // 当前阶段
  applyDate: string    // 投递日期
  jdLink?: string      // JD 链接
  referrer?: string    // 内推人
  channel?: string     // 投递渠道
  events: JobEvent[]   // 流转事件
  reflections: string  // Markdown 复盘
  nextInterviewDate?: string  // 下次面试时间
}

type JobStatus =
  | 'wishlist'      // 🌟 意向池
  | 'applied'       // 📤 已投递
  | 'assessment'    // 📝 笔试/测评
  | 'interviewing'  // 🗣️ 业务面试
  | 'hr_cross'      // 🤝 HR/交叉面
  | 'offered'       // 🏆 Offer
  | 'rejected'      // ❌ 归档/终止
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交改动：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 License

[MIT License](LICENSE) © 2026
