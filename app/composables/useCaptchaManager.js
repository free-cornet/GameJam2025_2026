import { ref, computed, markRaw } from "vue";

// Captcha registry - add new captchas here
const captchaRegistry = new Map();

/**
 * Register a new captcha type
 * @param {string} name - Unique name for the captcha
 * @param {Component} component - Vue component for the captcha
 * @param {number} weight - Weight for random selection (higher = more likely)
 */
export const registerCaptcha = (name, component, weight = 1) => {
  captchaRegistry.set(name, {
    name,
    component: markRaw(component),
    weight,
  });
};

/**
 * Get all registered captcha types
 */
export const getRegisteredCaptchas = () => {
  return Array.from(captchaRegistry.keys());
};

/**
 * Get a random captcha type based on weights
 */
export const getRandomCaptchaType = () => {
  const captchas = Array.from(captchaRegistry.values());
  const totalWeight = captchas.reduce((sum, captcha) => sum + captcha.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const captcha of captchas) {
    random -= captcha.weight;
    if (random <= 0) {
      return captcha.name;
    }
  }
  
  return captchas[0]?.name;
};

/**
 * Get captcha component by type
 */
export const getCaptchaComponent = (type) => {
  return captchaRegistry.get(type)?.component;
};

/**
 * Composable for managing captchas in a component
 */
export const useCaptchaManager = () => {
  const popups = ref([]);
  const captchaRefs = ref({});
  let popupIdCounter = 0;

  const addPopup = (captchaType = null) => {
    // If no type specified, pick a random one
    const type = captchaType || getRandomCaptchaType();
    const id = popupIdCounter++;
    
    popups.value.push({
      id,
      isOpen: true,
      isVisible: true,
      captchaType: type,
    });
    
    return id;
  };

  const hidePopup = (id) => {
    const popup = popups.value.find((p) => p.id === id);
    if (popup) {
      popup.isVisible = false;
    }
  };

  const showPopup = (id) => {
    const popup = popups.value.find((p) => p.id === id);
    if (popup) {
      popup.isVisible = true;
    }
  };

  const closePopup = (id) => {
    const popup = popups.value.find((p) => p.id === id);
    if (popup) {
      popup.isOpen = false;
    }
  };

  const removePopup = (id) => {
    popups.value = popups.value.filter((p) => p.id !== id);
    delete captchaRefs.value[id];
  };

  const registerRef = (popupId, el) => {
    if (el) {
      captchaRefs.value[popupId] = el;
    } else {
      delete captchaRefs.value[popupId];
    }
  };

  const openCaptcha = (popupId) => {
    const captcha = captchaRefs.value[popupId];
    if (captcha) {
      captcha.openCaptcha();
    }
  };

  const showCaptchaPopup = (popupId) => {
    showPopup(popupId);
    const captcha = captchaRefs.value[popupId];
    if (captcha) {
      captcha.showCaptcha();
    }
  };

  const allPopupsSolved = computed(() => {
    return popups.value.length === 0;
  });

  const getActivePopupCount = computed(() => {
    return popups.value.filter((p) => p.isOpen).length;
  });

  const getHiddenPopups = computed(() => {
    return popups.value.filter((p) => !p.isVisible);
  });

  const reset = () => {
    popups.value = [];
    captchaRefs.value = {};
    popupIdCounter = 0;
  };

  return {
    popups,
    captchaRefs,
    addPopup,
    hidePopup,
    showPopup,
    closePopup,
    removePopup,
    registerRef,
    openCaptcha,
    showCaptchaPopup,
    allPopupsSolved,
    getActivePopupCount,
    getHiddenPopups,
    reset,
    getCaptchaComponent,
  };
};
