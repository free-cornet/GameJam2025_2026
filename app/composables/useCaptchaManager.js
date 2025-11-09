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
 * Get a random captcha type based on weights (excluding already solved ones)
 */
export const getRandomUnsolvedCaptchaType = (solvedSet = new Set()) => {
  const captchas = Array.from(captchaRegistry.values()).filter(
    (captcha) => !solvedSet.has(captcha.name)
  );
  
  if (captchas.length === 0) {
    // All captchas solved, return any random one
    return getRandomCaptchaType();
  }
  
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
  const solvedCaptchas = ref(new Set()); // Track which captcha types have been solved
  let popupIdCounter = 0;

  // Local storage keys
  const STORAGE_INITIAL_COUNT_KEY = 'captcha_initial_count';
  const STORAGE_SOLVED_KEY = 'captcha_solved_types';
  const STORAGE_POPUP_STATE_KEY = 'captcha_popup_state';
  const STORAGE_POPUP_COUNTER_KEY = 'captcha_popup_id_counter';

  /**
   * Save initial captcha count to local storage
   */
  const saveInitialCaptchaCount = (count) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_INITIAL_COUNT_KEY, count.toString());
    }
  };

  /**
   * Get initial captcha count from local storage
   */
  const getInitialCaptchaCount = () => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem(STORAGE_INITIAL_COUNT_KEY) || '0', 10);
    }
    return 0;
  };

  /**
   * Save solved captcha types to local storage
   */
  const saveSolvedCaptchas = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SOLVED_KEY, JSON.stringify(Array.from(solvedCaptchas.value)));
    }
  };

  /**
   * Load solved captcha types from local storage
   */
  const loadSolvedCaptchas = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_SOLVED_KEY);
      if (saved) {
        try {
          solvedCaptchas.value = new Set(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load solved captchas from storage:', e);
        }
      }
    }
  };

  /**
   * Save current popup state to local storage
   */
  const savePopupState = () => {
    if (typeof window !== 'undefined') {
      const state = popups.value.map(p => ({
        id: p.id,
        captchaType: p.captchaType,
        isVisible: p.isVisible,
        isOpen: p.isOpen,
      }));
      localStorage.setItem(STORAGE_POPUP_STATE_KEY, JSON.stringify(state));
      localStorage.setItem(STORAGE_POPUP_COUNTER_KEY, popupIdCounter.toString());
    }
  };

  /**
   * Load popup state from local storage
   */
  const loadPopupState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_POPUP_STATE_KEY);
      const savedCounter = localStorage.getItem(STORAGE_POPUP_COUNTER_KEY);
      
      if (saved) {
        try {
          const state = JSON.parse(saved);
          popups.value = state;
          if (savedCounter) {
            popupIdCounter = parseInt(savedCounter, 10);
          }
          return true;
        } catch (e) {
          console.error('Failed to load popup state from storage:', e);
        }
      }
    }
    return false;
  };

  /**
   * Clear all stored captcha data
   */
  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_INITIAL_COUNT_KEY);
      localStorage.removeItem(STORAGE_SOLVED_KEY);
      localStorage.removeItem(STORAGE_POPUP_STATE_KEY);
      localStorage.removeItem(STORAGE_POPUP_COUNTER_KEY);
    }
  };

  const addPopup = (captchaType = null) => {
    // If no type specified, pick a random one (but not one already solved)
    let type = captchaType;
    
    if (!type) {
      // Get a random captcha type that hasn't been solved yet
      type = getRandomUnsolvedCaptchaType(solvedCaptchas.value);
    }
    
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
    solvedCaptchas.value = new Set();
    popupIdCounter = 0;
  };

  const markCaptchaSolved = (captchaType) => {
    solvedCaptchas.value.add(captchaType);
    saveSolvedCaptchas();
  };

  const isCaptchaSolved = (captchaType) => {
    return solvedCaptchas.value.has(captchaType);
  };

  const getAllCaptchaTypes = () => {
    return getRegisteredCaptchas();
  };

  const areAllCaptchasSolved = computed(() => {
    const allTypes = getAllCaptchaTypes();
    return allTypes.every((type) => solvedCaptchas.value.has(type));
  });

  const getSolvedCaptchasCount = computed(() => {
    return solvedCaptchas.value.size;
  });

  const getTotalCaptchasCount = computed(() => {
    return getRegisteredCaptchas().length;
  });

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
    markCaptchaSolved,
    isCaptchaSolved,
    getAllCaptchaTypes,
    areAllCaptchasSolved,
    getSolvedCaptchasCount,
    getTotalCaptchasCount,
    solvedCaptchas,
    saveInitialCaptchaCount,
    getInitialCaptchaCount,
    saveSolvedCaptchas,
    loadSolvedCaptchas,
    savePopupState,
    loadPopupState,
    clearStorage,
  };
};
