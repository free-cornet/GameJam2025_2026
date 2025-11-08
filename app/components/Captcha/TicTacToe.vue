<template>
    <ClientOnly>
        <PopupElement
            title="Win the Tic-Tac-Toe game to solve this CAPTCHA"
            anchor="center"
            :is-open="isOpen"
            @hide="handleHide"
            :width="400"
        >
            <div class="min-w-sm">
                <!-- Instructions -->
                <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p class="text-sm text-gray-700">
                        <span class="font-semibold">You are X, computer is O.</span>
                        <br />
                        <span class="text-xs">Don't lose to proceed! (Win or draw)</span>
                    </p>
                </div>

                <!-- Game Status -->
                <div class="mb-4 text-center">
                    <p class="text-sm font-semibold" :class="gameStatusClass">
                        {{ gameStatus }}
                    </p>
                </div>

                <!-- Tic-Tac-Toe Board -->
                <div class="grid grid-cols-3 gap-2 mb-4 bg-gray-200 p-2 rounded">
                    <button
                        v-for="(cell, index) in board"
                        :key="index"
                        @click="playerMove(index)"
                        :disabled="cell !== null || gameOver || isComputerThinking"
                        class="bg-white hover:bg-gray-100 disabled:hover:bg-white text-2xl font-bold w-20 h-20 rounded border-2 border-gray-300 transition-colors"
                        :class="{
                            'text-blue-500': cell === 'X',
                            'text-red-500': cell === 'O',
                            'cursor-not-allowed': cell !== null || gameOver || isComputerThinking,
                        }"
                    >
                        {{ cell }}
                    </button>
                </div>

                <!-- Feedback Message -->
                <div v-if="feedbackMessage" class="mb-4 p-3 rounded" :class="feedbackClass">
                    {{ feedbackMessage }}
                </div>

                <!-- Buttons -->
                <div class="flex gap-3 justify-end">
                    <button
                        @click="resetGame"
                        class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        @click="verifyCaptcha"
                        :disabled="!canVerify || isVerifying"
                        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
                    >
                        {{ isVerifying ? "Verifying..." : "Verify" }}
                    </button>
                </div>
            </div>
        </PopupElement>
    </ClientOnly>
</template>

<script setup>
import { ref, computed } from "vue";

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
const board = ref(Array(9).fill(null));
const gameOver = ref(false);
const gameWon = ref(false);
const isComputerThinking = ref(false);

const gameStatus = computed(() => {
    if (!gameOver.value) {
        return isComputerThinking.value ? "Computer is thinking..." : "Your turn (X)";
    }
    if (gameWon.value) {
        return "🎉 You won!";
    }
    const winner = checkWinner();
    if (winner === "O") {
        return "Computer won! Try again.";
    }
    return "It's a draw!";
});

const gameStatusClass = computed(() => {
    if (gameWon.value) {
        return "text-green-600";
    }
    if (gameOver.value) {
        return "text-red-600";
    }
    return "text-gray-700";
});

const canVerify = computed(() => {
    return gameWon.value || (gameOver.value && checkWinner() !== "O");
});

// Winning combinations
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const checkWinner = () => {
    for (const [a, b, c] of winningCombinations) {
        if (board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]) {
            return board.value[a];
        }
    }
    return null;
};

const isBoardFull = () => board.value.every((cell) => cell !== null);

const playerMove = async (index) => {
    if (board.value[index] !== null || gameOver.value) return;

    board.value[index] = "X";

    // Check if player won
    const winner = checkWinner();
    if (winner === "X") {
        gameOver.value = true;
        gameWon.value = true;
        feedbackMessage.value = "✓ You won! Click verify to proceed.";
        feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";
        return;
    }

    // Check if board is full (draw)
    if (isBoardFull()) {
        gameOver.value = true;
        gameWon.value = false;
        feedbackMessage.value = "It's a draw! Click verify to proceed.";
        feedbackClass.value = "bg-yellow-50 border border-yellow-200 text-yellow-700";
        return;
    }

    // Computer's turn
    isComputerThinking.value = true;
    await new Promise((resolve) => setTimeout(resolve, 800));

    computerMove();
    isComputerThinking.value = false;

    // Check if computer won
    const computerWinner = checkWinner();
    if (computerWinner === "O") {
        gameOver.value = true;
        gameWon.value = false;
        feedbackMessage.value = "Computer won! Try again.";
        feedbackClass.value = "bg-red-50 border border-red-200 text-red-700";
        return;
    }

    // Check if board is full (draw)
    if (isBoardFull()) {
        gameOver.value = true;
        gameWon.value = false;
        feedbackMessage.value = "It's a draw! Click verify to proceed.";
        feedbackClass.value = "bg-yellow-50 border border-yellow-200 text-yellow-700";
        return;
    }

    feedbackMessage.value = "";
};

const computerMove = () => {
    // Simple AI: Check if computer can win
    for (const [a, b, c] of winningCombinations) {
        const cells = [board.value[a], board.value[b], board.value[c]];
        if (cells.filter((c) => c === "O").length === 2 && cells.filter((c) => c === null).length === 1) {
            const emptyIndex = [a, b, c].find((i) => board.value[i] === null);
            board.value[emptyIndex] = "O";
            return;
        }
    }

    // Check if player can win and block
    for (const [a, b, c] of winningCombinations) {
        const cells = [board.value[a], board.value[b], board.value[c]];
        if (cells.filter((c) => c === "X").length === 2 && cells.filter((c) => c === null).length === 1) {
            const emptyIndex = [a, b, c].find((i) => board.value[i] === null);
            board.value[emptyIndex] = "O";
            return;
        }
    }

    // Take center if available
    if (board.value[4] === null) {
        board.value[4] = "O";
        return;
    }

    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter((i) => board.value[i] === null);
    if (availableCorners.length > 0) {
        board.value[availableCorners[Math.floor(Math.random() * availableCorners.length)]] = "O";
        return;
    }

    // Take any available space
    const emptyIndex = board.value.findIndex((cell) => cell === null);
    if (emptyIndex !== -1) {
        board.value[emptyIndex] = "O";
    }
};

const resetGame = () => {
    board.value = Array(9).fill(null);
    gameOver.value = false;
    gameWon.value = false;
    feedbackMessage.value = "";
    feedbackClass.value = "";
    isComputerThinking.value = false;
};

const verifyCaptcha = async () => {
    if (!canVerify.value) return;

    isVerifying.value = true;

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    feedbackMessage.value = "✓ CAPTCHA solved!";
    feedbackClass.value = "bg-green-50 border border-green-200 text-green-700";

    setTimeout(() => {
        emit("verified", props.popupId);
        handleClose();
    }, 1500);

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

const openCaptcha = () => {
    resetGame();
    isOpen.value = true;
};

const showCaptcha = () => {
    isOpen.value = true;
};

// Expose methods for external use
defineExpose({ openCaptcha, showCaptcha, isOpen });
</script>

<style scoped>
button:disabled {
    cursor: not-allowed;
}
</style>
