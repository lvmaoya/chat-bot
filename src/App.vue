<script setup lang="ts">
import ChatWidget from './lib/components/ChatWidget.vue';

// 示例属性，可根据需要调整
const endpointUrl = "http://localhost:8080/h5/chat/rag/stream";
const greetings = ['Hi, there! Lvmaoya is at your service! How can I assist you today?'];
const questions = [
  "What is the capital of France",
  "Who is the most handsome person in the world",
  "Please share a story with me",
  "Tell me a joke",
  "Introduce yourself",
];
const placeholder = 'Please enter your questions';
const botName = 'Lvmaoya';
</script>

<template>
  <!-- 开发预览用的示例壳：直接使用库组件 -->
  <ChatWidget :endpointUrl="endpointUrl" :greetings="greetings" :questions="questions" :botName="botName" :placeholder="placeholder" />
</template>

<style>
/* 可添加示例壳的全局样式（此处留空即可） */
</style>
