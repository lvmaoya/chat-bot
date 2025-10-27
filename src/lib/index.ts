import type { App } from 'vue';
import { createApp } from 'vue';
import ChatWidget from './ChatWidget.vue';

export { ChatWidget };

export type ChatWidgetProps = {
  endpointUrl?: string;
  greetings?: string[];
  questions?: string[];
  bubble?: boolean;
};

export function install(app: App) {
  app.component('ChatWidget', ChatWidget);
}

export function mount(target: string | HTMLElement, props: ChatWidgetProps = {}) {
  const el: HTMLElement | null = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error('ChatWidget mount target not found');
  const app = createApp(ChatWidget, props);
  app.mount(el);
  return app;
}

export default { install, mount };