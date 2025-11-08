<template>
  <div class="character" :class="{ walking: isWalking }"></div>
</template>

<script setup>
const isWalking = ref(false)

onMounted(() => {
  // setInterval(() => {
  //   isWalking.value = !isWalking.value
  // }, 600)
  isWalking.value = !isWalking.value
})
</script>

<style scoped>
.character {
  width: 16px;
  height: 16px;
  background-image: url('../assets/walking.png');
  background-repeat: no-repeat;
}

.character.walking {
  animation: walk 0.6s steps(8) infinite;
}

@keyframes walk {
  from { background-position: 0px 0px; }
  to { background-position: -128px 0px; }
}
</style>