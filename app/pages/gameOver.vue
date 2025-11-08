<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-white mb-8 animate-pulse">
        Game Over !!
      </h1>
      
      <p class="text-xl text-gray-300 mb-8">
        Le problème se trouve toujours entre la chaise et l'écran
      </p>
      
      <div class="space-y-4">
        <button 
        @click="goBack" 
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300">
          Retry
        </button>
        
        <br>
        
        <button 
          @click="quit" 
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
        >
          Quit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const goBack = () => {
  navigateTo('/game')
}
const quit = () => {
  navigateTo('/')
}
</script>