<script setup lang="ts">


</script>

<template>
    <div class="loading">
        <div></div>
        <div></div>
        <div></div>
    </div>
</template>

<style scoped>
.loading,
.loading>div {
    position: relative;
    box-sizing: border-box;
}

.loading {
    display: block;
    font-size: 0;
    color: #999;
}

.loading.la-dark {
    color: #999;
}

.loading>div {
    display: inline-block;
    float: none;
    background-color: currentColor;
    border: 0 solid currentColor;
}

.loading {
    line-height: 0;
}

.loading>div:nth-child(1) {
    animation-delay: -200ms;
}

.loading>div:nth-child(2) {
    animation-delay: -100ms;
}

.loading>div:nth-child(3) {
    animation-delay: 0ms;
}

.loading>div {
    width: 3px;
    height: 3px;
    margin: 3px;
    border-radius: 100%;
    animation: ball-pulse 1s ease infinite;
}

.loading.la-sm {
    width: 26px;
    height: 8px;
}

.loading.la-sm>div {
    width: 4px;
    height: 4px;
    margin: 2px;
}

.loading.la-2x {
    width: 108px;
    height: 36px;
}

.loading.la-2x>div {
    width: 20px;
    height: 20px;
    margin: 8px;
}

.loading.la-3x {
    width: 162px;
    height: 54px;
}

.loading.la-3x>div {
    width: 30px;
    height: 30px;
    margin: 12px;
}

@keyframes ball-pulse {

    0%,
    60%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    30% {
        opacity: 0.1;
        transform: scale(0.01);
    }
}
</style>
