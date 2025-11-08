<template>
    <ClientOnly>
        <PopupElement
            title="Enter the characters you see"
            anchor="center"
            :is-open="isOpen"
            @hide="handleHide"
            :width="400"
        >
            <div class="min-w-sm">
                <!-- Instructions -->
                <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p class="text-sm text-gray-700">
                        <span class="font-semibold">Type the characters shown below:</span>
                    </p>
                </div>

                <!-- Canvas displaying the captcha -->
                <div class="flex justify-center mb-4">
                    <canvas 
                        ref="captchaCanvas" 
                        width="300" 
                        height="100" 
                        class="border-2 border-gray-300 rounded shadow-sm bg-gray-50"
                    ></canvas>
                </div>

                <!-- Input field -->
                <div class="mb-4">
                    <input
                        v-model="userInput"
                        type="text"
                        placeholder="Enter the characters"
                        class="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        @keyup.enter="verifyCaptcha"
                        :disabled="isVerifying"
                    />
                </div>

                <!-- Feedback and Buttons -->
                <div class="flex gap-3 justify-end">
                    <div v-if="feedbackMessage" class="w-full px-4 py-2 rounded" :class="feedbackClass">
                        {{ feedbackMessage }}
                    </div>

                    <button
                        @click="regenerateCaptcha"
                        class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors whitespace-nowrap"
                        :disabled="isVerifying"
                    >
                        🔄 New
                    </button>

                    <button
                        @click="verifyCaptcha"
                        :disabled="!userInput.trim() || isVerifying"
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
const userInput = ref("");
const captchaCanvas = ref(null);

function getRandomColor() {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r},${g},${b})`;
}

const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    captchaText.value = Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join("");
};

const drawCaptcha = () => {
    if (!captchaCanvas.value) return;
    
    const canvas = captchaCanvas.value;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const spacing = canvas.width / (captchaText.value.length + 1);

    for (let i = 0; i < captchaText.value.length; i++) {
        const char = captchaText.value[i];

        // Random font size between 32px and 48px
        const fontSize = Math.floor(Math.random() * 17) + 32;

        // Pick a random font family
        const fontFamilies = [
            "Arial",
            "Georgia",
            "Courier New",
            "Verdana",
            "Comic Sans MS",
            "Impact",
            "Brush Script MT",
            "Lucida Console",
            "Times New Roman",
        ];
        const fontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];

        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = "#333";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        const x = spacing * (i + 1);
        const y = canvas.height / 2 + (Math.random() - 0.5) * 10;

        // Add slight rotation
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.random() - 0.5) * 0.3);
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }

    // Add noise: circles, lines, rectangles
    for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 3,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = getRandomColor();
        ctx.fill();
    }

    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.strokeStyle = getRandomColor();
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    for (let i = 0; i < 8; i++) {
        ctx.fillStyle = getRandomColor();
        ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 10,
            Math.random() * 10
        );
    }
};

const regenerateCaptcha = () => {
    generateCaptcha();
    drawCaptcha();
    userInput.value = "";
    feedbackMessage.value = "";
};

const verifyCaptcha = async () => {
    if (!userInput.value.trim()) return;

    isVerifying.value = true;

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (userInput.value.toUpperCase() === captchaText.value) {
        feedbackMessage.value = "✓ Correct!";
        feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";
        
        setTimeout(() => {
            emit("verified", props.popupId);
            handleClose();
        }, 1500);
    } else {
        feedbackMessage.value = "❌ Incorrect. Try again.";
        feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
        
        setTimeout(() => {
            regenerateCaptcha();
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
    isOpen.value = false;
    emit("hide", props.popupId);
};

const openCaptcha = async () => {
    isOpen.value = true;
    userInput.value = "";
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
