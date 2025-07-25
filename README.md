# Lvmaoya 聊天机器人

一个基于Vue 3的轻量级聊天机器人界面，提供简洁美观的用户交互体验。

## 项目截图

项目包含两张截图，展示了聊天机器人的界面效果：

- 聊天界面截图1：`/src/assets/imgs/Snipaste_2025-07-25_14-37-52.png`
- 聊天界面截图2：`/src/assets/imgs/Snipaste_2025-07-25_14-38-11.png`

## 功能特点

- 💬 简洁美观的聊天界面
- 🔄 支持会话历史记录的保存和恢复
- 📱 响应式设计，适配移动端和桌面端
- 🎯 预设问题提示，方便用户快速提问
- 📝 支持Markdown格式的消息渲染
- 🕒 显示消息发送时间
- 🔄 支持会话刷新重置
- 🔍 支持会话ID的管理

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **样式**：CSS（原生）
- **Markdown渲染**：markdown-it
- **UUID生成**：uuid

## 项目结构
├── src/
│   ├── App.vue          # 主应用组件
│   ├── api.ts           # API请求处理
│   ├── assets/          # 静态资源
│   │   ├── imgs/        # 图片资源
│   │   ├── main.css     # 全局样式
│   │   └── svgIcons.ts  # SVG图标
│   ├── config.ts        # 配置常量
│   ├── loading.vue      # 加载组件
│   ├── main.ts          # 应用入口
│   └── utils.ts         # 工具函数


## 安装与使用

### 前提条件

- Node.js (推荐 v16 或更高版本)
- npm 或 pnpm

### 安装依赖

```bash
pnpm install
```

或

```bash
npm install
```

### 开发模式运行

```bash
pnpm dev
```

或

```bash
npm run dev
```

### 构建生产版本

```bash
pnpm build
```

或

```bash
npm run build
```

## 配置说明

项目在`config.ts`中提供了一些可配置项：

- `USER_ID`: 用户ID存储键
- `HISTORY`: 历史记录存储键
- `SESSION_ID`: 会话ID存储键
- `LAST_CONVERSATION_TIME`: 最后会话时间存储键
- `MAX_STORAGE_SIZE`: 最大存储会话长度（默认80条）
- `KEEP_STORAGE_SIZE`: 保留存储会话长度（默认30条）
- `MAX_TIME_INTERVAL`: 最大会话时间间隔（默认3小时）

## API集成

聊天机器人通过`api.ts`中的`handlePostRequestWithEventStream`函数与后端API进行通信，支持流式响应。默认API地址为：
http://webchat-bot-t9rx.fcv3.1486648470098031.cn-hangzhou.fc.devsapp.net/chat


## 自定义与扩展

### 修改预设问题

在`App.vue`中修改`questionsPrompt`数组：

```typescript
const questionsPrompt = [
  "What is the capital of France",
  "Who is the most handsome person in the world",
  "Please share a story with me",
  "Tell me a joke",
  "Introduce yourself",
]
```

### 修改欢迎消息

在`App.vue`中修改`greetingMessage`数组：

```typescript
const greetingMessage = ['Hi, there! Lvmaoya is at your service! How can I assist you today?'];
```

### 自定义样式

可以在`App.vue`的`<style>`部分修改聊天界面的样式，或在`assets/main.css`中修改全局样式。

## 许可证

[MIT](LICENSE)

## 联系方式

如有任何问题或建议，请联系项目维护者。