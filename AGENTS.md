# 开发规范

## 命令

- `pnpm dev` 启动 Vite 开发服务器；开发时 `/api` 会代理到 `http://10.1.1.200:8080`，需要后端可访问。
- `pnpm lint` 运行启用 type-aware 检查的 Oxlint；`pnpm build` 会先执行 `tsc -b`，再执行 Vite production build。
- `pnpm fmt` 使用 Oxfmt，并会排序 imports 与 Tailwind class；`src/components/ui` 被格式化配置排除。
- 没有测试脚本或测试目录；提交前至少运行 `pnpm lint` 和 `pnpm build`。

## 结构

- `src/main.tsx` 是入口，挂载 TanStack Router 和全局 Sonner `Toaster`。
- 路由在 `src/router.tsx` 手动声明；新增页面必须在这里接入，单独新增 route 文件不会自动生效。
- `/`、`/explore`、`/publish`、`/notifications`、`/me` 由 `AppShell` 包裹，带桌面侧栏和移动端底部导航；帖子详情与用户资料是无底部导航的独立路由。
- `@/*` 指向 `src/*`，应用代码优先使用该 alias。

## API

- `swagger.yaml` 是接口定义源；运行 `pnpm gen:api` 由 Orval 生成 `src/api`。不要手动修改或新增 `src/api` 文件。
- 所有请求必须调用 `src/api` 中生成的方法，不要在页面里自行写 `fetch`、Axios endpoint 或重复的请求类型；缺少接口先补 OpenAPI/与后端确认。
- `src/mutator.ts` 提供生成器使用的 Axios mutator，base URL 是 `/api/v1`，并自动从 `localStorage.access_token` 注入 Bearer token。
- mutator 会解包后端 `{ code, msg, data }` 响应，并将非 200 响应转为 `ApiError`；页面请求失败应优先展示 `ApiError.msg`。
- 登录状态沿用 `access_token`、`refresh_token` 和 `blue_book:me` 这些 localStorage key，修改认证流程时保持一致。

## UI

- 使用 `components.json` 配置的 shadcn Base Nova 组件和 Lucide 图标，优先复用 `src/components/ui`，不要为已有控件重新写 CSS。
- 保持 `className` 简洁，避免无意义的 wrapper 和多层 `<div>`；只有组件库无法表达的布局才添加局部 Tailwind 样式。
- Tailwind v4 主题变量和全局基础样式位于 `src/index.css`，不要新增 Tailwind 配置文件。
- 当前 React 类型将 `FormEvent` 标记为 deprecated，表单提交处理器使用 `SubmitEvent<HTMLFormElement>`。

## TypeScript

- `tsconfig.app.json` 和 `tsconfig.node.json` 都启用 `noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`；新增导入、参数和分支必须保持无未使用项。
