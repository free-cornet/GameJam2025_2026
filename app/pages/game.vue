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
          {{ !captchasStarted ? 'Start' : (captchaManager.areAllCaptchasSolved.value && captchaManager.getActivePopupCount.value === 0 ? 'Start Game' : 'Solve CAPTCHAs...') }}
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

      <!-- Captcha Todo List (Bottom Left) -->
      <ClientOnly>
        <div v-if="captchaManager.popups.value.length > 0" class="fixed bottom-4 left-4 bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-blue-500 rounded-lg p-4 z-40 shadow-2xl w-80 max-h-96 overflow-y-auto">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-white font-bold text-sm flex items-center gap-2">
              <span class="text-lg">✓</span>
              To Do
            </h3>
            <span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {{ captchaManager.popups.value.length }}
            </span>
          </div>

          <div class="space-y-2">
            <!-- Active and Hidden Captchas -->
            <div v-if="captchaManager.popups.value.length === 0" class="text-center py-4">
              <p class="text-green-400 font-semibold">All done! 🎉</p>
            </div>
            <button
              v-for="popup in captchaManager.popups.value"
              :key="`todo-${popup.id}`"
              @click="toggleCaptchaVisibility(popup.id)"
              class="w-full text-left px-3 py-2 rounded transition-all"
              :class="[
                popup.isVisible 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 font-semibold'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <span class="text-lg">{{ popup.isVisible ? '●' : '◯' }}</span>
                  <span class="capitalize">{{ formatCaptchaName(popup.captchaType) }}</span>
                </span>
                <span v-if="!popup.isVisible" class="text-xs text-slate-400">hidden</span>
              </div>
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
  // Check if there's a saved state from a previous session
  captchaManager.loadSolvedCaptchas();
  
  const savedPopupState = captchaManager.loadPopupState();
  if (savedPopupState && captchaManager.popups.value.length > 0) {
    // Restore the previous captcha session
    captchasStarted.value = true;
    
    // Reopen all the captchas that were previously open
    setTimeout(() => {
      captchaManager.popups.value.forEach((popup) => {
        if (popup.isOpen) {
          captchaManager.openCaptcha(popup.id);
        }
      });
    }, 50);
  }
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
    captchaManager.saveInitialCaptchaCount(INITIAL_CAPTCHA_COUNT);
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
  captchaManager.savePopupState();

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
    captchaManager.clearStorage(); // Clear storage on successful completion
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
      captchaManager.savePopupState();
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
  captchaManager.savePopupState();
  setTimeout(() => {
    captchaManager.openCaptcha(newPopupId);
  }, 50);
};

const reset = () => {
  localStorage.setItem('trapCount', '0');
  showResetMessage.value = true;
};

const toggleCaptchaVisibility = (popupId) => {
  const popup = captchaManager.popups.value.find((p) => p.id === popupId);
  if (popup) {
    if (popup.isVisible) {
      captchaManager.hidePopup(popupId);
      // Close the captcha component itself
      const captcha = captchaManager.captchaRefs.value[popupId];
      if (captcha && captcha.isOpen) {
        captcha.isOpen.value = false;
      }
    } else {
      captchaManager.showCaptchaPopup(popupId);
    }
  }
};

const formatCaptchaName = (name) => {
  // Convert camelCase or kebab-case to Title Case
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/-/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
};
</script>