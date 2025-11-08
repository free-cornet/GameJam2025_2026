import { ref, computed } from "vue";



export const dinoText = () => {
  const popups = ref([]);
  let popupIdCounter = 0;

  const addPopup = () => {
    const id = popupIdCounter++;
    popups.value.push({
      id,
      isOpen: true,
      isVisible: true,
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
    popupIdCounter = 0;
  };

  return {
    popups,
    addPopup,
    hidePopup,
    showPopup,
    closePopup,
    removePopup,
    allPopupsSolved,
    getActivePopupCount,
    getHiddenPopups,
    reset,
  };
};
