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
        <div class="relative bg-gray-700 rounded-full h-4 overflow-visible shadow-lg">
          <div
            class="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full transition-all duration-500 ease-out relative"
            :style="{ width: `${Math.min(100, displayPercentage)}%` }"
          >
            <!-- Knight Image -->

            <div
              class="absolute top-1/2 -translate-y-1/2 right-0  w-24 h-20 duration-500 ease-out"
              :style="{ top: 'calc(50% - 5px)' }"
            ><img
              src="../assets/knight.png"
              alt="Knight"
              class="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 w-24 h-20 duration-500 ease-out"
              :style="{ transform: `translateY(-50%) translateX(50%) rotate(${Math.sin(percentage * 3.6)*100}deg)` }"
            /></div>
          </div>
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

      <!-- Loading Message with dots -->
      <p class="text-gray-300 mt-6 text-lg w-screen overflow-hidden">
        {{ loadingMessage }}
        <span class="relative">
          <span class="absolute left-0 text-left">
            {{ dots }}
          </span>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";

// Global configuration variables for timings
const LOADING_UPDATE_INTERVAL = 100; // ms - how often the main loading updates
const NINE_APPEND_INTERVAL = 300; // ms - how often to add a new 9 and dot
const DOTS_APPEND_INTERVAL = 4; // ms - how often to add a dot
// TODO use first one
const INITIAL_LOADING_SPEED = { fast: 3, fastMedium: 1, medium: 2, mediumSlow: 0.5, slow: 1, slowMin: 0.2 };
// const INITIAL_LOADING_SPEED = { fast: 30, fastMedium: 10, medium: 20, mediumSlow: 0.5, slow: 10, slowMin: 0.2 };
const STAY_AT_99_DURATION = 30000; // ms - how long to stay at 99.999... before going backwards
const BACKWARD_DURATION = 4000; // ms - total time to go from 99% back to 69% and then to 100%

const percentage = ref("0");
const loadingMessage = ref("Initializing...");
const dots = ref("");
let intervalId = null;
let timeoutId = null;
let nineAppendIntervalId = null;
let dotsAppendIntervalId = null;
let backwardIntervalId = null;
let dotCount = ref(0);

const displayPercentage = computed(() => {
  return parseFloat(percentage.value);
});

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
    const currentValue = parseFloat(percentage.value);
    
    if (currentValue < 99) {
      // Simulate realistic loading with variable speed
      let increment = 0;
      if (currentValue < 30) {
        increment = Math.random() * INITIAL_LOADING_SPEED.fast + INITIAL_LOADING_SPEED.fastMedium; // Fast initial loading
      } else if (currentValue < 70) {
        increment = Math.random() * INITIAL_LOADING_SPEED.medium + INITIAL_LOADING_SPEED.mediumSlow; // Medium speed
      } else {
        increment = Math.random() * INITIAL_LOADING_SPEED.slow + INITIAL_LOADING_SPEED.slowMin; // Slower as it approaches 99%
      }

      const newValue = currentValue + increment;

      // Ensure we don't exceed 99%
      if (newValue >= 99) {
        percentage.value = "99.";
        updateLoadingMessage(99);

        // Start appending 9s every NINE_APPEND_INTERVAL ms
        nineAppendIntervalId = setInterval(() => {
          percentage.value += "9";
        }, NINE_APPEND_INTERVAL);

        // Start appending dots every DOTS_APPEND_INTERVAL ms
        dotsAppendIntervalId = setInterval(() => {
          if (dots.value.length < 1000)
            dots.value += ".";
        }, DOTS_APPEND_INTERVAL);

        clearInterval(intervalId);

        // After STAY_AT_99_DURATION, start going backwards
        timeoutId = setTimeout(() => {
          clearInterval(nineAppendIntervalId);
          clearInterval(dotsAppendIntervalId);
          startBackwardLoading();
        }, STAY_AT_99_DURATION);
      } else {
        percentage.value = newValue.toString();
        updateLoadingMessage(Math.floor(newValue));
      }
    }
  }, LOADING_UPDATE_INTERVAL); // Update every LOADING_UPDATE_INTERVAL ms
};

const startBackwardLoading = () => {
  const startTime = Date.now();
  const startPercentage = 99;
  const endPercentage = 69;
  const midway = BACKWARD_DURATION * 0.75; // 3 seconds to go to 69%
  const finalDuration = BACKWARD_DURATION * 0.25; // 1 second to go from 69% to 100%

  backwardIntervalId = setInterval(() => {
    const elapsed = Date.now() - startTime;

    if (elapsed < midway) {
      // Go backwards from 99% to 69% in first 3 seconds
      const progress = elapsed / midway;
      const newValue = startPercentage - (startPercentage - endPercentage) * progress;
      percentage.value = newValue.toFixed(2);
      dots.value = "";
      loadingMessage.value = loadingMessages[7];
    } else if (elapsed < BACKWARD_DURATION) {
      // Go from 69% to 100% in last 1 second
      const progress = (elapsed - midway) / finalDuration;
      const newValue = endPercentage + (100 - endPercentage) * progress;
      percentage.value = newValue.toFixed(2);
    } else {
      // Complete loading
      percentage.value = "100";
      dots.value = "";
      loadingMessage.value = loadingMessages[8];
      clearInterval(backwardIntervalId);

      // Navigate to next page
      navigateTo('/game');
    }
  }, LOADING_UPDATE_INTERVAL);
};

onMounted(() => {
  startLoading();
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
  if (nineAppendIntervalId) clearInterval(nineAppendIntervalId);
  if (dotsAppendIntervalId) clearInterval(dotsAppendIntervalId);
  if (backwardIntervalId) clearInterval(backwardIntervalId);
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
