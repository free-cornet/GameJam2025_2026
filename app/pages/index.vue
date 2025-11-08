<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center"
  >
    <div class="text-center">
      <!-- Loading Title -->
      <h1 class="text-4xl md:text-6xl font-bold text-white mb-8 animate-pulse">
        Loading Game
      </h1>

      <!-- Progress Bar Container -->
      <div class="w-80 md:w-96 mx-auto mb-6">
        <div class="bg-gray-700 rounded-full h-4 overflow-hidden shadow-lg">
          <div
            class="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Percentage Display -->
      <div class="text-2xl md:text-3xl font-semibold text-white mb-4">
        {{ percentage }}%
      </div>

      <!-- Loading Dots Animation -->
      <div class="flex justify-center space-x-2">
        <div class="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
        <div
          class="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
          style="animation-delay: 0.1s"
        ></div>
        <div
          class="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"
          style="animation-delay: 0.2s"
        ></div>
      </div>

      <!-- Loading Message -->
      <p class="text-gray-300 mt-6 text-lg">
        {{ loadingMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const percentage = ref(0);
const loadingMessage = ref("Initializing...");
let intervalId = null;
let timeoutId = null;
let finalCountdownId = null;

const loadingMessages = [
  "Initializing...",
  "Loading assets...",
  "Preparing game world...",
  "Setting up environment...",
  "Loading textures...",
  "Initializing audio...",
  "Loading game data...",
  "Almost ready...",
  "Finalizing...",
];

const updateLoadingMessage = (percent) => {
  if (percent < 20) {
    loadingMessage.value = loadingMessages[0];
  } else if (percent < 40) {
    loadingMessage.value = loadingMessages[1];
  } else if (percent < 55) {
    loadingMessage.value = loadingMessages[2];
  } else if (percent < 70) {
    loadingMessage.value = loadingMessages[3];
  } else if (percent < 80) {
    loadingMessage.value = loadingMessages[4];
  } else if (percent < 90) {
    loadingMessage.value = loadingMessages[5];
  } else if (percent < 99) {
    loadingMessage.value = loadingMessages[6];
  } else if (percent === 99) {
    loadingMessage.value = loadingMessages[7];
  } else {
    loadingMessage.value = loadingMessages[8];
  }
};

const startLoading = () => {
  intervalId = setInterval(() => {
    if (percentage.value < 99) {
      // Simulate realistic loading with variable speed
      if (percentage.value < 30) {
        percentage.value += Math.random() * 3 + 1; // Fast initial loading
      } else if (percentage.value < 70) {
        percentage.value += Math.random() * 2 + 0.5; // Medium speed
      } else {
        percentage.value += Math.random() * 1 + 0.2; // Slower as it approaches 99%
      }

      // Ensure we don't exceed 99%
      if (percentage.value >= 99) {
        percentage.value = 99;
        updateLoadingMessage(99);

        // Stay at 99% for most of the 30 seconds, then do final sequence
        timeoutId = setTimeout(() => {
          // Start final countdown sequence - go back a bit then finish
          let countdown = 0;
          finalCountdownId = setInterval(() => {
            countdown += 200;
            
            if (countdown < 2000) {
              // First 2 seconds: drop back to ~95%
              percentage.value = 99 - (countdown / 2000) * 4;
              loadingMessage.value = "Optimizing final assets...";
            } else if (countdown < 4000) {
              // Next 2 seconds: climb back up to 100%
              const progress = (countdown - 2000) / 2000;
              percentage.value = 95 + (progress * 5);
              loadingMessage.value = "Finalizing...";
            } else {
              // Ensure we're at exactly 100%
              percentage.value = 100;
              updateLoadingMessage(100);
              clearInterval(finalCountdownId);
              
              // Navigate to game page after brief delay
              setTimeout(() => {
                console.log("Loading complete! Navigating to game...");
                // Navigate to a game page (you can change this route)
                navigateTo('/game');
              }, 1000);
            }
          }, 200);
        }, 26000); // Start final sequence after 26 seconds (4 seconds before the full 30)

        clearInterval(intervalId);
      } else {
        updateLoadingMessage(Math.floor(percentage.value));
      }
    }
  }, 100); // Update every 100ms
};

onMounted(() => {
  startLoading();
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
  if (finalCountdownId) clearInterval(finalCountdownId);
});
</script>

<style scoped>
@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}
</style>
