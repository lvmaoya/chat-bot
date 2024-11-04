<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { refreshIcon, closeIcon } from './assets/svgIcons';
import { handlePostRequestWithEventStream, ReceiveState } from './api';
import { formatLocalTime } from "./utils";
import Loading from './loading.vue';
import MarkdownIt from "markdown-it";
import { notice } from './config';

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
      break;
    case ReceiveState.update:
      clearInputValue();
      chatMessages.value[chatMessages.value.length - 1].message += value
      break;
    case ReceiveState.error:
      isLoading.value = false
      console.log(value);
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
const chatMessages = ref([
  {
    role: Role.system,
    message: notice,
    time: 0
  },
  {
    role: Role.assistant,
    message: 'CEEG Customer Service is at your service! How can I assist you today?',
    time: 0
  },
  {
    role: Role.assistant,
    message: `\###### Questions and Answers： - \[What is the capital of France\](https://lvmaoya.cn/home) - \[Who is the most handsome person in the world\](https://lvmaoya.cn/home) - \[Please share a story with me\](https://lvmaoya.cn/home) - \[Tell me a joke\](https://lvmaoya.cn/home) - \[Introduce yourself\](https://lvmaoya.cn/home)`,
    time: 0
  }
]);
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

watch(chatMessages.value, () => nextTick(() => scrollToBottom()));

</script>

<template>
  <div class="bot-trigger" @click="onBubbleClick" :class="{ 'hidden': isBotContainerVisible }">

    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5423" width="35" height="35">
      <path
        d="M240 658.08h220.784l55.744 65.04 55.744-65.04h220.768V272H240v386.08z m-48 32V240a16 16 0 0 1 16-16h617.04a16 16 0 0 1 16 16v450.08a16 16 0 0 1-16 16H594.336l-65.664 76.64a16 16 0 0 1-24.304 0l-65.664-76.64H208a16 16 0 0 1-16-16zM366.256 498.56a33.488 33.488 0 1 1 0-66.992 33.488 33.488 0 0 1 0 66.992z m150.272 0a33.488 33.488 0 1 1 0-66.992 33.488 33.488 0 0 1 0 66.992z m150.24 0a33.488 33.488 0 1 1 0-66.992 33.488 33.488 0 0 1 0 66.992z"
        fill="#ffffff" p-id="5424"></path>
    </svg>
  </div>
  <div class="bot-containner" :class="{ 'bot-containner-show': isBotContainerVisible }">
    <div class="bot-header">
      <div class="logo">
        <img src="https://www.ceeg.cn/en/assets/v1/2024-9/upload/logo.svg" alt="ceeg" />
      </div>
      <div class="toolbar">
        <button v-html="refreshIcon">
        </button>
        <button v-html="closeIcon" @click="onCloseDialogClick">
        </button>
      </div>
    </div>
    <div class="bot-content" ref="scrollContainer">
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
        <svg t="1730631079572" :style="{ fill: inputValue && inputValue.trim() !== '' && !isLoading ? '#666' : '#999' }"
          viewBox="0 0 1045 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6607" width="21" height="21">
          <path
            d="M989.184 87.530667c30.421333-10.154667 60.736 15.637333 55.594667 47.296l-128 789.333333a42.666667 42.666667 0 0 1-63.082667 30.336l-340.736-192.213333-154.837333 66.282666a42.666667 42.666667 0 0 1-59.349334-36.181333L298.666667 789.269333l0.256-147.733333-277.226667-156.373333c-31.168-17.6-27.882667-62.890667 4.181333-76.394667l3.306667-1.237333z m-39.936 103.232L147.349333 458.069333l215.253334 121.408a42.666667 42.666667 0 0 1 21.546666 33.706667l0.149334 3.541333-0.192 107.882667 114.666666-49.066667a42.666667 42.666667 0 0 1 34.218667 0.277334l3.541333 1.792 305.792 172.501333 106.922667-659.349333z m-127.146667 123.264a42.666667 42.666667 0 0 1-2.858666 57.728l-2.602667 2.346666-256 213.333334a42.666667 42.666667 0 0 1-57.216-63.189334l2.602667-2.346666 256-213.333334a42.666667 42.666667 0 0 1 60.074666 5.461334z"
            p-id="6608"></path>
        </svg>
      </button>
    </div>
  </div>
</template>
<style>
p {
  padding: 0;
  margin: 0;
}

.bot-containner {
  color: #171a20;
}

.hidden {
  display: none;
}
</style>
<style scoped>
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
  /* background-color: red; */
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
  transition: opacity .5s transform .5s;
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

    img {
      width: 170px;
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
