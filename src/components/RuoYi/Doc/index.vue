<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://github.com/NewStart-c/GymPal-Front')
// 暂无

function goto() {
  window.open(url.value)
}
</script>