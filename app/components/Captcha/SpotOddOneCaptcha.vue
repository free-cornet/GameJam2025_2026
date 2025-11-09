<template>
    <ClientOnly>
        <PopupElement
            title="Odd One CAPTCHA"
            anchor="center"
            :is-open="isOpen"
            @hide="handleHide"
            :width="400"
        >
            <div class="min-w-sm">
                <!-- Instructions -->
                <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p class="text-sm text-gray-700">
                        <span v-if="correctCount === 0" class="font-semibold">Spot the odd one out of this four images.</span>

                        <span v-if="correctCount === 1" class="font-semibold">Now, spot this.</span>

                        <span v-if="correctCount === 2" class="font-semibold">Now, click 
                        <span 
                            class="italic cursor-pointer hover:text-red-600 hover:underline transition-colors"
                            @click="handleCorrectAnswer"
                        >
                        this
                        </span>.
                        </span>
                        <!-- <br /> -->
                        <!-- <span class="text-xs">Don't lose to proceed! (Win or draw)</span> -->
                    </p>
                </div>

                <!-- Game Status -->
                <div class="mb-4 text-center">
                    <p class="text-sm font-semibold" :class="gameStatusClass">
                        {{ gameStatus }}
                    </p>
                </div>

                <!-- Images Grid 1 -->
                <div v-if="correctCount === 0" class="flex gap-2 mb-4 justify-center">
                    <img
                        src="/captcha/oddone/cute.png"
                        @click="handleWrongAnswer"
                        alt="Cute Emoji"
                        class="cursor-pointer w-[75px] h-[75px] object-cover rounded"
                    />
                    <img
                        src="/captcha/oddone/angry.png"
                        @click="handleCorrectAnswer"
                        alt="Angry Emoji"
                        class="cursor-pointer w-[75px] h-[75px] object-cover rounded"
                    />
                    <img
                        src="/captcha/oddone/laughing.png"
                        @click="handleWrongAnswer"
                        alt="Laughing Emoji"
                        class="cursor-pointer w-[75px] h-[75px] object-cover rounded"
                    />
                    <img
                        src="/captcha/oddone/smile.png"
                        @click="handleWrongAnswer"
                        alt="Smiling Emoji"
                        class="cursor-pointer w-[75px] h-[75px] object-cover rounded"
                    />
                </div>

                <!-- Images Grid 2 -->
                <div v-if="correctCount === 1" class="flex gap-2 mb-4 justify-center">
                    <div
                        @click="handleCorrectAnswer"
                        class="w-[75px] h-[75px] rounded-full bg-[#E00000] cursor-pointer transition-opacity"
                    ></div>
                    <div
                        @click="handleWrongAnswer"
                        class="w-[75px] h-[75px] rounded-full bg-[#EF4444] cursor-pointer transition-opacity"
                    ></div>
                    <div
                        @click="handleWrongAnswer"
                        class="w-[75px] h-[75px] rounded-full bg-[#EF4444] cursor-pointer transition-opacity"
                    ></div>
                    <div
                        @click="handleWrongAnswer"
                        class="w-[75px] h-[75px] rounded-full bg-[#EF4444] cursor-pointer transition-opacity"
                    ></div>
                </div>

                <!-- Images Grid 3 -->
                <div v-if="correctCount === 2" class="flex gap-2 mb-4 justify-center">
                    <div
                        @click="handleWrongAnswer"
                        class="w-[75px] h-[75px] rounded-full bg-[#EF4444] cursor-pointer transition-opacity"
                    ></div>
                    <div
                        @click="handleWrongAnswer"
                        class="w-[75px] h-[75px] rounded-full bg-[#EF4444] cursor-pointer transition-opacity"
                    ></div>
                    <div
                        @click="handleWrongAnswer"
                        class="w-[75px] h-[75px] rounded-full bg-[#EF4444] cursor-pointer transition-opacity"
                    ></div>
                    <div
                        @click="handleCorrectButWrongAnswer"
                        class="w-[75px] h-[75px] rounded-full bg-[#EF4404] cursor-pointer transition-opacity"
                    ></div>
                </div>

                <!-- Feedback and Buttons -->
                <div class="flex gap-3 justify-end">
                    <div v-if="feedbackMessage" class="w-full px-4 py-2 rounded" :class="feedbackClass">
                        {{ feedbackMessage }}
                    </div>

                    <!-- Show Verify button only if game is over and we didn't lose -->
                    <button
                        v-if="canVerify && gameOver"
                        @click="verifyCaptcha"
                        :disabled="isVerifying"
                        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors whitespace-nowrap"
                    >
                        {{ isVerifying ? "Verifying..." : "Verify" }}
                    </button>
                </div>
            </div>
        </PopupElement>
    </ClientOnly>
</template>

<script setup>
import { ref, computed } from "vue";

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
const correctAnswer = ref(false);
const wrongAnswer = ref(false);
const correcButWrongAnswer = ref(false);
const correctCount = ref(0);

const handleCorrectAnswer = () => {
    correctAnswer.value = true;
    wrongAnswer.value = false;
    correcButWrongAnswer.value = false;
    verifyCaptcha();
};

const handleWrongAnswer = () => {
    correctAnswer.value = false;
    wrongAnswer.value = true;
    correcButWrongAnswer.value = false;
    verifyCaptcha();
};

const handleCorrectButWrongAnswer = () => {
    correctAnswer.value = false;
    wrongAnswer.value = false;
    correcButWrongAnswer.value = true;
    verifyCaptcha();
}

const verifyCaptcha = async () => {
    isVerifying.value = true;

    // Simulate verification delay
    if (correctCount.value === 0) {
        if (wrongAnswer.value) {
            feedbackMessage.value = "Even an human should be able to spot the odd one...";
            feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
        } else if (correctAnswer.value) {
            feedbackMessage.value = "Perhaps it was too simple...";
            feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";
            correctCount.value = 1;
        }
    } else if (correctCount.value === 1) {
        if (wrongAnswer.value) {
            feedbackMessage.value = "Wrong! Humans have their limits...";
            feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
        } else if (correctAnswer.value) {
            feedbackMessage.value = "Not too bad for a human...";
            feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";
            correctCount.value = 2;
        }
    } else if (correctCount.value === 2) {
        if (wrongAnswer.value) {
            feedbackMessage.value = "That's obvioulsy a wrong answer...";
            feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
        } else if (correcButWrongAnswer.value) {
            feedbackMessage.value = "That's a difference... but only a robot would have spotted that...";
            feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
        } else if (correctAnswer.value) {
            feedbackMessage.value = "✓ CAPTCHA solved!";
            feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";
            // correctCount.value += 1;
            setTimeout(() => {
                emit("verified", props.popupId);
                handleClose();
            }, 1500);
        }
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

const openCaptcha = () => {
    isOpen.value = true;
};

const showCaptcha = () => {
    isOpen.value = true;
};

// Expose methods for external use
defineExpose({ openCaptcha, showCaptcha, isOpen });
</script>

<style scoped>
button:disabled {
    cursor: not-allowed;
}
</style>
