<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-white mb-8 animate-pulse">
        🎮 Game Ready!
      </h1>
      
      <p class="text-xl text-gray-300 mb-8">
        Welcome to the game! Loading completed successfully.
      </p>
      
      <div class="space-y-4">
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300">
          Start Game
        </button>
        
        <br>
        
        <button 
          @click="goBack" 
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
        >
          Back to Loading
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const goBack = () => {
  navigateTo('/')
}
</script>