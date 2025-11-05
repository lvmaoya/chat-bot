<script setup lang="ts">
import { computed, nextTick, onBeforeMount, ref, watch } from "vue";
import { refreshIcon, closeIcon } from "../assets/icons/svgIcons";
import { handlePostRequestWithEventStream, ReceiveState } from "../api";
import { formatLocalTime } from "../utils";
import Loading from "./Loading.vue";
import MarkdownIt from "markdown-it";
import {
  HISTORY,
  KEEP_STORAGE_SIZE,
  LAST_CONVERSATION_TIME,
  MAX_STORAGE_SIZE,
  MAX_TIME_INTERVAL,
  SESSION_ID,
} from "../config";
enum Role {
  user = "user",
  assistant = "assistant",
  system = "system",
}
const props = defineProps({
  endpointUrl: {
    type: String,
    required: true,
  },
  botName: {
    type: String,
    default: "Lvmaoya",
  },
  greetings: {
    type: Array,
    default: () => [
      "Hi, there! {{botName}} is at your service! How can I assist you today?",
    ],
  },
  questions: {
    type: Array<string>,
    default: () => [],
  },
});

const isBotContainerVisible = ref(false);
const onBubbleClick = () => {
  isBotContainerVisible.value = true;
};

const inputValue = ref("");
const isLoading = ref(false);

const receiver = (state: ReceiveState, value: any) => {
  console.log(state, value);
  switch (state) {
    case ReceiveState.complete:
      isLoading.value = false;
      setHistory();
      break;
    case ReceiveState.update:
      chatMessages.value[chatMessages.value.length - 1].message += value;
      break;
    case ReceiveState.error:
      isLoading.value = false;
      chatMessages.value[chatMessages.value.length - 1].message += value;
      setHistory();
      break;
    default:
      break;
  }
};

const clearInputValue = () => {
  if (inputValue.value !== "") {
    inputValue.value = "";
  }
};

const addMessage = (role: Role, message: any, time: number) => {
  chatMessages.value.push({ role, message, time });
};

const handleSubmit = async () => {
  if (inputValue.value.trim() === "" || isLoading.value) return;
  isLoading.value = true;
  addMessage(Role.user, inputValue.value, Date.now());
  addMessage(Role.assistant, "", Date.now());
  handlePostRequestWithEventStream(
    props.endpointUrl,
    inputValue.value,
    receiver
  );
  clearInputValue();
};

const chatMessages = ref<Array<{ role: Role; message: string; time: number }>>(
  []
);

const scrollContainer = ref<HTMLElement | null>(null);
const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};
const onCloseDialogClick = () => {
  isBotContainerVisible.value = false;
};
const markdown = new MarkdownIt({
  linkify: true,
  breaks: true,
});

const onPromptClick = (value: string) => {
  inputValue.value = value;
  handleSubmit();
};

// 刷新聊天记录
const onRefreshClick = () => {
  if (isLoading.value) return;
  chatMessages.value.length = 0;
  sessionStorage.removeItem(SESSION_ID);
  localStorage.removeItem(HISTORY);
  localStorage.removeItem(LAST_CONVERSATION_TIME);
};

// 保存聊天记录
const setHistory = () => {
  let historyList = [...chatMessages.value];
  if (historyList.length > MAX_STORAGE_SIZE) {
    historyList = historyList.slice(-KEEP_STORAGE_SIZE);
  }
  localStorage.setItem(HISTORY, JSON.stringify(historyList));
  localStorage.setItem(LAST_CONVERSATION_TIME, new Date().getTime().toString());
};
// 从本地存储获取聊天记录
const getHistory = () => {
  let lastConversationTime = localStorage.getItem(LAST_CONVERSATION_TIME);
  const currentTime = new Date().getTime();
  if (
    lastConversationTime &&
    currentTime - parseInt(lastConversationTime, 10) > MAX_TIME_INTERVAL
  ) {
    localStorage.removeItem(HISTORY);
  } else {
    chatMessages.value.push(
      ...JSON.parse(localStorage.getItem(HISTORY) || "[]")
    );
  }
};

onBeforeMount(() => {
  getHistory();
  isMobile.value =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
});

const isMobile = ref(false);

watch(
  chatMessages,
  () => {
    nextTick(() => scrollToBottom());
  },
  { deep: true }
);
const autoResize = (e: any) => {
  const textarea = e.target;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};
</script>

<template>
  <div>
    <div
      class="bot-trigger"
      @click="onBubbleClick"
      :class="{ hidden: isBotContainerVisible }"
    >
      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="5423"
        width="35"
        height="35"
      >
        <path
          d="M240 658.08h220.784l55.744 65.04 55.744-65.04h220.768V272H240v386.08z m-48 32V240a16 16 0 0 1 16-16h617.04a16 16 0 0 1 16 16v450.08a16 16 0 0 1-16 16H594.336l-65.664 76.64a16 16 0 0 1-24.304 0l-65.664-76.64H208a16 16 0 0 1-16-16zM366.256 498.56a33.488 33.488 0 1 1 0-66.992 33.488 33.488 0 0 1 0 66.992z m150.272 0a33.488 33.488 0 1 1 0-66.992 33.488 33.488 0 0 1 0 66.992z m150.24 0a33.488 33.488 0 1 1 0-66.992 33.488 33.488 0 0 1 0 66.992z"
          fill="#ffffff"
          p-id="5424"
        ></path>
      </svg>
    </div>
    <div
      class="bot-containner"
      :class="{
        'bot-containner-show': isBotContainerVisible,
        'bot-mobile-container': isMobile,
      }"
    >
      <div class="bot-header">
        <div class="logo">
          <span>{{ props.botName }}</span>
        </div>
        <div class="toolbar">
          <button v-html="refreshIcon" @click="onRefreshClick"></button>
          <button v-html="closeIcon" @click="onCloseDialogClick"></button>
        </div>
      </div>
      <div class="bot-content" ref="scrollContainer">
        <div class="message-item" v-for="item in props.greetings">
          <div class="message-assistant">
            <div class="content">
              <p>{{ item }}</p>
            </div>
          </div>
        </div>
        <div
          class="message-item message-question"
          v-if="props.questions.length"
        >
          <div class="message-assistant">
            <div class="content">
              <p>Questions and Answers:</p>
              <ul>
                <li
                  v-for="item in props.questions"
                  @click="onPromptClick(item)"
                >
                  <p>{{ item }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          v-for="(item, index) in chatMessages"
          :key="index"
          class="message-item"
        >
          <div
            :class="{
              'message-user': item.role === Role.user,
              'message-assistant': item.role === Role.assistant,
            }"
            v-if="item.role === Role.user || item.role === Role.assistant"
          >
            <div
              class="content"
              v-if="item.message"
              v-html="markdown.render(item.message)"
            ></div>
            <div class="content" v-else-if="isLoading">
              <p>
                <Loading></Loading>
              </p>
            </div>
          </div>
          <div
            :class="{ 'message-system': item.role === Role.system }"
            v-else-if="item.role === Role.system && item.message"
          >
            <div v-html="item.message"></div>
          </div>
          <div v-if="item.message">{{ formatLocalTime(item.time) }}</div>
        </div>
      </div>
      <div class="bot-input">
        <textarea
          rows="1"
          v-model="inputValue"
          @keydown.enter.exact.prevent="handleSubmit"
          placeholder="Please enter your questions"
          @input="autoResize"
        />
        <button
          @click="handleSubmit"
          :class="{
            disabled: !(inputValue && inputValue.trim() !== '' && !isLoading),
          }"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            class="icon"
          >
            <path
              d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.bot-trigger {
  &.hidden {
    display: none !important;
  }
  position: fixed;
  width: 50px;
  height: 40px;
  border-radius: 4px;
  background-color: #000000f2;
  bottom: 40px;
  right: 40px;
  transition: 0.3s;
  cursor: pointer;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #000000ab;
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
  color: #333;
  border-radius: 16px;
  overflow: hidden;
  opacity: 0.1;
  transform: translateY(120%);
  transition: all 0.5s;
  z-index: 9999999;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: white;

  // 基于 Chrome UA 默认样式的局部基础标签规则
  a {
    color: #333;
    text-decoration: underline;
    outline: none;
  }
  img {
    border: 0;
  }
  p {
    display: block;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    unicode-bidi: isolate;
    line-height: 1.9;
  }
  ul {
    display: block;
    list-style-type: disc;
    margin-block-start: 1em;
    margin-block-end: 1em;
    padding-inline-start: 40px;
    unicode-bidi: isolate;
  }
  pre {
    background-color: #333;
    padding: 12px;
    border-radius: 8px;
    max-width: 350px;
    overflow-x: auto;
    &::-webkit-scrollbar {
      -webkit-appearance: none;
      width: 4px;
      height: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 0;
    }
    &::-webkit-scrollbar-thumb {
      cursor: pointer;
      border-radius: 5px;
      background: rgba(0, 0, 0, 0.1);
      transition: color 0.2s ease;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.5);
    }
    code {
      background-color: transparent;
      padding: 0;
      font-size: 12px;
      line-height: 22px;
      color: #fff;
    }
  }
  .bot-header {
    height: 70px;
    display: flex;
    padding-left: 20px;
    padding-right: 10px;
    align-items: center;
    justify-content: space-between;
    .logo {
      line-height: 0;
      display: flex;
      align-items: center;
      user-select: none;
      span {
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
        padding: 0;
        background-color: transparent;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        border-color: transparent;
        transition: all 0.2s;
        cursor: pointer;

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

      & > div {
        display: flex;
        gap: 10px;
      }
      .content {
        width: fit-content;
        background-color: #f4f4f4;
        padding: 0 14px;
        font-size: 14px;
      }
    }

    &::-webkit-scrollbar {
      -webkit-appearance: none;
      width: 4px;
      height: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 0;
    }
    &::-webkit-scrollbar-thumb {
      cursor: pointer;
      border-radius: 5px;
      background: rgba(0, 0, 0, 0.1);
      transition: color 0.2s ease;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.5);
    }

    .message-user {
      width: 90%;
      margin-left: auto;
      justify-content: end;

      .content {
        border-radius: 0.5rem 0 0.5rem 0.5rem;
        background-color: #ffa305;
        p {
          color: white;
        }
      }
      + div {
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

      .content {
        border-radius: 0 0.5rem 0.5rem 0.5rem;
      }
      + div {
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
    align-items: center;
    box-shadow: 0 -1px 2px 0 rgba(201, 201, 201, 0.2);
    box-sizing: border-box;
    padding: 8px 0;
    textarea {
      flex: 1;
      min-height: 44px;
      border: none;
      margin-left: 12px;
      padding: 12px 0;
      outline: 0;
      background-color: transparent;
      font-size: 14px;
      resize: none;
      max-height: 100px;
      box-sizing: border-box;
      &::placeholder {
        color: #999;
        font-size: 13px;
      }
      &:focus {
        border: none;
        outline: none;
        box-shadow: none;
      }
      &::-webkit-scrollbar {
        -webkit-appearance: none;
        width: 2px;
        height: 2px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 0;
      }
      &::-webkit-scrollbar-thumb {
        cursor: pointer;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.1);
        transition: color 0.2s ease;
      }
      &::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.5);
      }
    }

    button {
      width: 2.5rem;
      height: 2.5rem;
      padding: 0;
      margin: 0 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background-color: #333;
      svg {
        fill: #fff;
      }
      &.disabled {
        cursor: not-allowed;
        background-color: #f4f4f4;
        svg {
          fill: #999;
        }
      }
    }
  }
}

.bot-containner-show {
  opacity: 1;
  transform: translateY(0%);
  transition: opacity 0.5s, transform 0.5s;
}
.bot-mobile-container {
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  border-radius: 16px 16px 0 0;
}
</style>
