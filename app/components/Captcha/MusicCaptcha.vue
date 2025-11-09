<template>
    <ClientOnly>
        <PopupElement
            title="Orchestra"
            anchor="center"
            :is-open="isOpen"
            @hide="handleHide"
            :width="500"
        >
            <!-- Instructions -->
            <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p class="text-sm text-gray-700">
                    <span class="font-semibold">Select all the musicians needed to make the beautiful music you are hearing.</span>
                </p>
            </div>

            <!-- Instruments Grid (3x2) -->
            <div class="grid grid-cols-3 gap-3 mb-4 place-items-center">
                <div
                    v-for="instrument in instruments"
                    :key="instrument.id"
                    @click="toggleInstrument(instrument.id)"
                    class="relative cursor-pointer transform transition-transform hover:scale-105"
                >
                    <!-- Square container for instrument -->
                    <div
                        :class="[
                            'size-32 overflow-hidden rounded-lg transition-all',
                            isSelected(instrument.id) ? 'border-4 border-green-500 brightness-75' : 'border-4 border-gray-300 hover:border-gray-400'
                        ]"
                    >
                        <button
                            :class="[instrument.cssClass, 'w-full h-full cursor-pointer']"
                        />
                    </div>
                    
                    <!-- Checkmark overlay for selected instruments -->
                    <div
                        v-if="isSelected(instrument.id)"
                        class="absolute inset-0 grid place-items-center select-none pointer-events-none"
                    >
                        <div class="bg-green-500 text-white rounded-full size-12 grid place-items-center border-2 border-white text-2xl font-bold shadow-lg">
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
                    :disabled="isVerifying"
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
                >
                    {{ isVerifying ? "Verifying..." : "Verify" }}
                </button>
            </div>

            <audio loop autoplay style="display: none;">
                <source src="/captcha/music/bass_2.mp3" type="audio/mpeg">
            </audio>
            <audio loop autoplay style="display: none;">
                <source src="/captcha/music/drum_2.mp3" type="audio/mpeg">
            </audio>
            <audio loop autoplay style="display: none;">
                <source src="/captcha/music/flute_2.mp3" type="audio/mpeg">
            </audio>
        </PopupElement>
    </ClientOnly>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["verified", "closed", "hide", "spawnNew"]);

const props = defineProps({
    popupId: {
        type: Number,
        required: true,
    },
});

// Instruments configuration
const instruments = ref([
    { id: "bass", cssClass: "bass" },
    { id: "cor", cssClass: "cor" },
    { id: "drum", cssClass: "drum" },
    { id: "trumpet", cssClass: "trumpet" },
    { id: "wind", cssClass: "wind" },
    { id: "xylo", cssClass: "xylo" },
]);

// Selected instruments
const selectedInstruments = ref([]);

// UI state
const isOpen = ref(false);
const isVerifying = ref(false);
const feedbackClass = ref("");
const feedbackMessage = ref("");

// Correct answer
const correctInstruments = ["bass", "drum", "wind"];

const isSelected = (instrumentId) => {
    return selectedInstruments.value.includes(instrumentId);
};

const toggleInstrument = (instrumentId) => {
    const index = selectedInstruments.value.indexOf(instrumentId);
    if (index > -1) {
        selectedInstruments.value.splice(index, 1);
    } else {
        selectedInstruments.value.push(instrumentId);
    }
    feedbackMessage.value = "";
};

const resetSelections = () => {
    selectedInstruments.value = [];
    feedbackMessage.value = "";
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
    resetSelections();
    isOpen.value = true;
};

const showCaptcha = () => {
    isOpen.value = true;
};

const verifyCaptcha = async () => {
    isVerifying.value = true;

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const selected = selectedInstruments.value.sort().join(",");
    const correct = correctInstruments.sort().join(",");

    if (selected === correct) {
        feedbackMessage.value = "Correct!";
        feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";
        setTimeout(() => {
            emit("verified", props.popupId);
            handleClose();
        }, 1500);
    } else {
        feedbackMessage.value = "One of the musicians is quite discreet, try again.";
        feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
        resetSelections();
    }

    isVerifying.value = false;
};

// Expose methods
defineExpose({ openCaptcha, showCaptcha, isOpen });
</script>

<style scoped>
.bass,
.cor,
.drum,
.trumpet,
.wind,
.xylo {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: 400% 100%;
    background-position: 0% 0%;
    animation: dance 1s steps(3) infinite;
}

.bass {
    background-image: url('/captcha/music/bass.png');
}

.cor {
    background-image: url('/captcha/music/cor.png');
}

.drum {
    background-image: url('/captcha/music/drum.png');
}

.trumpet {
    background-image: url('/captcha/music/trumpet.png');
}

.wind {
    background-image: url('/captcha/music/wind.png');
}

.xylo {
    background-image: url('/captcha/music/xylo.png');
}

@keyframes dance {
    0% {
        background-position: 0% 0%;
    }
    100% {
        background-position: 100% 0%;
    }
}
</style>