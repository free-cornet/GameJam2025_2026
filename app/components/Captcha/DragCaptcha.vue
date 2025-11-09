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
                        <span class="font-semibold">Match the shapes</span>
                    </p>
                </div>

                
                        <!-- Draggable shapes -->
                <div class="flex space-x-6 mb-8" >
                    <div
                        v-for="shape in availableShapes"
                        :key="shape.id"
                        class="w-24 h-24 flex items-center justify-center border-2 border-gray-400 rounded cursor-grab text-3xl bg-white"
                        :draggable="true"
                        @dragstart="onDragStart(shape)"
                    >
                        {{ shape.label }}
                    </div>
                </div>

                <br></br>

                <!-- Drop zones -->
                <div class="flex space-x-6">
                    <div
                        v-for="target in targets"
                        :key="target.id"
                        class="w-24 h-24 border-4 flex items-center justify-center text-gray-500 transition-all duration-300"
                        :class="{
                        'border-dashed border-gray-500': !target.filled,
                        'border-solid border-green-500 bg-green-100': target.filled,
                        'border-blue-500 bg-blue-100': target.isHovered
                        }"
                        @dragover.prevent="onDragOver(target)"
                        @dragleave="onDragLeave(target)"
                        @drop="onDrop(target)"
                    >
                        <span v-if="!target.filled">{{ target.label }}</span>
                        <span v-else class="text-3xl">{{ getShapeLabel(target.filled) }}</span>
                    </div>
                </div>

                <br></br>
                
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
const userInput = ref("");
const captchaCanvas = ref(null);


const shapes = [
  { id: 'circle', label: '⚪' },
  { id: 'square', label: '⬛' },
  { id: 'triangle', label: '🔺' }
];

const availableShapes = ref([]);
const draggedShape = ref(null);

const targets = ref([
  { id: 'circle', label: 'Drop Circle Here', filled: null, isHovered: false },
  { id: 'square', label: 'Drop Rectangle Here', filled: null, isHovered: false },
  { id: 'triangle', label: 'Drop Triangle Here', filled: null, isHovered: false }
]);

const resultMessage = ref('');
const resultColor = ref('');

const shuffleShapes = () => {
  availableShapes.value = [...shapes].sort(() => Math.random() - 0.5);
};

onMounted(() => {
  shuffleShapes();
});

const onDragStart = (shape) => {
  draggedShape.value = shape;
};

const onDragOver = (target) => {
  target.isHovered = true;
};

const onDragLeave = (target) => {
  target.isHovered = false;
};

const onDrop = (target) => {
  target.isHovered = false;
  if (!draggedShape.value) return;
  target.filled = draggedShape.value.id;
  availableShapes.value = availableShapes.value.filter(s => s.id !== draggedShape.value.id);
  draggedShape.value = null;
};

const verifyCaptcha = async () => {
    isVerifying.value = true;

  const allCorrect = targets.value.every((t) => t.filled === t.id);
  const squareTarget = targets.value.find(t => t.id === 'square');
  const circleTarget = targets.value.find(t => t.id === 'circle');
  const triangleTarget = targets.value.find(t => t.id === 'triangle');

  if (allCorrect) {
    feedbackMessage.value = '❌ Only a robot could have known that a square is also a rectangle !';
    feedbackClass.value = 'text-red-600';
    setTimeout(() => {
      resetCaptcha();
      emit("spawnNew", props.popupId);
    }, 500);
  } else if (squareTarget.filled !== squareTarget.id &&
      circleTarget.filled === circleTarget.id && 
      triangleTarget.filled === triangleTarget.id){
        feedbackMessage.value = '✓ Verification successful!';
        feedbackClass.value = 'text-green-600';

        setTimeout(() => {
            emit("verified", props.popupId);
            handleClose();
        }, 1500);
  } else {
    feedbackMessage.value = '❌ Shapes do not match, try again.';
    feedbackClass.value = 'text-red-600';
    setTimeout(() => {
      resetCaptcha();
      emit("spawnNew", props.popupId);
    }, 500);
  }

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    isVerifying.value = false;
};

const getShapeLabel = (id) => {
  const shape = shapes.find(s => s.id === id);
  return shape ? shape.label : '';
};

const resetCaptcha = () => {
  // Clear all drop zones
  targets.value.forEach(t => {
    t.filled = null;
    t.isHovered = false;
  });

  // Restore all shapes and shuffle
  shuffleShapes();

  // Clear dragged shape
  draggedShape.value = null;
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
