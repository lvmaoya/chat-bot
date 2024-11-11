<script setup lang="ts">
import { nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { refreshIcon, closeIcon } from './assets/svgIcons';
import { handlePostRequestWithEventStream, ReceiveState } from './api';
import { formatLocalTime } from "./utils";
import Loading from './loading.vue';
import MarkdownIt from "markdown-it";
import { HISTORY, KEEP_STORAGE_SIZE, LAST_CONVERSATION_TIME, MAX_STORAGE_SIZE, MAX_TIME_INTERVAL, SESSION_ID } from './config';

enum Role {
  user = 'user',
  assistant = 'assistant',
  system = 'system'
}
const isBotContainerVisible = ref(true);
const onBubbleClick = () => {
  isBotContainerVisible.value = true;
}

const inputValue = ref('');
const isLoading = ref(false)

const receiver = (state: ReceiveState, value: any) => {
  switch (state) {
    case ReceiveState.complete:
      isLoading.value = false
      setHistory();
      break;
    case ReceiveState.update:
      clearInputValue();
      chatMessages.value[chatMessages.value.length - 1].message += value
      break;
    case ReceiveState.error:
      isLoading.value = false
      chatMessages.value[chatMessages.value.length - 1].message += value
      setHistory();
      break;
    default:
      break;
  }
};

const clearInputValue = () => {
  if (inputValue.value != '') {
    inputValue.value = ''
  }
}

// 添加新消息的函数
const addMessage = (role: Role, message: any, time: number) => {
  chatMessages.value.push({ role, message, time });
};
const handleSubmit = async () => {
  if (inputValue.value.trim() == '' || isLoading.value) return;
  isLoading.value = true;
  addMessage(Role.user, inputValue.value, Date.now())
  addMessage(Role.assistant, '', Date.now())
  handlePostRequestWithEventStream("http://webchat-bot-t9rx.fcv3.1486648470098031.cn-hangzhou.fc.devsapp.net/chat", inputValue.value, receiver);
};
const chatMessages = ref<Array<{ role: Role, message: string, time: number }>>([]);
const greetingMessage = ['Hi, there! Lvmaoya is at your service! How can I assist you today?'];

const questionsPrompt = [
  "What is the capital of France",
  "Who is the most handsome person in the world",
  "Please share a story with me",
  "Tell me a joke",
  "Introduce yourself",
]
const scrollContainer = ref();

const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};
const onCloseDialogClick = () => {
  isBotContainerVisible.value = false
}
const markdown = new MarkdownIt()

const onPromptClick = (value: string) => {
  inputValue.value = value;
  handleSubmit()
}
const onRefreshClick = () => {
  if (isLoading.value) return;
  chatMessages.value.length = 0;
  sessionStorage.removeItem(SESSION_ID);
  localStorage.removeItem(HISTORY);
  localStorage.removeItem(LAST_CONVERSATION_TIME);
}
const setHistory = () => {
  let historyList = [...chatMessages.value]
  if (historyList.length > MAX_STORAGE_SIZE) {
    historyList = historyList.slice(-KEEP_STORAGE_SIZE);
  }
  localStorage.setItem(HISTORY, JSON.stringify(historyList));
  localStorage.setItem(LAST_CONVERSATION_TIME, new Date().getTime().toString());
};
const getHistory = () => {
  let lastConversationTime = localStorage.getItem(LAST_CONVERSATION_TIME);
  const currentTime = new Date().getTime();
  if (lastConversationTime && (currentTime - parseInt(lastConversationTime, 10) > MAX_TIME_INTERVAL)) {
    localStorage.removeItem(HISTORY);
  } else {
    chatMessages.value.push(...JSON.parse(localStorage.getItem(HISTORY) || '[]'));
  }
};
onBeforeMount(() => {
  getHistory();
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
});

const isMobile = ref(false);

watch(chatMessages.value, () => {
  nextTick(() => scrollToBottom())
});

</script>

<template>
  <div class="bot-trigger" @click="onBubbleClick" :class="{ 'hidden': isBotContainerVisible }">
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5423" width="35" height="35">
      <path
        d="M240 658.08h220.784l55.744 65.04 55.744-65.04h220.768V272H240v386.08z m-48 32V240a16 16 0 0 1 16-16h617.04a16 16 0 0 1 16 16v450.08a16 16 0 0 1-16 16H594.336l-65.664 76.64a16 16 0 0 1-24.304 0l-65.664-76.64H208a16 16 0 0 1-16-16zM366.256 498.56a33.488 33.488 0 1 1 0-66.992 33.488 33.488 0 0 1 0 66.992z m150.272 0a33.488 33.488 0 1 1 0-66.992 33.488 33.488 0 0 1 0 66.992z m150.24 0a33.488 33.488 0 1 1 0-66.992 33.488 33.488 0 0 1 0 66.992z"
        fill="#ffffff" p-id="5424"></path>
    </svg>
  </div>
  <div class="bot-containner"
    :class="{ 'bot-containner-show': isBotContainerVisible, 'bot-mobile-container': isMobile }">
    <div class="bot-header">
      <div class="logo">
        <!-- <img src="@/assets/avatar.png" alt="lvmaoya" /> -->
        <span>Lvmaoya</span>
      </div>
      <div class="toolbar">
        <button v-html="refreshIcon" @click="onRefreshClick">
        </button>
        <button v-html="closeIcon" @click="onCloseDialogClick">
        </button>
      </div>
    </div>
    <div class="bot-content" ref="scrollContainer">
      <div class="message-item" v-for="item in greetingMessage">
        <div class="message-assistant">
          <div class="content">
            {{ item }}
          </div>
        </div>
      </div>
      <div class="message-item">
        <div class="message-assistant">
          <div class="content">
            <p>Questions and Answers:</p>
            <ul>
              <li v-for="item in questionsPrompt" @click="onPromptClick(item)">
                <a href="javascript:;">{{ item }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-for="(item, index) in chatMessages" :key="index" class="message-item">
        <div :class="{ 'message-user': item.role === Role.user, 'message-assistant': item.role === Role.assistant }"
          v-if="item.role === Role.user || item.role === Role.assistant">
          <div class="content" v-if="item.message" v-html="markdown.render(item.message)"></div>
          <div class="content" v-else>
            <Loading></Loading>
          </div>
        </div>
        <div :class="{ 'message-system': item.role === Role.system }"
          v-else-if="item.role === Role.system && item.message">
          <div v-html="item.message"></div>
        </div>
        <div>{{ formatLocalTime(item.time) }}</div>
      </div>

    </div>
    <div class="bot-input">
      <input type="text" v-model="inputValue" @keyup.enter="handleSubmit" placeholder="Please enter your questions">
      <button @click="handleSubmit">
        <svg t="1730723754099" :style="{ fill: inputValue && inputValue.trim() !== '' && !isLoading ? '#666' : '#999' }"
          width="21" height="21" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12458">
          <path
            d="M392.021 925.013a34.133 34.133 0 0 1-34.133-34.133V579.243a34.002 34.002 0 0 1 12.63-26.454l276.48-224.085a34.1 34.1 0 0 1 43.007 52.907l-263.85 213.845v192.853l82.944-110.592c10.069-13.482 28.672-17.578 43.52-9.557l137.557 73.728L853.333 156.16c3.243-11.435-3.413-18.603-6.485-21.163-3.072-2.56-11.093-7.85-21.845-2.901L206.336 422.4l80.213 46.08c16.384 9.387 22.016 30.208 12.63 46.592s-30.208 22.016-46.592 12.63L115.54 449.023a33.98 33.98 0 0 1-17.066-31.061c0.512-12.8 8.021-24.064 19.626-29.526L795.99 70.315c31.744-14.848 68.096-10.07 94.891 12.629a87.79 87.79 0 0 1 28.16 91.477L744.277 801.28a34.082 34.082 0 0 1-48.981 20.821L546.133 742.06 419.328 911.36c-6.656 8.704-16.896 13.653-27.307 13.653z"
            p-id="12459"></path>
        </svg>
      </button>
    </div>
  </div>
</template>
<style>
.hidden {
  display: none !important;
}

.bot-trigger {
  position: fixed;
  width: 50px;
  height: 40px;
  border-radius: 4px;
  background-color: #eb9402;
  bottom: 40px;
  right: 40px;
  transition: 0.3s;
  cursor: pointer;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #ffb432;
  }

  &:active {
    transform: scale(0.9);
  }
}

.bot-containner {
  width: 435px;
  height: 80vh;
  max-height: 712px;
  position: fixed;
  bottom: 24px;
  right: 24px;
  box-shadow: 0 1px 8px 0 #47474729;
  color: #171a20;
  border-radius: 16px;
  overflow: hidden;
  opacity: 0.1;
  transform: translateY(120%);
  transition: all .5s;
  z-index: 9999999;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: white;

  a {
    color: #eb9402;
  }

  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 0
  }

  ::-webkit-scrollbar-thumb {
    cursor: pointer;
    border-radius: 5px;
    background: rgba(0, 0, 0, .1);
    -webkit-transition: color .2s ease;
    transition: color .2s ease
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, .5)
  }


}

.bot-containner-show {
  opacity: 1;
  transform: translateY(0%);
  transition: opacity .5s, transform .5s;
}

.bot-mobile-container {
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  border-radius: 16px 16px 0 0;
}

.bot-header {
  height: 70px;
  display: flex;
  padding-left: 20px;
  padding-right: 10px;
  /* box-shadow: 0 1px 2px 0 rgba(219, 219, 219, 0.2); */

  align-items: center;
  justify-content: space-between;

  .logo {
    line-height: 0;
    display: flex;
    align-items: center;
    img {
      width: 45px;
      border-radius: 50%;
    }
    span{
      /* margin-top: 20px;
      margin-left: 10px; */
      font-weight: 600;
    }
  }


  .toolbar {
    display: flex;

    svg {
      font-size: 18px;
      fill: #333;
    }

    button {
      width: 2.5rem;
      height: 2.5rem;
      background-color: transparent;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      border-color: transparent;
      transition: all 0.2s;

      &:first-child {
        margin-right: 4px;
      }

      &:hover {
        background-color: #c0c0c029;
      }

      &:active {
        transform: scale(0.9);
      }
    }
  }
}

.bot-content {
  flex: 1;
  overflow-y: scroll;
  padding-left: 20px;
  padding-right: 14px;

  .message-item {
    display: flex;
    flex-direction: column;
    padding: 8px 0px;

    &>div {
      display: flex;
      gap: 10px;
    }

    /* &:first-child {
      margin-top: 20px;
    } */

    &:nth-child(2) .content {
      line-height: 2 !important;
    }

    .content {
      width: fit-content;
      background-color: #f4f4f4;
      padding: 14px;
      font-size: 14px;
      line-height: 22px;
    }
  }

  .message-user {
    width: 90%;
    margin-left: auto;
    justify-content: end;

    & .content {
      border-radius: 0.5rem 0 0.5rem 0.5rem;
      background-color: #ffa305;
      color: white;
    }

    &+div {
      font-size: 12px;
      justify-content: end;
      margin-right: 6px;
      margin-top: 3px;
      color: #999;
    }
  }

  .message-assistant {
    width: 90%;
    margin-right: auto;

    & .content {
      border-radius: 0 0.5rem 0.5rem 0.5rem;
    }

    &+div {
      font-size: 12px;
      justify-self: start;
      margin-left: 6px;
      margin-top: 3px;
      color: #999;
    }
  }
}

.bot-input {
  width: 100%;
  display: flex;
  height: 60px;
  box-shadow: 0 -1px 2px 0 rgba(201, 201, 201, 0.2);
  box-sizing: border-box;
  padding-left: 18px;
  padding-right: 10px;

  input {
    flex: 1;
    border: none;

    &:focus {
      border: none;
      outline: none;
    }
  }

  button {
    height: 100%;
    border: none;
    aspect-ratio: 1/1;
    background-color: transparent;
  }

}
</style>
