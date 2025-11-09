<script setup lang="ts">

</script>

<template>
  <div id="rootDiv" class="bg-gradient-to-br from-black via-gray-800 to-black min-h-screen">
    <!-- <NuxtRouteAnnouncer /> -->
    <NuxtPage />
  </div>
</template>

<style scoped>
#rootDiv {
  background-image: url('/background.jpg');
  background-size: cover;
}

@font-face {
    font-family: Cardinal;
    src: url('/Cardinal.ttf');
}
</style>
