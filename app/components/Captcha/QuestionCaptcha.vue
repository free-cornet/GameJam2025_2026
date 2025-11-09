<template>
    <ClientOnly>
        <PopupElement
            title="Love question"
            anchor="center"
            :is-open="isOpen"
            @hide="handleHide"
            :width="500"
        >
            <div class="min-w-sm">
                <!-- Instructions -->
                <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p class="text-sm text-gray-700">
                        <span class="font-semibold">Answer the question : What is love ?</span>
                    </p>
                </div>

                <!-- Canvas displaying the captcha -->
                <div class="flex justify-center mb-4">
            <!-- Input field -->
            <div class="flex flex-col items-start space-y-3 mb-6">
                <label class="flex items-center gap-3 cursor-pointer">
                    <input
                    type="radio"
                    value="robot"
                    v-model="selection"
                    :disabled="isVerifying"
                    class="accent-blue-600 w-5 h-5 flex-shrink-0"
                    />
                    <span class="text-lg font-medium text-gray-700">A complex set of emotions associated with strong feelings of affection</span>
                </label>

                <label class="flex items-center gap-3 cursor-pointer">
                    <input
                    type="radio"
                    value="not_robot"
                    v-model="selection"
                    :disabled="isVerifying"
                    class="accent-blue-600 w-5 h-5 flex-shrink-0"
                    />
                    <span class="text-lg font-medium text-gray-700">Baby don't hurt me</span>
                </label>
            </div>
        </div>
                <!-- Feedback and Buttons -->
                <div class="flex gap-3 justify-end">
                    <div v-if="feedbackMessage" class="w-full px-4 py-2 rounded" :class="feedbackClass">
                        {{ feedbackMessage }}
                    </div>

                    <button
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
const captchaCanvas = ref(null);
const selection = ref('');

const regenerateCaptcha = () => {
    generateCaptcha();
    feedbackMessage.value = "";
};

const verifyCaptcha = async () => {

    isVerifying.value = true;

    if (selection.value === 'not_robot') {
        feedbackMessage.value = "Baby, you won't hurt no more";
        feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";
        
        setTimeout(() => {
            emit("verified", props.popupId);
            handleClose();
        }, 1500);
    } else if (selection.value === 'robot') {
        feedbackMessage.value = "Nope, learn some memes and try again";
        feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
        
        setTimeout(() => {
            regenerateCaptcha();
            emit("spawnNew", props.popupId);
        }, 1500);
    }

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500));

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

const openCaptcha = async () => {
    isOpen.value = true;
    feedbackMessage.value = "";
    feedbackClass.value = "";
    
    await nextTick();
    regenerateCaptcha();
};

const showCaptcha = () => {
    isOpen.value = true;
};

// Expose methods for external use
defineExpose({ openCaptcha, showCaptcha, isOpen });
</script>

<style scoped>
canvas {
    image-rendering: crisp-edges;
}
</style>
