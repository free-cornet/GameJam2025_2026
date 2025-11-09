<template>
  
  <div class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h1 class="w-full  mb-8 items-center justify-center" style="font-family: Cardinal;">
          <p class="text-8xl text-white font-bold">The Legend of Humans: </p>
          <p class="text-3xl w-[40%] mx-auto font-bold text-gray-200 mb-8">Age of Mythology, Kingdom of Dragons, Imperium of Demons, Symphony of Angels, Forge of Dwarfs, Legacy of Golems, Abyss of Whisperers, Great Library of Sages, Doom of the Worlds, Astral Plan of Shir & World Tree of Elves
          </p>
          <p class="text-4xl font-bold text-amber-400 mb-8">Remastered Super Deluxe Edition</p>
        </h1>

      <!-- Active CAPTCHAs counter -->
      <div v-if="captchaManager.getActivePopupCount.value > 0" class="mb-4 text-yellow-300 font-semibold">
        Solve {{ captchaManager.getActivePopupCount.value }} CAPTCHA{{ captchaManager.getActivePopupCount.value !== 1 ? 's' : '' }} to continue...
      </div>
      
      <div class="space-y-10">
        <button 
          @click="startGame"
          :disabled="!captchaManager.allPopupsSolved.value"
          class="hover:opacity-80 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 bg-contain bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${button4})`, scale: 1.7}">
          <div style="scale: 0.8;">Start Game</div>
        </button>
        
        <br>
        
        <button 
          @click="goBack" 
          class="hover:opacity-80 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 bg-contain bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${button4})`, scale: 1.7}">
          
          <div style="scale: 0.6;">Back to Loading</div>
        </button>

        <br>

        <button 
          @click="goToTermsOfUse" 
          class="hover:opacity-80 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 bg-contain bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${button4})`, scale: 1.7}">
          <div style="scale: 0.8;">Terms of Use</div>
        </button>

        <CaptchaImages
          ref="captchaRef"
          @verified="onCaptchaVerified"
          @closed="onCaptchaClosed"
        />
        <br>

        <button 
          @click="reset" 
          class="hover:opacity-80 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 bg-contain bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${button4})`, scale: 1.7}">
          <div style="scale: 0.8;">Reset game</div>
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
<style>
body {
  background-image: url('../assets/background.jpg');
  background-size: cover;
}
@font-face {
    font-family: Cardinal;
    src: url('../assets/Cardinal.ttf');
}
</style>

<script setup>
import { ref } from "vue";
import { useCaptchaManager } from "~/composables/useCaptchaManager";
import CaptchaWrapper from "~/components/CaptchaWrapper.vue";
import button1 from '../assets/button1.png';
import button2 from '../assets/button2.png';
import button3 from '../assets/button3.png';
import button4 from '../assets/button4.png';

const captchaManager = useCaptchaManager();
const INITIAL_CAPTCHA_COUNT = 1; // Number of CAPTCHAs to spawn initially

const showResetMessage = ref(false);

const goBack = () => {
  navigateTo("/");
};

// TODO: Put it somewhere else, before starting the captcha
const goToTermsOfUse = () => {
  navigateTo("/terms_of_use", { external: true });
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