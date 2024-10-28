import { DisplayOptions} from "@nlux/react";
import { ChatItem } from "@nlux/react";
import merge from 'lodash/merge';

const displayOptions: DisplayOptions = {
  height: 580,
  width: 450,
  colorScheme: "light",
};

const onMessageReceived = function () {
  const textarea = document.querySelector('.nlux-comp-composer textarea') as HTMLTextAreaElement;
  if (textarea) {
    textarea.focus();
  } else {
    console.error('Can not find textarea element!');
  }
}

export const initialConversations: ChatItem<string>[] = [
  {
    role: 'assistant',
    message: 'Hi there! I am CEEG’s assistant. What information are you looking for?',
  }
];

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

  events: { messageReceived: onMessageReceived }
};

export const getChatOptions = () => {
  return merge({}, defaultOptions, window.CHATBOT_CONFIG.aiChatOptions || window.CHATBOT_CONFIG.options);
};
