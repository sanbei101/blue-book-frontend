# 📘 小蓝书前端 · blue-book-frontend

> 类小红书社区的 Web 前端:首页推荐 / 发现 / 发布 / 通知 / 个人主页 / 帖子详情 / API Key 管理,移动端优先 + 桌面侧栏。

## ✨ 功能一览

| 页面 | 路由 | 说明 |
| --- | --- | --- |
| 🏠 首页 | `/` | 推荐流(AppShell 包裹) |
| 🧭 发现 | `/explore` | 搜索、联想、热搜、话题 / 标签 |
| ➕ 发布 | `/publish` | 发帖(含图片上传) |
| 🔔 通知 | `/notifications` | 通知列表、未读数 |
| 🙋 我的 | `/me` | 个人主页、收藏夹、点赞 |
| 🔑 API Key | `/settings/api-keys` | 创建 / 列表 / 吊销委托密钥 |
| 👤 用户主页 | `/users/$userId` | 独立路由,无底部导航 |
| 📄 帖子详情 | `/posts/$postId` | 独立路由,无底部导航 |

桌面端走左侧栏、移动端走底部导航,由 `AppShell` 统一包裹。

## 🧱 技术栈

React 19(Compiler 开启) · Vite · TanStack Router / Query · Axios · Orval(API 代码生成) · Tailwind CSS v4 · shadcn Base Nova · Lucide 图标 · Sonner 通知

```
src/
├── router.tsx        # 路由唯一入口(新增页面必须在此接入)
├── main.tsx          # 入口:挂载 Router + 全局 Toaster
├── routes/           # 页面组件
├── components/ui/    # shadcn 组件(勿手写重复控件)
├── api/              # ⚠️ Orval 生成,勿手改
├── mutator.ts        # Axios 实例:baseURL /api/v1 + Bearer 注入 + {code,msg,data} 解包
├── hooks/ lib/       # 复用逻辑
└── index.css         # Tailwind v4 主题 + 全局样式(不新增 tailwind 配置文件)
```

认证沿用 `localStorage` 的 `access_token` / `refresh_token` / `blue_book:me`,请求失败优先展示 `ApiError.msg`。

## 🚀 快速开始

```sh
pnpm install
pnpm dev          # 开发服,/api 代理到 http://localhost:8080(需后端先起)
pnpm build        # tsc -b + vite build,产物在 dist/
```

GitHub Pages 部署时带子路径:`GITHUB_PAGES=1 pnpm build`(base 变为 `/blue-book-frontend/`,路由 `basepath` 会自动跟随)。

### 环境要求

- Node ≥ 20,pnpm
- 后端跑在 `http://localhost:8080`(或改 `vite.config.ts` 里的 proxy target)

## 🔌 对接后端接口

`swagger.yaml` 是接口定义的**唯一来源**(从后端 `docs/swagger.yaml` 同步过来):

```sh
pnpm gen:api   # Orval 重新生成 src/api
```

规则:页面只调用 `src/api` 里生成的方法,不手写 `fetch` / Axios endpoint;缺接口先补 OpenAPI 或找后端确认。

```ts
// 新增页面示例:只改 router.tsx + routes/,请求走生成代码
import { createRoute } from "@tanstack/react-router";
import { useGetApiV1Posts } from "@/api/…";
```

## ✅ 开发检查

```sh
pnpm lint    # Oxlint(type-aware)
pnpm fmt     # Oxfmt(含 import / Tailwind class 排序,ui 目录被排除)
pnpm build   # 提交前必跑(含 tsc 类型检查)
```
