<template>
    <ClientOnly>
        <PopupElement
            title="Solve the Captcha"
            anchor="center"
            :is-open="isOpen"
            @hide="handleHide"
            :width="400"
        >
            <div class="min-w-sm">
                <!-- Instructions -->
                <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p class="text-sm text-gray-700">
                        <span class="font-semibold">Humanity check</span>
                    </p>
                </div>

                <div class="flex justify-center mb-4">
                    <div class="border-2 border-gray-300  p-8 w-full max-w-md rounded shadow-sm bg-gray-50 text-center transition-all duration-300">     
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
                    </div>
                </div>
                <!-- Feedback and Buttons -->
                <div class="flex gap-3 justify-end">
                    <div v-if="feedbackMessage" class="w-full px-4 py-2 rounded" :class="feedbackClass">
                        {{ feedbackMessage }}
                    </div>
                </div>
            </div>
        </PopupElement>
    </ClientOnly>
</template>
import type { logger } from "nuxt/kit";

<script setup>
import { ref, onMounted, nextTick } from "vue";

const emit = defineEmits(["verified", "closed", "hide", "spawnNew"]);

const props = defineProps({
    popupId: {
        type: Number,
        required: true,
    },
});

const isOpen = ref(false);
const isVerifying = ref(false);
const feedbackMessage = ref("");
const feedbackClass = ref("");
const captchaText = ref("");
const userInput = ref("");
const captchaCanvas = ref(null);

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
      verifyCaptcha();
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
    verifyCaptcha();
  }, 5000); // Simulate 5-second verification
};

const verifyCaptcha = () => {
    isVerifying.value = true;
    if (doneNumber === 1 && !isVerified.value && !isLoading.value) {
        feedbackMessage.value = "We still have some doubts...";
        feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
    } else if (doneNumber === 2 && !isVerified.value && !isLoading.value) {
        feedbackMessage.value = "An error occured, please try again.";
        feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
    } else if (doneNumber >= 3 && !isVerified.value && !isLoading.value){
        feedbackMessage.value = "So, you're a robot ? (read the sentence better)";
        feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";   
    } else {
        feedbackMessage.value = "✓ Correct!";
        feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";
        
        setTimeout(() => {
            emit("verified", props.popupId);
            handleClose();
        }, 1500);
    }
    isVerifying.value = false;
};

const handleClose = () => {
    emit("closed", props.popupId);
    isOpen.value = false;
};

const handleHide = () => {
    isOpen.value = false;
    emit("hide", props.popupId);
};

const showCaptcha = () => {
    isOpen.value = true;
};

const regenerateCaptcha = () => {
    feedbackMessage.value = "";
};

const openCaptcha = async () => {
    isOpen.value = true;
    feedbackMessage.value = "";
    feedbackClass.value = "";
    await nextTick();
    regenerateCaptcha();
};

// Expose methods for external use
defineExpose({ openCaptcha, showCaptcha, isOpen });
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

canvas {
    image-rendering: crisp-edges;
}

</style>
