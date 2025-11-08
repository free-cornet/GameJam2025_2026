<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <h1 class="text-3xl font-bold mb-6">CAPTCHA Verification</h1>

    <canvas ref="captchaCanvas" width="200" height="80" class="mb-4 border rounded shadow"></canvas>

    <input
      v-model="userInput"
      type="text"
      placeholder="Enter the characters"
      class="mb-4 px-4 py-2 border rounded w-64"
    />

    <button
      @click="verifyCaptcha"
      class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
    >
      Submit
    </button>

    <p v-if="resultMessage" class="mt-4 text-lg font-medium" :class="resultColor">
      {{ resultMessage }}
    </p>
  </div>
</template>

<script setup>

function getRandomColor() {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgb(${r},${g},${b})`;
}


import { ref, onMounted } from 'vue';

const captchaText = ref('');
const userInput = ref('');
const resultMessage = ref('');
const resultColor = ref('');

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789&/*\§!?@#%$';
  captchaText.value = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

const drawCaptcha = () => {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const spacing = canvas.width / (captchaText.value.length + 1);

  for (let i = 0; i < captchaText.value.length; i++) {
    const char = captchaText.value[i];

    // Random font size between 28px and 42px
    const fontSize = Math.floor(Math.random() * 15) + 28;

    // Pick a random font family
    const fontFamilies = [
      'Arial', 'Georgia', 'Courier New', 'Verdana', 'Comic Sans MS',
      'Impact', 'Brush Script MT', 'Lucida Console', 'Papyrus', 'Times New Roman'
    ];
    const fontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = '#333';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const x = spacing * (i + 1);
    const y = canvas.height / 2;

    ctx.fillText(char, x, y);
  }

  // Add noise: circles, lines, rectangles, ghost text
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3, 0, Math.PI * 2);
    ctx.fillStyle = getRandomColor();
    ctx.fill();
  }

  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.strokeStyle = getRandomColor();
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = getRandomColor();
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 10, Math.random() * 10);
  }

  const ghostFonts = ['italic 18px Courier', 'bold 18px Arial', '18px Comic Sans MS'];
  const ghostChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < 5; i++) {
    ctx.font = ghostFonts[Math.floor(Math.random() * ghostFonts.length)];
    ctx.fillStyle = getRandomColor();
    ctx.fillText(
      ghostChars[Math.floor(Math.random() * ghostChars.length)],
      Math.random() * canvas.width,
      Math.random() * canvas.height
    );
  }
};


const verifyCaptcha = () => {
  if (userInput.value.toUpperCase() === captchaText.value) {
    resultMessage.value = '✅ Verification successful!';
    resultColor.value = 'text-green-600';
  } else {
    resultMessage.value = '❌ Incorrect. Please try again.';
    resultColor.value = 'text-red-600';
    generateCaptcha();
    drawCaptcha();
    userInput.value = '';
  }
};

onMounted(() => {
  generateCaptcha();
  drawCaptcha();
});
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
}
</style>
