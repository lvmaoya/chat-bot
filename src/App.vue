<script setup lang="ts">
import ChatWidget from './lib/ChatWidget.vue';

// 示例属性，可根据需要调整
const endpointUrl = "http://webchat-bot-t9rx.fcv3.1486648470098031.cn-hangzhou.fc.devsapp.net/chat";
const greetings = ['Hi, there! Lvmaoya is at your service! How can I assist you today?'];
const questions = [
  "What is the capital of France",
  "Who is the most handsome person in the world",
  "Please share a story with me",
  "Tell me a joke",
  "Introduce yourself",
];
</script>

<template>
  <!-- 开发预览用的示例壳：直接使用库组件 -->
  <ChatWidget :bubble="false" :endpointUrl="endpointUrl" :greetings="greetings" :questions="questions" />
</template>

<style>
/* 可添加示例壳的全局样式（此处留空即可） */
</style>
