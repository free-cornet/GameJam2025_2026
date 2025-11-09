<template>
  
  <div id="app" class="min-h-screen flex items-center justify-center p-10">
      <!-- Warning Banner at Top -->
      <div v-if="showError42Warning" class="fixed top-2 mx-2 max-w-xl w-full bg-orange-700 border-2 rounded border-orange-800 p-4 z-50 shadow-lg">
        <div class="text-center">
          <p class="text-white text-lg font-bold">⚠️ ERROR 42: Failed to verify you're a human :(</p>
        </div>
      </div>

      <div class="text-center" :class="{ 'pt-20': showError42Warning }">
        <h1 class="w-full  mb-8 items-center justify-center" style="font-family: Cardinal;">
          <p class="text-8xl text-white font-bold">The Legend of Humans: </p>
          <p class="text-3xl w-[40%] mx-auto font-bold text-gray-200 mb-8">Age of Mythology, Kingdom of Dragons, Imperium of Demons, Symphony of Angels, Forge of Dwarfs, Legacy of Golems, Abyss of Whisperers, Great Library of Sages, Doom of the Worlds, Astral Plan of Shir & World Tree of Elves
          </p>
          <p class="text-4xl font-bold text-amber-200 mb-8 animate-bounce translate-y-1">Remastered Super Deluxe Edition</p>
        </h1>

      <!-- Active CAPTCHAs counter -->
      <div v-if="captchaManager.getActivePopupCount.value > 0" class="mb-4 text-yellow-300 font-semibold">
        Solve {{ captchaManager.getActivePopupCount.value }} CAPTCHA{{ captchaManager.getActivePopupCount.value !== 1 ? 's' : '' }} to continue...
      </div>

      <div class="grid place-items-center gap-2">
        <GameButton
          :disabled="captchasStarted && (!captchaManager.areAllCaptchasSolved.value || captchaManager.getActivePopupCount.value > 0)"
          @click="startGame"
        >
          {{ !captchasStarted ? 'Start' : (captchaManager.areAllCaptchasSolved.value && captchaManager.getActivePopupCount.value === 0 ? 'Start Game' : 'Complete CAPTCHAs First') }}
        </GameButton>

        <GameButton @click="goBack">
          Back to Loading
        </GameButton>

        <GameButton @click="goToTermsOfUse">
          Terms of Use
        </GameButton>

        <CaptchaImages
          ref="captchaRef"
          @verified="onCaptchaVerified"
          @closed="onCaptchaClosed"
        />
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
import { ref, onMounted } from "vue";
import { useCaptchaManager } from "~/composables/useCaptchaManager";
import CaptchaWrapper from "~/components/CaptchaWrapper.vue";
import GameButton from "~/components/GameButton.vue";

const captchaManager = useCaptchaManager();
const INITIAL_CAPTCHA_COUNT = 1; // Number of CAPTCHAs to spawn initially

const showResetMessage = ref(false);
const captchasStarted = ref(false);
const showError42Warning = ref(false);

onMounted(() => {
  // Don't initialize captchas automatically - wait for user to click Start
});

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
  // Initialize captchas if not already started
  if (!captchasStarted.value) {
    captchasStarted.value = true;
    initializeCaptchas();
  }
};

const initializeCaptchas = () => {
  // Add initial CAPTCHA to start the verification process
  const popupId = captchaManager.addPopup(); // Will get a random unsolved type
  setTimeout(() => {
    captchaManager.openCaptcha(popupId);
  }, 50);
};

const onCaptchaVerified = (popupId) => {
  console.log(`CAPTCHA ${popupId} verified!`);
  
  // Get the captcha type that was just solved
  const popup = captchaManager.popups.value.find((p) => p.id === popupId);
  if (popup) {
    captchaManager.markCaptchaSolved(popup.captchaType);
  }
  
  captchaManager.removePopup(popupId);

  // Check if there are still open captchas that need to be solved
  if (captchaManager.getActivePopupCount.value > 0) {
    // Still have open captchas - don't proceed yet
    console.log("Still have open CAPTCHAs to solve...");
    return;
  }

  // All open captchas are solved, now check if all types have been solved
  if (captchaManager.areAllCaptchasSolved.value) {
    // All types solved - allow progression
    console.log("All CAPTCHA types solved! Proceeding to game...");
    setTimeout(() => {
      goToRealGame();
    }, 500);
  } else {
    // Not all types solved yet - show error warning and spawn a new one
    console.log("Not all types solved - showing error 42");
    showError42Warning.value = true;
    
    // Hide warning and spawn new captcha after 2 seconds
    setTimeout(() => {
      showError42Warning.value = false;
      
      // Spawn a new CAPTCHA (will be a different type than already solved)
      const newPopupId = captchaManager.addPopup();
      setTimeout(() => {
        captchaManager.openCaptcha(newPopupId);
      }, 50);
    }, 2000);
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
  // Spawn a new CAPTCHA on failure (will be a different type if possible)
  const newPopupId = captchaManager.addPopup();
  setTimeout(() => {
    captchaManager.openCaptcha(newPopupId);
  }, 50);
};

const reset = () => {
  localStorage.setItem('trapCount', '0');
  showResetMessage.value = true;
};
</script>