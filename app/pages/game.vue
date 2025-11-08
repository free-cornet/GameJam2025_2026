<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-white mb-8 animate-pulse">
        🎮 Game Ready!
      </h1>
      
      <p class="text-xl text-gray-300 mb-8">
        Welcome to the game! Loading completed successfully.
      </p>

      <!-- Active CAPTCHAs counter -->
      <div v-if="captchaManager.getActivePopupCount.value > 0" class="mb-4 text-yellow-300 font-semibold">
        Solve {{ captchaManager.getActivePopupCount.value }} CAPTCHA{{ captchaManager.getActivePopupCount.value !== 1 ? 's' : '' }} to continue...
      </div>
      
      <div class="space-y-4">
        <button 
          @click="startGame"
          :disabled="!captchaManager.allPopupsSolved.value"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
        >
          Start Game
        </button>
        
        <br>
        
        <button 
          @click="goBack" 
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
          Back to Loading
        </button>

        <br>

        <button 
          @click="reset" 
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
          Reset game
        </button>
        <div v-if="showResetMessage" class="text-white mt-4">
          Game reset
        </div>
      </div>

      <!-- Dynamic CAPTCHA popups -->
      <ClientOnly>
        <CaptchaWrapper
          v-for="popup in captchaManager.popups.value"
          :key="popup.id"
          :captcha-type="popup.captchaType"
          :popup-id="popup.id"
          :ref="(el) => captchaManager.registerRef(popup.id, el)"
          v-show="popup.isVisible"
          @verified="onCaptchaVerified"
          @spawnNew="onCaptchaSpawnNew"
          @closed="onCaptchaClosed"
          @hide="onCaptchaHide"
        />
      </ClientOnly>

      <!-- Hidden Popups List (Bottom Left) -->
      <ClientOnly>
        <div v-if="captchaManager.getHiddenPopups.value.length > 0" class="fixed bottom-4 left-4 bg-gray-800 border-2 border-gray-600 rounded-lg p-4 z-40 shadow-2xl">
          <h3 class="text-white font-bold mb-3 text-sm">Hidden CAPTCHAs</h3>
          <div class="space-y-2">
            <button
              v-for="popup in captchaManager.getHiddenPopups.value"
              :key="`hidden-${popup.id}`"
              @click="captchaManager.showCaptchaPopup(popup.id)"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              CAPTCHA #{{ popup.id + 1 }}
            </button>
          </div>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useCaptchaManager } from "~/composables/useCaptchaManager";
import CaptchaWrapper from "~/components/CaptchaWrapper.vue";

const captchaManager = useCaptchaManager();
const INITIAL_CAPTCHA_COUNT = 1; // Number of CAPTCHAs to spawn initially

const showResetMessage = ref(false);

const goBack = () => {
  navigateTo("/");
};

const goToRealGame = () => {
  navigateTo("/realGame");
};

const startGame = () => {
  // Add multiple CAPTCHAs (will be randomly selected from registered types)
  const popupIds = [];
  for (let i = 0; i < INITIAL_CAPTCHA_COUNT; i++) {
    const popupId = captchaManager.addPopup(); // No type specified = random
    popupIds.push(popupId);
  }
  
  // Open all CAPTCHAs after they're added to the DOM
  setTimeout(() => {
    popupIds.forEach((popupId) => {
      captchaManager.openCaptcha(popupId);
    });
  }, 50);
};

const onCaptchaVerified = (popupId) => {
  console.log(`CAPTCHA ${popupId} verified!`);
  captchaManager.removePopup(popupId);

  // Check if all CAPTCHAs are solved
  if (captchaManager.allPopupsSolved.value) {
    console.log("All CAPTCHAs solved! Proceeding to game...");
    setTimeout(() => {
      goToRealGame();
    }, 500);
  }
};

const onCaptchaClosed = (popupId) => {
  console.log(`CAPTCHA ${popupId} closed`);
};

const onCaptchaHide = (popupId) => {
  console.log(`CAPTCHA ${popupId} hidden!`);
  captchaManager.hidePopup(popupId);
};

const onCaptchaSpawnNew = (popupId) => {
  console.log(`CAPTCHA ${popupId} failed! Spawning additional puzzle...`);
  // Spawn a new CAPTCHA on failure while keeping the current one open for retry
  const newPopupId = captchaManager.addPopup(); // Random type
  setTimeout(() => {
    captchaManager.openCaptcha(newPopupId);
  }, 50);
};

const reset = () => {
  localStorage.setItem('trapCount', '0');
  showResetMessage.value = true;
};
</script>