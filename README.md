# 得欧科技求职服务网站（Cloudflare Pages + 飞书多维表格版）

由妙搭（Miaoda）demo「得欧科技求职服务网站」1:1 改造而来：

- **前端**：与 demo 完全一致（React 19 + Vite 7 + Tailwind 4），仅将妙搭 SDK 依赖（`@lark-apaas/*`）替换为本地等价 shim（`shims/` 目录），页面源码一行未改。
- **后端**：原 NestJS 服务端整体移植为 Cloudflare Pages Functions（`functions/api/[[path]].js`），直连飞书 OpenAPI 读写多维表格。
- **数据**：全部存飞书多维表格（3 张 Base，见下表），无任何本地数据库。

## 功能与数据来源

| 功能 | 数据源（飞书多维表格） |
| --- | --- |
| 面试题库（96 题，自检练习 / 错题本 / 收藏夹） | [面试题库](https://my.feishu.cn/base/CJN2brwZUal7tms1YuPccsyCnlb) |
| 校招投递表（274+ 岗位，筛选 / 搜索 / 排序） | [校招投递表](https://my.feishu.cn/base/MxiUbvpdWanX47s4DGGcFwpVn7e) |
| 登录 + 账号管理（管理员增删改查，双向同步） | [用户列表](https://my.feishu.cn/base/XAcIb3h7iasOolsPD3BcIwi6n1f) |

技能训练（SQL）为纯前端功能（sql.js 浏览器内运行），不依赖后端。

## 目录结构

```
├── client/            # 前端源码（与 demo 1:1）
│   └── src/
│       ├── api/       # API 封装（走 /api/*，由 Pages Functions 处理）
│       ├── pages/     # 页面（Login / 面试题库 / 校招 / SQL / 管理员）
│       └── session/   # localStorage 登录态
├── shared/           # 前后端共享类型
├── shims/             # 妙搭 SDK 等价替换（页面 import 路径不变，构建时 alias 指到这里）
├── functions/api/[[path]].js   # 后端：全部 /api/* 接口（Cloudflare Pages Functions）
├── vite.config.ts     # 标准 Vite 配置（含 shim alias）
└── package.json
```

## 本地开发

```bash
npm install
npm run dev          # 前端 http://localhost:5173
```

本地 `npm run dev` 时没有 Functions 运行时，`/api/*` 会 404；只适合看页面 UI。
如需本地联调 API，用官方模拟器：

```bash
npx wrangler pages dev dist --compatibility-date=2025-01-01 \
  --binding FEISHU_APP_ID=xxx --binding FEISHU_APP_SECRET=xxx
```

（先 `npm run build` 生成 dist）

## 部署到 Cloudflare Pages（推荐：连接 GitHub）

### 第 1 步：推到 GitHub

```bash
cd deploy-package
git init
git add .
git commit -m "得欧科技求职服务网站（Cloudflare Pages 版）"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 第 2 步：创建飞书自建应用（获取 App ID / Secret）

1. 打开 [飞书开放平台](https://open.feishu.cn/app) → **创建企业自建应用**（名称随意，如“得欧求职站”）。
2. 进入应用 → **凭证与基础信息**，复制 **App ID** 和 **App Secret**。
3. 左侧 **权限管理** → 搜索并开通以下权限（bitable 读写）：
   - `bitable:app`（查看、评论、编辑和管理多维表格）
   - 或分别开通 `bitable:app:readonly` + `bitable:app`（读 + 写）
4. **版本管理与发布** → 创建版本并发布（个人版可直接发布）。
5. **关键一步**：把上面 3 张多维表格添加为应用的可用资源——
   在 **权限管理 → 云文档资源** 或发布时的“可用资源”里，逐个添加 3 个 Base（面试题库 / 校招投递表 / 用户列表）。
   > 没有这一步，接口会报错 91403 / “无权限”。

### 第 3 步：Cloudflare Pages 创建项目

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 选中刚推的仓库，构建配置：
   - **Framework preset**: `None`（或 Vite）
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`（仓库根就是包根，不要填子目录）
3. **Settings → Environment variables**（Production 和 Preview 都加）：

   | 变量名 | 值 |
   | --- | --- |
   | `FEISHU_APP_ID` | 飞书应用的 App ID |
   | `FEISHU_APP_SECRET` | 飞书应用的 App Secret |

4. **Save and Deploy**。首次构建约 1–2 分钟。

### 第 4 步：验证

部署完成后打开 `https://<项目名>.pages.dev`：

1. 登录页输入用户列表 Base 里的账号（如管理员账号）→ 应能登录。
2. 面试题库显示 96 题、校招投递表显示 274+ 岗位 → 数据链路通。
3. 管理员登录 → 账号管理 → 新增一个测试账号 → 去用户列表 Base 确认新记录出现 → 双向同步通。

### 可选：绑定自定义域名

Custom domains → Set up a custom domain → 按提示加 CNAME 即可。

## API 接口一览（Functions 实现）

| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| GET | `/api/interview-questions` | 面试题列表（5 分钟缓存） | 无 |
| POST | `/api/interview-questions/sync` | 强制刷新缓存重拉 | 无 |
| GET | `/api/recruitments` | 校招列表（keyword/function/city/targetGrade/sort） | 无 |
| GET | `/api/recruitments/filters` | 职能筛选项 | 无 |
| POST | `/api/auth/login` | 登录（用户名 + 密码，Base 校验） | 无 |
| GET | `/api/app-users` | 账号列表 | 无（不返回密码） |
| POST | `/api/app-users/sync` | 从 Base 重新同步 | 管理员 |
| POST | `/api/app-users` | 新增账号 | 管理员 |
| PATCH | `/api/app-users/:id` | 修改账号 | 管理员 |
| DELETE | `/api/app-users/:id` | 删除账号 | 管理员 |

管理员鉴权：前端登录后自动在 `/api/app-users*` 写请求带上 `X-Admin-User` 头，Functions 回用户列表 Base 校验该用户为「管理员 + 启用」。

## 与原 demo 的差异说明

| 原 demo（妙搭） | 本包（Cloudflare Pages） |
| --- | --- |
| `@lark-apaas/client-toolkit` axios 封装 | `shims/client/getAxiosForBackend.ts`（axios 直连 `/api/*`） |
| NestJS 服务端 + 插件实例读写 Base | Pages Functions 直连飞书 OpenAPI（字段映射、分页、过滤排序、错误契约逐行移植） |
| `@NeedLogin` 平台登录态 | `X-Admin-User` 头 + Functions 回 Base 校验 |
| drizzle 本地库（app-users 镜像） | 纯 Base，无本地库 |
| 服务端进程内缓存 5 分钟 | Functions 实例内缓存 5 分钟（等价） |

## 常见问题

- **登录报“登录服务暂时不可用”**：环境变量没配好，或飞书应用未开通 bitable 权限/未添加 Base 资源。
- **接口报 91403**：飞书应用没有那 3 个 Base 的访问权限，回第 2 步第 5 点添加资源。
- **改了 Base 数据但页面没变**：有 5 分钟服务端缓存；面试题库点“从 Base 同步”、账号管理点同步按钮可立即刷新；或等 5 分钟。
- **校招投递表怎么更新数据**：沿用之前的 paperball 爬取流程（见任务内交付的流程文档），直接写入 Base 即可，网站 5 分钟缓存内自动生效。
