# Captcha Manager System

A centralized, easy-to-use system for managing captchas in the game.

## Overview

The captcha manager automatically handles:
- ✅ Captcha registration and lifecycle
- ✅ Random selection with configurable weights
- ✅ Dynamic component rendering
- ✅ Popup management (show/hide/close)
- ✅ Ref forwarding and method exposure

## Quick Start

### Adding a New Captcha

1. **Create your captcha component** in `app/components/Captcha/`

```vue
<!-- app/components/Captcha/YourNewCaptcha.vue -->
<template>
    <ClientOnly>
        <PopupElement
            title="Your Captcha Title"
            anchor="center"
            :is-open="isOpen"
            @hide="handleHide"
            :width="400"
        >
            <!-- Your captcha UI here -->
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

const isOpen = ref(false);

// Your captcha logic here

const handleClose = () => {
    emit("closed", props.popupId);
    isOpen.value = false;
};

const handleHide = () => {
    isOpen.value = false;
    emit("hide", props.popupId);
};

const openCaptcha = () => {
    // Reset/initialize your captcha
    isOpen.value = true;
};

const showCaptcha = () => {
    isOpen.value = true;
};

// REQUIRED: Expose these methods
defineExpose({ openCaptcha, showCaptcha, isOpen });
</script>
```

2. **Register your captcha** in `app/plugins/captcha.client.js`

```javascript
import YourNewCaptcha from "~/components/Captcha/YourNewCaptcha.vue";

// Add this line inside the plugin:
registerCaptcha("YourCaptchaName", YourNewCaptcha, 1);
```

**That's it!** Your captcha is now automatically available and will be randomly selected.

## Component Requirements

Your captcha component must:

1. **Accept props:**
   - `popupId` (Number, required)

2. **Emit events:**
   - `verified` - When captcha is successfully solved
   - `closed` - When captcha is closed
   - `hide` - When captcha is hidden (minimized)
   - `spawnNew` - (Optional) When you want to spawn an additional captcha

3. **Expose methods:**
   - `openCaptcha()` - Opens and initializes the captcha
   - `showCaptcha()` - Shows a hidden captcha
   - `isOpen` - Ref indicating if the captcha is open

## Using the Captcha Manager

### In Your Page Component

```vue
<template>
  <div>
    <!-- Render all active captchas -->
    <CaptchaWrapper
      v-for="popup in captchaManager.popups.value"
      :key="popup.id"
      :captcha-type="popup.captchaType"
      :popup-id="popup.id"
      :ref="(el) => captchaManager.registerRef(popup.id, el)"
      v-show="popup.isVisible"
      @verified="onCaptchaVerified"
      @spawnNew="onCaptchaSpawnNew"
      @closed="onCaptchaClosed"
      @hide="onCaptchaHide"
    />
  </div>
</template>

<script setup>
import { useCaptchaManager } from "~/composables/useCaptchaManager";

const captchaManager = useCaptchaManager();

// Spawn a random captcha
const spawnRandomCaptcha = () => {
  const id = captchaManager.addPopup(); // No type = random
  setTimeout(() => captchaManager.openCaptcha(id), 50);
};

// Spawn a specific captcha type
const spawnSpecificCaptcha = () => {
  const id = captchaManager.addPopup("TicTacToe");
  setTimeout(() => captchaManager.openCaptcha(id), 50);
};

const onCaptchaVerified = (popupId) => {
  captchaManager.removePopup(popupId);
  
  if (captchaManager.allPopupsSolved.value) {
    // All captchas solved!
  }
};
</script>
```

## API Reference

### `registerCaptcha(name, component, weight)`
Register a new captcha type.

- `name` (string) - Unique identifier for the captcha
- `component` (Component) - Vue component
- `weight` (number) - Selection weight (default: 1). Higher = more likely to be selected

### `useCaptchaManager()`
Composable that returns:

#### Properties
- `popups` - Ref array of active popups
- `captchaRefs` - Ref object storing component references
- `allPopupsSolved` - Computed boolean
- `getActivePopupCount` - Computed number of active captchas
- `getHiddenPopups` - Computed array of hidden popups

#### Methods
- `addPopup(captchaType?)` - Add a new captcha (random if no type)
- `removePopup(id)` - Remove a captcha
- `hidePopup(id)` - Hide a captcha
- `showPopup(id)` - Show a hidden captcha
- `closePopup(id)` - Close a captcha
- `registerRef(id, el)` - Register component ref
- `openCaptcha(id)` - Open and initialize captcha
- `showCaptchaPopup(id)` - Show and display captcha
- `reset()` - Reset all captchas
- `getCaptchaComponent(type)` - Get component by type

## Examples

### Multiple Random Captchas
```javascript
const spawnMultipleCaptchas = () => {
  const ids = [];
  for (let i = 0; i < 3; i++) {
    ids.push(captchaManager.addPopup());
  }
  setTimeout(() => {
    ids.forEach(id => captchaManager.openCaptcha(id));
  }, 50);
};
```

### Weighted Random Selection
```javascript
// In captcha.client.js
registerCaptcha("Easy", EasyCaptcha, 3);    // 3x more likely
registerCaptcha("Medium", MediumCaptcha, 2); // 2x more likely
registerCaptcha("Hard", HardCaptcha, 1);     // Normal likelihood
```

### Spawn New Captcha on Failure
```javascript
const onCaptchaSpawnNew = (popupId) => {
  // Spawn additional captcha when user fails
  const newId = captchaManager.addPopup();
  setTimeout(() => captchaManager.openCaptcha(newId), 50);
};
```

## File Structure

```
app/
├── components/
│   ├── CaptchaWrapper.vue          # Universal captcha renderer
│   └── Captcha/
│       ├── Images.vue              # Example: Image selection captcha
│       ├── TicTacToe.vue          # Example: Tic-tac-toe captcha
│       └── YourNewCaptcha.vue     # Your new captcha here
├── composables/
│   └── useCaptchaManager.js       # Main captcha manager
└── plugins/
    └── captcha.client.js          # Captcha registration
```

## Migration from Old System

The old system required:
- Manual component imports in every page
- Manual type definitions
- Complex ref management
- Repetitive v-if logic

The new system requires:
- Single import: `useCaptchaManager`
- Single component: `CaptchaWrapper`
- Automatic type registration
- No manual ref management

Simply replace your old captcha rendering code with the new `CaptchaWrapper` component!
