<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { refreshIcon, closeIcon, stopIcon } from './assets/svgIcons';
import { handlePostRequestWithEventStream } from './api';

const isBotContainerVisible = ref(true);
const onBubbleClick = () => {
  isBotContainerVisible.value = !isBotContainerVisible.value;
  console.log(isBotContainerVisible.value);
}

const inputValue = ref('');
const handleSubmit = () => {
  console.log(inputValue.value);
  chatMessages.value.push({
    role: 'user',
    message: inputValue.value
  },)
  // 在下一帧执行滚动操作
  nextTick(() => {
    scrollToBottom();
  });
  handlePostRequestWithEventStream("http://webchat-bot-5hzt.fcv3.1660096712492796.cn-hangzhou.fc.devsapp.net/chat", { prompt: 'hello' });
};
const chatMessages = ref([
  {
    role: 'user',
    message: 'What\'s the capital of Antartica?'
  },
  {
    role: 'assistant',
    message: 'Arrr, matey! The **capital** of _Antarctica_ be none other than `"Arrrctica"`, where ye can find a jolly crew of penguins swashbuckling on icy seas!'
  }
]);
const scrollContainer = ref();

const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};
</script>

<template>
  <div class="bot-trigger" @click="onBubbleClick">

  </div>
  <div class="bot-containner" :class="{ 'bot-containner-show': isBotContainerVisible }">
    <div class="bot-header">
      <div class="logo">
        <img src="https://www.ceeg.cn/en/assets/v1/2024-9/upload/logo.svg" alt="ceeg" />
      </div>
      <div class="toolbar">
        <button v-html="refreshIcon">
        </button>
        <button v-html="closeIcon">
        </button>
      </div>
    </div>
    <div class="bot-content" ref="scrollContainer">
      <div v-for="(item, index) in chatMessages" :key="index" class="message-item">
        <div
          :class="{ 'message-user': item.role === 'user', 'message-assistant': item.role === 'assistant', 'message-system': item.role === 'system' }">
          <div class="avatar" :class="item.role">{{ item.role }}</div>
          <div class="content" v-html="item.message"></div>
        </div>
      </div>
    </div>
    <div class="bot-input">
      <input type="text" v-model="inputValue" @keyup.enter="handleSubmit" placeholder="输入并按 Enter 提交">
      <button @click="handleSubmit">提交</button>
    </div>
  </div>
</template>

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
  display: none;
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
  width: 430px;
  height: 600px;
  position: fixed;
  bottom: 24px;
  right: 24px;
  box-shadow: 0 4px 8px 0 #00000029;
  /* background-color: red; */
  border-radius: 16px;
  overflow: hidden;
  opacity: 0.1;
  transform: translateY(120%);
  transition: all .5s;
  z-index: 9999999;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
}

.bot-containner-show {
  opacity: 1;
  transform: translateY(0%);
  transition: opacity .5s transform .5s;
}

.bot-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .logo img {
    width: 170px;
  }

  .toolbar {
    svg {
      font-size: 18px;
      fill: #333;
    }
  }
}

.bot-content {
  flex: 1;
  background-color: gray;
  overflow-y: scroll;

  .message-item {
    display: flex;
    padding: 10px 0px;

    &>div {
      display: flex;
      gap: 10px;
    }

    &>div:not(.message-assistant) {
      flex-direction: row-reverse;
    }

    .avatar {
      width: 40px;
      height: 40px;
      background-color: red;
      border-radius: 50%;
    }
  }

  .message-user {
    width: 90%;
    background-color: #eb9402;
    margin-left: auto;

  }

  .message-assistant {
    width: 90%;
    background-color: #eb9402;
    margin-right: auto;
  }
}

.bot-input {
  width: 100%;
  display: flex;
  background-color: red;
  height: 60px;

  input {
    flex: 1;
    border: none;

    &:focus {
      border: none;
      outline: none;
    }
  }
}
</style>
