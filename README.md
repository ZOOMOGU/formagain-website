# FORMAGAIN 品牌网站

服装品牌网站源码，使用 React、TypeScript 和 Vinext。

## 朋友接手编辑

仓库是私有的，需要仓库所有者先在 GitHub 的 Settings → Collaborators 中邀请你的 GitHub 账号，接受邀请后才能下载和提交代码。

1. 安装 Node.js 22.13.0 或更新版本。
2. 克隆仓库并进入项目：

```bash
git clone https://github.com/ZOOMOGU/formagain-website.git
cd formagain-website
npm ci
npm run dev
```

打开终端显示的本地网址预览。使用 Codex 或其他编辑器打开项目文件夹即可继续修改。

- 页面与交互：`app/`
- 全局样式：`app/globals.css`
- 图片与品牌素材：`public/`
- 数据库结构与迁移：`db/`、`drizzle/`

## 协作与发布

每次开始前先同步代码；推荐为每项修改新建分支，提交后通过 Pull Request 合并。

```bash
git pull
git switch -c edit-homepage
# 完成修改后检查构建
npm run build
git add .
git commit -m "Update homepage"
git push -u origin edit-homepage
```

GitHub 保存源码。推送代码不会自动更新原来的线上网站；线上发布仍需通过有权限的 Sites 账号完成。`.openai/hosting.json` 保留现有站点标识和 D1 绑定，勿随意替换。订阅功能依赖 D1 数据库，生产数据与发布权限不随源码共享。

依赖、构建缓存、本地数据库和 `.env` 文件已通过 `.gitignore` 排除，请勿提交密钥。

---

## 原始模板说明

# vinext-starter

A clean full-stack starter running on
[vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and
Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
