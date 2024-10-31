import { DisplayOptions, MessageReceivedEventDetails, MessageSentEventDetails } from "@nlux/react";
import { ChatItem } from "@nlux/react";
import merge from 'lodash/merge';
import { HISTORY, LAST_CONVERSATION_TIME } from "./cacheKey";

const MAX_STORAGE_SIZE = 80; // max conversation length
const KEEP_STORAGE_SIZE = 30; // max conversation length
const MAX_TIME_INTERVAL = 3 * 60 * 60 * 1000; // Up to 3 hours
const displayOptions: DisplayOptions = {
  height: 630,
  width: 440,
  colorScheme: "light",
};

export let history = JSON.parse(localStorage.getItem(HISTORY) || '[]');
let lastConversationTime = localStorage.getItem(LAST_CONVERSATION_TIME);

const checkLastConversationTime = function () {
  const currentTime = new Date().getTime();
  if (lastConversationTime && (currentTime - parseInt(lastConversationTime, 10) > MAX_TIME_INTERVAL)) {
    localStorage.removeItem(HISTORY);
    history = [];
  }
}

checkLastConversationTime();

const onMessageReceived = function (e: MessageReceivedEventDetails<any>) {
  console.log("onMessageReceived-----------------------------------------");
  
  const textarea = document.querySelector('.nlux-comp-composer textarea') as HTMLTextAreaElement;
  if (textarea) {
    textarea.focus();
  } else {
    console.error('Can not find textarea element!');
  }
  const receivedMsg = e.message.join("");
  history.push({
    role: 'assistant',
    message: receivedMsg
  });
  if (history.length > MAX_STORAGE_SIZE) {
    history = history.slice(-KEEP_STORAGE_SIZE);
  }
  localStorage.setItem(HISTORY, JSON.stringify(history));
  localStorage.setItem(LAST_CONVERSATION_TIME, new Date().getTime().toString());
}
const onMessageSent = function (event: MessageSentEventDetails) {
  history.push({
    role: 'user',
    message: event.message
  });
  if (history.length > MAX_STORAGE_SIZE) {
    history = history.slice(-KEEP_STORAGE_SIZE);
  }
  localStorage.setItem(HISTORY, JSON.stringify(history));
  localStorage.setItem(LAST_CONVERSATION_TIME, new Date().getTime().toString());
}


export let initialConversations = (history.length == 0 ? null : [...history]) as ChatItem<string>[];

export const defaultOptions = {
  personaOptions: {
    assistant: {
      name: 'Hi there,',
      avatar: 'https://aff-im.cdn.bcebos.com/onlineEnv/r/image/digitalman/digital-woman-welcome.gif',
      tagline: 'how can we help you today?',
    },
    user: {
      name: 'You',
      avatar: 'https://www.ceeg.cn/en/assets/v1/2024-10/image.png',
    }
  },
  displayOptions,
  composerOptions: {
    placeholder: 'Please enter your questions',
    hideStopButton: true
  },
  initialConversation: initialConversations,
  events: { messageReceived: onMessageReceived, messageSent: onMessageSent }
};

export const getChatOptions = () => {
  return merge({}, defaultOptions, window.CHATBOT_CONFIG.aiChatOptions || window.CHATBOT_CONFIG.options);
};
