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
        <button 
        @click="isOpen = true" 
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300">
          Start Game
        </button>
        
        <br>
        
        <button 
          @click="goBack" 
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
        >
          Back to Loading
        </button>

        <CaptchaImages
          ref="captchaRef"
          @verified="onCaptchaVerified"
          @closed="onCaptchaClosed"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import CaptchaImages from "~/components/Captcha/Images.vue";

const isOpen = ref(false);
const captchaRef = ref(null);

const goBack = () => {
  navigateTo("/");
};

const goToRealGame = () => {
  navigateTo("/realGame");
};

const onCaptchaVerified = () => {
  console.log("CAPTCHA verified!");
  // Handle successful verification here
  goToRealGame();
};

const onCaptchaClosed = () => {
  console.log("CAPTCHA closed");
  isOpen.value = false;
};

const startCaptcha = () => {
  captchaRef.value?.openCaptcha();
};

watch(isOpen, (newValue) => {
  if (newValue) {
    startCaptcha();
  }
});
</script>