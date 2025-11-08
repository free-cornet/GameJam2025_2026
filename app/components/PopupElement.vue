<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed bg-white rounded-lg shadow-2xl border border-gray-300 z-50 min-w-64"
        :style="popupStyle"
        ref="popupElement"
      >
        <!-- Title Bar -->
        <div
          class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-t-lg flex justify-between items-center cursor-move select-none"
          @mousedown="startDrag"
        >
          <h3 class="font-semibold text-sm">{{ title }}</h3>
          <button
            @click="hide"
            class="text-white hover:bg-red-500 rounded px-2 py-1 transition-colors"
            aria-label="Hide popup"
          >
            ✕
          </button>
        </div>

        <!-- Content -->
        <div class="p-4 text-gray-800">
          <slot />
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

interface Props {
  title?: string;
  isOpen?: boolean;
  x?: number;
  y?: number;
  anchor?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  width?: number;
  height?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Popup",
  isOpen: true,
  x: 0,
  y: 0,
  anchor: "top-left",
  width: 400,
  height: "auto",
});

const emit = defineEmits<{
  hide: [];
  "update:x": [number];
  "update:y": [number];
}>();

const popupElement = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const position = ref({ x: props.x, y: props.y });

const getAnchoredPosition = () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const popupWidth = props.width;
  const popupHeight = popupElement.value?.offsetHeight || 200;

  let x = props.x;
  let y = props.y;

  // Apply anchor position
  switch (props.anchor) {
    case "top-right":
      x = viewportWidth - popupWidth - props.x;
      y = props.y;
      break;
    case "bottom-left":
      x = props.x;
      y = viewportHeight - popupHeight - props.y;
      break;
    case "bottom-right":
      x = viewportWidth - popupWidth - props.x;
      y = viewportHeight - popupHeight - props.y;
      break;
    case "center":
      // Center position with random offset
      const offsetRange = 80; // pixels to offset from center
      const randomOffsetX = (Math.random() - 0.5) * offsetRange;
      const randomOffsetY = (Math.random() - 0.5) * offsetRange;
      x = (viewportWidth - popupWidth) / 2 + randomOffsetX;
      y = (viewportHeight - popupHeight) / 2 + randomOffsetY;
      break;
    case "top-left":
    default:
      x = props.x;
      y = props.y;
  }

  return { x, y };
};

const clampToViewport = (x: number, y: number) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const popupWidth = props.width;
  const popupHeight = popupElement.value?.offsetHeight || 200;

  const clampedX = Math.max(0, Math.min(x, viewportWidth - popupWidth));
  const clampedY = Math.max(0, Math.min(y, viewportHeight - popupHeight));

  return { x: clampedX, y: clampedY };
};

const popupStyle = computed(() => {
  const { x, y } = clampToViewport(position.value.x, position.value.y);
  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${props.width}px`,
    height: typeof props.height === "number" ? `${props.height}px` : "auto",
  };
});

const startDrag = (event: MouseEvent) => {
  isDragging.value = true;
  const rect = popupElement.value?.getBoundingClientRect();
  if (rect) {
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return;

  const newX = event.clientX - dragOffset.value.x;
  const newY = event.clientY - dragOffset.value.y;

  const clamped = clampToViewport(newX, newY);
  position.value = clamped;

  emit("update:x", clamped.x);
  emit("update:y", clamped.y);
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const close = () => {
  emit("hide");
};

const hide = () => {
  emit("hide");
};

onMounted(() => {
  // Position popup with anchor and clamp to viewport
  const anchoredPos = getAnchoredPosition();
  const clamped = clampToViewport(anchoredPos.x, anchoredPos.y);
  position.value = clamped;

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
});
</script>

<style scoped>
/* Smooth transitions for popup appearance */
.fixed {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
