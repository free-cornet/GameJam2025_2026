<template>
    <ClientOnly>
        <PopupElement
            title="Please solve this CAPTCHA"
            anchor="center"
            :is-open="isOpen"
            @hide="handleHide"
            :width="500"
        >
            <div class="min-w-sm">
                <!-- Instructions -->
                <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p class="text-sm text-gray-700">
                        <span class="font-semibold">Select all images that contain:</span>
                        <span class="text-lg font-bold text-blue-600 ml-2">{{ currentPrompt }}</span>
                    </p>
                </div>

                <!-- Image Grid (3x3) -->
                <div class="grid grid-cols-3 gap-2 mb-4 place-items-center">
                    <div
                        v-for="(image, index) in images"
                        :key="`${index}-${image.isCorrect}`"
                        @click="toggleImageSelection(index)"
                        class="size-32 relative cursor-pointer transform transition-transform hover:scale-105"
                    >
                        <img
                            :src="image.url"
                            :alt="`Image ${index + 1}`"
                            height="128px"
                            width="128px"
                            class="size-32 object-contain rounded border-2 transition-all"
                            :class="[
                                selectedIndices.includes(index)
                                    ? 'border-green-500 brightness-75'
                                    : 'border-gray-300 hover:border-gray-400'
                            ]"
                        />
                        <!-- Checkmark overlay for selected images -->
                        <div
                            v-if="selectedIndices.includes(index)"
                            class="absolute inset-0 grid place-items-center select-none _border-2"
                            :class="{ 'bg-black/10': selectedIndices.includes(index) }"
                        >
                            <div class="bg-green-500 text-white rounded-full size-12 grid place-items-center border-2 text-2xl">
                                ✓
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 justify-end">
                    <!-- Feedback Message -->
                    <div v-if="feedbackMessage" class="w-full px-4 py-2 rounded" :class="feedbackClass">
                        {{ feedbackMessage }}
                    </div>

                    <button
                        @click="verifyCaptcha"
                        :disabled="selectedIndices.length === 0 || isVerifying"
                        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
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

const emit = defineEmits(["verified", "closed", "failed", "hide", "spawnNew"]);

const props = defineProps({
  popupId: {
    type: Number,
    required: true,
  },
});

const isOpen = ref(false);
const selectedIndices = ref([]);
const isVerifying = ref(false);
const feedbackMessage = ref("");
const feedbackClass = ref("");
const shuffledImages = ref([]);

// Image prompts and corresponding image URLs
const captchaPrompts = [
    {
        prompt: "The best operating system",
        images: [
            { url: "/captcha/os/linux.png", isCorrect: true },
            { url: "/captcha/os/linux2.jpg", isCorrect: true },
            { url: "/captcha/os/linux3.png", isCorrect: true },
            { url: "/captcha/os/macos.png", isCorrect: false },
            { url: "/captcha/os/macos2.jpg", isCorrect: false },
            { url: "/captcha/os/windows.png", isCorrect: false },
            { url: "/captcha/os/windows2.jpg", isCorrect: false },
            { url: "/captcha/os/freebsd.png", isCorrect: false },
            { url: "/captcha/os/android.png", isCorrect: false },
        ],
    },
    {
        prompt: "Ugly people",
        images: [
            { url: "/captcha/ugly/ugly1.jpg", isCorrect: true },
            { url: "/captcha/ugly/ugly2.jpg", isCorrect: true },
            { url: "/captcha/ugly/ugly3.jpg", isCorrect: true },
            { url: "/captcha/ugly/ugly4.jpg", isCorrect: true },
            { url: "/captcha/ugly/ugly5.jpg", isCorrect: true },
            { url: "/captcha/ugly/ugly6.jpg", isCorrect: false },
            { url: "/captcha/ugly/ugly7.png", isCorrect: true },
            { url: "/captcha/ugly/ugly8.jpg", isCorrect: false },
            { url: "/captcha/ugly/ugly9.jpg", isCorrect: true },
        ],
    },
    {
        prompt: "A bus",
        images: [
            { url: "/captcha/bus/bus1.jpg", isCorrect: true },
            { url: "/captcha/bus/bus2.jpg", isCorrect: true },
            { url: "/captcha/bus/bus3.jpg", isCorrect: true },
            { url: "/captcha/bus/city1.jpg", isCorrect: false },
            { url: "/captcha/bus/city2.jpg", isCorrect: false },
            { url: "/captcha/bus/city3.jpg", isCorrect: false },
            { url: "/captcha/bus/city4.jpg", isCorrect: false },
            { url: "/captcha/bus/city5.jpg", isCorrect: false },
            { url: "/captcha/bus/wheel.jpg", isCorrect: false },
        ],
    },
];

let currentCaptcha = null;
const currentPrompt = computed(() => currentCaptcha?.prompt || "");
const images = computed(() => shuffledImages.value);

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const toggleImageSelection = (index) => {
    const idx = selectedIndices.value.indexOf(index);
    if (idx > -1) {
        selectedIndices.value.splice(idx, 1);
    } else {
        selectedIndices.value.push(index);
    }
    feedbackMessage.value = "";
};

const verifyCaptcha = async () => {
    isVerifying.value = true;

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get the correct indices from shuffled images
    const correctIndices = shuffledImages.value
        .map((img, idx) => img.isCorrect ? idx : -1)
        .filter(idx => idx !== -1);

    const correct = correctIndices.sort().join(",");
    const selected = selectedIndices.value.sort().join(",");

    if (correct === selected) {
        feedbackMessage.value = "Correct!";
        feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";
        setTimeout(() => {
            emit("verified", props.popupId);
            handleClose();
        }, 1500);
    } else {
        feedbackMessage.value = "Please try again.";
        feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
        selectedIndices.value = [];
        
        // Shuffle new images for retry instead of closing
        setTimeout(() => {
            shuffledImages.value = shuffleArray(currentCaptcha.images);
            emit("spawnNew", props.popupId);
        }, 1500);
    }

    isVerifying.value = false;
};

const handleClose = () => {
    emit("closed", props.popupId);
    isOpen.value = false;
};

const handleHide = () => {
    // Simply hide without emitting any other events
    isOpen.value = false;
    emit("hide", props.popupId);
};

const openCaptcha = () => {
    // Select a random captcha prompt from all available captchas
    currentCaptcha = captchaPrompts[Math.floor(Math.random() * captchaPrompts.length)];
    // Shuffle the images
    shuffledImages.value = shuffleArray(currentCaptcha.images);
    selectedIndices.value = [];
    feedbackMessage.value = "";
    isOpen.value = true;
};

const showCaptcha = () => {
    isOpen.value = true;
};

// Expose the openCaptcha method for external use
defineExpose({ openCaptcha, showCaptcha, isOpen });
</script>

<style scoped>
.captcha-container {
    min-width: 450px;
}
</style>