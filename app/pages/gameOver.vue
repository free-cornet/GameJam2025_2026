<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-white mb-8" style="font-family: Cardinal;">
        Game Over !!
      </h1>
      
      <p class="text-xl text-gray-300 mb-8">
        Le problème se trouve toujours entre la chaise et l'écran
      </p>
      
      <div class="space-y-8">
        <button 
        @click="goBack" 
        class="hover:opacity-80 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 bg-contain bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${button1})`, scale: 1.7}">
          <div style="scale: 0.8;">Retry</div>
        </button>
        
        <br>
        
        <button 
          @click="quit" 
          class="hover:opacity-80 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 bg-contain bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${button1})`, scale: 1.7}">
          <div style="scale: 0.8;">Quit</div>
        </button>
      </div>
    </div>
  </div>
</template>
<style>
@font-face {
    font-family: Cardinal;
    src: url('../assets/Cardinal.ttf');
}
</style>

<script setup>
import button1 from '../assets/button1.png';
import button2 from '../assets/button2.png';
import button3 from '../assets/button3.png';
import button4 from '../assets/button4.png';

const goBack = () => {
  navigateTo('/game')
}
const quit = () => {
  navigateTo('/')
}
</script>