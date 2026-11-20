# 26hack4-echoFE

2026 Hackweek 第 4 组 · 回声 · 前端仓库

## 项目简介

「回声」是一个移动端 Web 应用：提出问题、投票作答、围观争议、结算结果。

本仓库为前后端分离项目的前端部分，使用 React + TypeScript 实现，通过 Axios 调用后端 REST 接口；开发环境由 Vite 把 `/api` 代理到本地后端，避免跨域。

## 技术栈

- React 19 + TypeScript
- Vite 8（`@vitejs/plugin-react` + React Compiler）
- React Router 7
- Axios（统一请求封装、自动携带 token、401 失效处理）
- CSS Modules（无 UI 组件库，样式手写）
- ESLint（flat config）+ Prettier
- pnpm

## 当前功能

- 登录、注册与登录状态校验（`RequireAuth`）
- 首页
  - 按时间段问候、当日日期、今日数据看板（`GET /stats/daily`）
  - 海滩区与“冲刷海滩”入口
  - 横向滑动的争议海螺卡片，策略展示前 4 条
- 争议海螺
  - 列表页拉取 `GET /questions/contested`
  - 详情页展示题目、选项、得票占比，支持前端竞猜并公布最终结果
  - 猜完可查看评论区，支持发表和长按删除自己的评论
- 丢出海螺
  - 填写题目、2～4 个选项、结算时长后发布（`POST /questions`）
  - 题目与选项长度校验、选项重复校验
  - 草稿自动保存到 `localStorage`，下次进入可恢复
- 答题
  - 随机抽题（`GET /questions/random`）、投票（`POST` 投票接口）
  - 投票后展示结果与评论区
- 我的海螺
  - 我所发布的题目列表（`GET /users/me/questions`），按关键词本地过滤
  - 未结算的题目优先展示
  - 提供进入结算页的入口
- 结算页（发布者）
  - 查看投票分布，选择最终答案完成结算
  - 结算后展示结果并支持评论
- 答主结果页
  - 展示我是否猜中、最终答案与评论
- 我的
  - 个人资料（昵称、账号、头像、等级、经验进度）
  - 内置头像选择、放大预览、左右轮换与保存
  - 我参与的列表，三种状态由前端根据 `settled_at` / `final_option_id` 推导

## 本地运行

### 1. 先启动后端

前端默认请求 `/api`，由 Vite 代理到 `http://localhost:8080`（见 `frontend/vite.config.ts`）。后端未启动时页面会提示网络异常。如果后端端口不同，改 `vite.config.ts` 里的 `target`。

### 2. 安装依赖并启动

```bash
cd frontend
pnpm install
pnpm dev
```

根据终端输出访问，通常为：

```text
http://localhost:5173
```

### 3. 环境变量

`frontend/.env.development`：

```text
VITE_API_BASE_URL=/api
```

请求基址由 `src/api/request.ts` 读取：

```ts
baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api'
```

未配置 `.env.production` 时，生产构建同样使用 `/api`，即与后端同源部署。

## 常用命令

所有命令均在 `frontend` 目录下执行。

```bash
# 启动开发环境
pnpm dev

# 类型检查 + 生产构建
pnpm build

# 本地预览构建结果
pnpm preview

# ESLint 检查
pnpm lint
```

## 项目结构

```text
26hack4-echoFE/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                    # 接口层
│   │   │   ├── request.ts          # Axios 实例、token 拦截、统一拆壳
│   │   │   ├── auth.ts             # 登录、注册
│   │   │   ├── home.ts             # 首页数据（看板 + 争议）
│   │   │   ├── debate.ts           # 争议列表
│   │   │   ├── question.ts         # 题目详情、投票、结算、评论
│   │   │   └── me.ts               # 我的资料、我参与的、我的海螺
│   │   ├── assets/                 # 头像、品牌装饰、首页与 TabBar 图片、字体
│   │   ├── components/
│   │   │   ├── Avatar/
│   │   │   ├── AvatarPicker/
│   │   │   ├── RequireAuth/
│   │   │   └── TabBar/
│   │   ├── layouts/
│   │   │   └── BasicLayout/        # 登录后公共布局（内容区 + 底部导航）
│   │   ├── mock/                   # 仅保留文案常量与草稿工具，不提供假数据
│   │   ├── pages/
│   │   │   ├── Login/              # 登录、注册
│   │   │   ├── home/               # 首页
│   │   │   ├── debate/             # 争议列表、争议详情
│   │   │   ├── ask/                # 丢出海螺
│   │   │   ├── question/           # 答题
│   │   │   ├── shell/              # 我的海螺
│   │   │   ├── end/                # 发布者结算页、答主结果页
│   │   │   └── profile/            # 我的
│   │   ├── App.tsx                 # 路由配置
│   │   ├── index.css               # 全局样式与 #root 画框
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env.development
│   ├── eslint.config.js
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

## 主要路由

| 路径 | 页面 | 布局 |
| --- | --- | --- |
| `/login` | 登录 | 独立 |
| `/register` | 注册 | 独立 |
| `/home` | 首页 | BasicLayout |
| `/debate` | 争议海螺列表 | BasicLayout |
| `/debate/:id` | 争议详情 | BasicLayout |
| `/shell` | 我的海螺 | BasicLayout |
| `/profile` | 我的 | BasicLayout |
| `/ask` | 丢出海螺 | 全屏 |
| `/question` | 随机答题 | 全屏 |
| `/settle/:id` | 发布者结算页 | 全屏 |
| `/answer-end/:id` | 答主结果页 | 全屏 |

除登录、注册外，所有路由都经过 `RequireAuth` 校验；未登录访问任意路径会跳回 `/login`。

## 构建与验收

提交前在 `frontend` 目录执行：

```bash
pnpm lint
pnpm build
```

`build` 会先跑 `tsc -b` 做类型检查，再执行 `vite build`，任一步失败都不会产出构建结果。

重点验收：

- 未登录访问任意页面是否跳回登录页，登录后能否正常返回。
- 首页在 375×667、393×852 等尺寸下是否单屏展示、无横向滚动。
- 首页、争议列表、丢出海螺、结算页的入场动画是否正常，动画期间页面能否被横向拖动。
- 争议详情的竞猜、答案公布、评论发表与长按删除。
- 丢出海螺的长度校验、重复选项校验、草稿恢复、发布成功弹窗。
- 答题页投票后结果与评论区是否正确刷新。
- 我的海螺的搜索过滤、未结算优先和结算入口。
- 结算页选择答案后状态是否更新，返回列表是否同步。
- 移动端软键盘弹出时输入框是否被遮挡。