# Lvmaoya Chat Widget

一个可即插即用的聊天窗口组件，支持在 Vue 项目或纯 HTML 页面中集成，开箱即用地完成聊天展示、流式输出与历史存储。

## 功能特点
- 一行代码集成聊天窗口
- 流式输出（SSE）与 Markdown 渲染
- 会话与历史自动存储与恢复
- 移动端适配与基础样式保障

## 安装

```bash
npm i @lvmaoya/chat-bot
```

## 快速开始（Vue 3）

- 全局注册：
```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import ChatBot from '@lvmaoya/chat-bot';

const app = createApp(App);
app.use(ChatBot); // 注册 <ChatWidget>
app.mount('#app');
```

- 在页面中使用：
```vue
<template>
  <ChatWidget
    endpointUrl="https://your-api/chat/stream"
    botName="Lvmaoya"
    :greetings="['Hello! How can I help you?']"
    :questions="['Tell me a joke', 'Introduce yourself']"
  />
</template>
```

- 按需导入组件（不注册插件）：
```ts
import { ChatWidget } from '@lvmaoya/chat-bot';
```

## 纯 HTML 页面集成

### 标准 UMD（需引入 Vue）
```html
<div id="chatbot"></div>
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/@lvmaoya/chat-bot/dist/chat-bot-widget.umd.js"></script>
<script>
  // UMD 全局名：ChatBotWidget
  ChatBotWidget.mount('#chatbot', {
    endpointUrl: 'https://your-api/chat/stream',
    botName: 'Lvmaoya',
    greetings: ['Hello!'],
    questions: ['Tell me a joke', 'Introduce yourself']
  });
</script>
```

### Standalone UMD（无需引入 Vue）
```html
<div id="chatbot"></div>
<script src="/dist/chat-bot-widget.standalone.umd.js"></script>
<script>
  ChatBotWidget.mount('#chatbot', {
    endpointUrl: 'https://your-api/chat/stream',
    botName: 'Lvmaoya'
  });
</script>
```

说明：Standalone 版本将 Vue 一并打包，体积更大但集成更简单；标准 UMD 版本需页面提前加载 Vue，体积更小。

## 可选属性

- `endpointUrl?: string` 后端流式接口地址
- `greetings?: string[]` 欢迎语数组
- `questions?: string[]` 预设问题数组
- `botName?: string` 机器人名称（显示在组件顶部）

## 前后端交互（SSE）

- 请求：`POST` `application/json`
```json
{
  "chatId": "<会话ID>",
  "message": "<用户输入>"
}
```

- 响应：`text/event-stream`，支持以下事件（逐行输出）：
  - `event: message` + 多个 `data:`：流式文本
  - `event: end` + 单个 `data:<chatId>`：返回会话 ID（用于续会话）
  - `event: error` + 多个 `data:`：错误信息

示例：
```
event: message
data: Hello 
data: world!

event: end
data: 123e4567-e89b-12d3-a456-426614174000
```

错误示例：
```
event: error
data: 接口不存在: /h5/chat/stream
```

说明：若后端返回非 2xx 状态（例如 404），前端会读取返回的 JSON/文本中的 `message` 并提示。

## 对话与历史存储

- 会话 ID：保存在 `sessionStorage`（键名：`SESSION_ID`）
- 聊天记录：保存在 `localStorage`（键名：`HISTORY`）
- 上次对话时间：保存在 `localStorage`（键名：`LAST_CONVERSATION_TIME`）

清理策略：
- 历史超限会自动裁剪，仅保留最新若干条（避免体积过大）
- 距离上次对话时间过长会自动清空历史（避免过期记录）

## 错误处理

- 网络错误：提示“Failed to connect to the server.”
- 非 2xx：按 `Content-Type` 解读 JSON 或文本中的 `message` 并提示
- 非 SSE 返回：作为非流式错误直接提示
- 流式错误：识别 `event:error` 并以错误样式显示

## 样式说明

- 组件内部提供基础标签样式（参照 Chrome UA），减少宿主项目的全局重置对布局的影响
- 样式随 JS 注入（无需单独引入 CSS）；如需独立 CSS，可调整构建配置后使用 `dist/style.css`
- 可在宿主页面覆盖 `.bot-containner`、`.message-*` 等类以定制主题

## 许可证

MIT