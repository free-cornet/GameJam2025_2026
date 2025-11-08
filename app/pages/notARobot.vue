<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
    <div class="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center transition-all duration-300">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Humanity check</h1>

      <div class="flex items-center justify-center space-x-4 mb-4 cursor-pointer" @click="handleClick">
        <div
         class="relative w-10 h-10 rounded-md flex items-center justify-center transition-all duration-300"
          :class="{
            'border-2 border-gray-400 bg-white hover:shadow-md': !isLoading && !isVerified,
            'bg-gradient-to-tr from-blue-500 to-blue-300': isLoading,
            'bg-green-500': isVerified
          }"
        >
          <div
            v-if="isLoading"
            class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          <div
            v-else-if="isVerified"
            class="text-white text-xl font-bold animate-bounce"
          >
            ✓
          </div>
        </div>
        <div class="group relative w-max">
          <span v-if="doneNumber < 2" class="text-lg font-semibold text-gray-700">I am not a robot</span>

          <div v-if="doneNumber >= 2 && !isVerified" class="relative">
            <span class="block whitespace-nowrap text-lg font-semibold text-gray-700 group-hover:opacity-0 transition-opacity ">
              I am a robot
            </span>
            <span class="absolute block whitespace-nowrap top-0 left-0 text-lg font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" @click="validate">
              I am not a robot
            </span>
          </div>  

          <span v-if="isVerified" class="text-lg font-semibold text-gray-700">I am not a robot</span>
      </div>
      </div>
      

      <p v-if="isLoading" class="text-sm text-red-500 mb-4 animate-pulse">Verifying...</p>

      <p v-if="doneNumber === 1 && !isVerified && !isLoading" class="text-sm text-red-600 mb-4">We have some doubt...</p>

      <p v-if="doneNumber === 2 && !isVerified && !isLoading" class="text-sm text-red-600 mb-4">An error occured, please try again.</p>

      <p v-if="doneNumber >= 3 && !isVerified && !isLoading" class="text-sm text-red-600 mb-4">So, you're a robot ? (read the sentence better)</p>

      <p v-if="resultMessage" class="mt-4 text-lg font-medium" :class="resultColor">
        {{ resultMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isLoading = ref(false);
const isVerified = ref(false);
const resultMessage = ref('');
const resultColor = ref('');
var doneNumber = 0;

const validate = () => {
  if (isVerified.value || isLoading.value) return;
  isLoading.value = true;

  setTimeout(() => {
    if (doneNumber >= 2) {
      isLoading.value = false;
      isVerified.value = true;
    }
  }, 8000); // Simulate 5-second verification
};

const handleClick = () => {
  if (isVerified.value || isLoading.value) return;
  isLoading.value = true;

  setTimeout(() => {
    if (doneNumber < 3) {
      isLoading.value = false;
      isVerified.value = false;
      doneNumber += 1;
    } else {
      isLoading.value = false;
      isVerified.value = false;
    }
  }, 5000); // Simulate 5-second verification
};

</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 0.6s linear infinite;
}

</style>

