<template>
    <component
        :is="captchaComponent"
        v-if="captchaComponent"
        :popup-id="popupId"
        v-bind="$attrs"
        :ref="forwardRef"
    />
</template>

<script setup>
import { computed } from "vue";
import { getCaptchaComponent } from "~/composables/useCaptchaManager";

const props = defineProps({
    captchaType: {
        type: String,
        required: true,
    },
    popupId: {
        type: Number,
        required: true,
    },
});

const captchaComponent = computed(() => getCaptchaComponent(props.captchaType));

const forwardRef = (el) => {
    // Forward the ref to parent
    if (el) {
        // Expose all methods from the captcha component
        Object.keys(el).forEach(key => {
            if (typeof el[key] === 'function' || key === 'isOpen') {
                expose[key] = el[key];
            }
        });
    }
};

const expose = {};
defineExpose(expose);
</script>
