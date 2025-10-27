# Lvmaoya 聊天机器人（可作为 npm 包使用）

一个基于 Vue 3 的轻量级聊天组件，支持作为独立库集成到 Vue 项目、Nuxt 3 项目以及纯 HTML+JS 页面。

## 功能特点
- 轻量组件，一行代码集成聊天窗口
- 会话历史保存与恢复（LocalStorage + SessionStorage）
- Markdown 渲染，移动端适配
- 预设问题快捷提示
- 可配置后端聊天接口地址

## 安装与构建

- 开发依赖安装：
```bash
npm install
# 或 pnpm install
```

- 本地开发：
```bash
npm run dev
```

- 构建库（生成 `dist/` 产物）：
```bash
npm run build
```
> 构建后将生成：`dist/chat-bot-widget.mjs`（ESM）、`dist/chat-bot-widget.umd.js`（UMD），以及样式 `dist/style.css`。

## npm 发布准备

当前仓库已配置为库模式输出，发布到 npm 的步骤如下：

1. 登录 npm：
```bash
npm login
```
2. 确认包名是否可用（建议使用作用域包名，例如 `@lvmaoya/chat-bot`）：
   - 将 `package.json` 的 `name` 改为你的包名
   - 如使用作用域，首次发布需加：`npm publish --access public`
3. 更新版本号：
```bash
npm version patch   # 或 minor / major
```
4. 构建并本地验证：
```bash
npm run build
npm pack            # 生成 .tgz 包，本地新项目可安装测试
```
5. 发布：
```bash
npm publish --access public
```

## 安装（使用者侧）

### Vue 3 项目

```bash
npm i chat-bot
# 或 npm i @lvmaoya/chat-bot （建议使用你最终的包名）
```

- 作为插件全局注册：
```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import ChatBot from 'chat-bot'; // 或 '@lvmaoya/chat-bot'
import 'chat-bot/dist/style.css';

const app = createApp(App);
app.use(ChatBot); // 注册 <ChatWidget>
app.mount('#app');
```

- 在页面中使用：
```vue
<template>
  <ChatWidget endpointUrl="https://your-api/chat" />
</template>
```

- 按需导入组件（不注册插件）：
```ts
import { ChatWidget } from 'chat-bot';
```

- 可选属性：
  - `endpointUrl?: string` 接口地址（默认内置 demo 地址）
  - `greetings?: string[]` 欢迎语数组
  - `questions?: string[]` 预设问题数组
  - `bubble?: boolean` 是否显示右下角气泡按钮（默认 `true`）

### Nuxt 3 项目

安装同上，然后创建客户端插件：
```ts
// plugins/chatbot.client.ts
import { defineNuxtPlugin } from '#app';
import ChatBot from 'chat-bot';
import 'chat-bot/dist/style.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ChatBot);
});
```
在页面或组件中即可使用：
```vue
<template>
  <ChatWidget endpointUrl="https://your-api/chat" />
</template>
```

### 纯 HTML + JS 页面（CDN）

在页面中引入 Vue 3 和 UMD 包：
```html
<div id="chatbot"></div>
<link rel="stylesheet" href="https://unpkg.com/chat-bot/dist/style.css" />
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/chat-bot/dist/chat-bot-widget.umd.js"></script>
<script>
  // UMD 全局名：ChatBotWidget
  ChatBotWidget.mount('#chatbot', {
    endpointUrl: 'https://your-api/chat',
    greetings: ['Hello! How can I help you today?'],
    questions: ['Tell me a joke', 'Introduce yourself']
  });
</script>
```
> 注意：UMD 构建外部化了 Vue，因此必须先引入 Vue 3。

## 项目结构概览
```
├── src/
│   ├── App.vue               # 演示应用（本地开发预览）
│   ├── lib/
│   │   ├── ChatWidget.vue    # 可发布为 npm 的聊天组件
│   │   └── index.ts          # 库入口（导出组件、插件、mount 方法）
│   ├── api.ts                # 流式接口封装
│   ├── assets/
│   │   ├── main.css
│   │   └── svgIcons.ts
│   ├── config.ts
│   ├── loading.vue
│   └── utils.ts
```

## 可配置项（运行时）
- `endpointUrl`：后端聊天接口地址（默认使用项目内示例地址）
- `greetings`：欢迎语数组
- `questions`：预设问题数组
- `bubble`：是否显示右下角气泡按钮（默认显示）

## 许可证
MIT

## 备注
- 打包配置：已启用 Vite 库模式（ESM + UMD），并将 `vue` 设为外部依赖（peerDependencies）。
- 若要生成类型声明，后续可加入 `vite-plugin-dts` 或使用 `vue-tsc` 的声明输出。当前版本不包含 `.d.ts`。