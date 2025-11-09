<template>
    <ClientOnly>
    <PopupElement
        title="The Dino Game"
        anchor="center"
        :is-open="isOpen"
        @hide="handleHide"
        :width="500">
        <div id="app" class="relative w-full flex flex-col items-center justify-center">
            <div class="relative w-full">
                <canvas ref="gameCanvas" class="border-2 w-full" width="600" height="400"></canvas>

                <button @click="handleGameOverClick" v-show="showText"
                    class="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 rounded w-full h-full"
                >
                    <div 
                    class="bg-gray-800 rounded-lg shadow-2xl p-4 w-5/6 border-2 border-gray-700 flex flex-col gap-3"
                    >
                        <div class="text-center">
                            <h2 class="text-lg font-bold text-white">
                                <p>{{ message }}</p>
                            </h2>
                        </div>
                        <div v-if="canValidate" class="flex gap-2 justify-center">
                            <button
                                @click.stop="handleValidate"
                                class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors font-semibold"
                            >
                                Validate
                            </button>
                            <button
                                @click.stop="handleRetry"
                                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors font-semibold"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    </PopupElement>
    </ClientOnly>
</template>

<script setup>
import { useTemplateRef, onMounted, ref, nextTick } from 'vue'
import { Triceratops  } from '~/class/Triceratops';
import { RobotsController } from '~/class/RobotsController';
import { Score } from '~/class/Score';

    //popup constants
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


    const GAME_WIDTH = 600;
    const GAME_HEIGHT = 225;
    const TRIC_WIDTH = 120;
    const TRIC_HEIGHT = 72;
    const MAX_JUMP_HEIGHT = GAME_HEIGHT
    const MIN_JUMP_HEIGHT = 150
    const GAME_SPEED_START = 1;
    const GAME_SPEED_INCREMENT = 0.00002;
    const ROBOT_SPEED = 0.5;
    const ROBOT_CONFIG = [
        {width: 60, height: 60, image: "/captcha/dino/robot.png"},
        {width: 60, height: 82, image: "/captcha/dino/robot_high.png"},
    ]

    const canvas = useTemplateRef('gameCanvas')
    const showText = ref('true')
    const canValidate = ref(false)
    let ctx = null
    let previousTime = null;
    let triceratops = null;
    let robotsController = null;
    let gameSpeed = GAME_SPEED_START;
    let gameOver = false;
    let hasAddedEventListenersForRestart = false;
    let started = false;
    let score = null;
    let message = "Let's jump (spacebar) to prove you're human!";
    let lastScore = 0;

    onMounted(async () => {
        await nextTick();
        if (canvas.value) {
            canvas.value.focus();
            ctx = canvas.value.getContext("2d");
            //start()
            // Add mouse click listener to canvas
            canvas.value.addEventListener("click", handleCanvasClick);
        }
    });

    function setScreen() {
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        createSprites();
    }

    function clearScreen () {
        if (ctx == null && canvas.value != null) {
            canvas.value.focus();
            ctx = canvas.value.getContext("2d");
        }
        ctx.fillStyle = "white"
        ctx.fillRect(0,0, canvas.value.width, canvas.value.height)
    }

    function createSprites() {
        triceratops = new Triceratops(
            ctx,
            canvas,
            TRIC_WIDTH,
            TRIC_HEIGHT,
            MAX_JUMP_HEIGHT,
            MIN_JUMP_HEIGHT
        )

        const robotsImages = ROBOT_CONFIG.map((robot) => {
            const image = new Image();
            image.src = new URL(robot.image, import.meta.url).href;
            return {
            image: image,
            width: robot.width,
            height: robot.height
            };
        });

        robotsController = new RobotsController(
            ctx,
            canvas,
            robotsImages,
            ROBOT_SPEED
        );

        score = new Score(ctx, canvas)

    }

    function setupGameReset() {
        if (!hasAddedEventListenersForRestart) {
            hasAddedEventListenersForRestart = true;

            /*setTimeout(() => {
            window.addEventListener("keyup", reset, { once: true });
            window.addEventListener("touchstart", reset, { once: true });
            }, 1000);*/
        }
    }

    function reset() {
        hasAddedEventListenersForRestart = false;
        gameOver = false;
        started = true;
        robotsController.reset();
        score.reset();
        gameSpeed = GAME_SPEED_START;
    }

    function showGameOver() {
        const fontSize = 60;
        ctx.font = `${fontSize}px Verdana`;
        ctx.fillStyle = "grey";
        const x = canvas.value.width / 4.5;
        const y = canvas.value.height / 2;
        ctx.fillText("GAME OVER", x, y);
    }

    function showStart() {
        const fontSize = 40
        ctx.font = `${fontSize}px Verdana`;
        ctx.fillStyle = "grey";
        const x = canvas.value.width / 7;
        const y = canvas.value.height / 2;
        ctx.fillText("Press Space To Start", x, y);
    }

    function gameLoop(currentTime) {
        if (previousTime === null) {
            previousTime = currentTime;
            requestAnimationFrame(gameLoop);
            return;
        }
        const frameTimeDelta = currentTime - previousTime;
        previousTime = currentTime;

        clearScreen();

        gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;

        if (!gameOver && started && !showText.value) {
            //Update game objects
            triceratops.update(gameSpeed, frameTimeDelta);
            robotsController.update(gameSpeed, frameTimeDelta);
            score.update(frameTimeDelta)
            gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT
        }

        if (!gameOver && robotsController.collideWith(triceratops)) {
            gameOver = true;
            //setupGameReset();
        }

        //Draw game objects
        triceratops.draw();
        robotsController.draw();
        score.draw();

        if (gameOver) {
            showGameOver();
            let scoreNum = score.getScore()
            lastScore = scoreNum;
            if (scoreNum <= 50) {
                message = "Sheeesh... Only a robot can be this bad!"
                canValidate.value = false
            }else {
                if (scoreNum >= 100) {
                message = "Damn... Only a robot can be this good!"
                canValidate.value = false
                } else {
                    message = "Mediocre enough to be human."
                    canValidate.value = true
                }
            }
            showText.value = true
        }

        if (!started) {
            showStart();
        }

        requestAnimationFrame(gameLoop);
    }

    function start() {
        if (robotsController) {
            reset();
        }

        started = true

        if (ctx == null && canvas.value != null) {
            canvas.value.focus();
            ctx = canvas.value.getContext("2d");
        }

        setScreen();

        requestAnimationFrame(gameLoop);

        //window.addEventListener("keyup", reset, { once: true });
        //window.addEventListener("touchstart", reset, { once: true });
    }

    function handleGameOverClick() {
        if (!canValidate.value) {
            start();
            showText.value = false;
        }
    }

    function handleCanvasClick() {
        if (triceratops) {
            triceratops.jumpPressed = true;
        }
    }

    function handleValidate() {
        emit("verified", props.popupId);
        handleClose();
    }

    function handleRetry() {
        canValidate.value = false;
        start();
        showText.value = false;
    }

    defineExpose({ openCaptcha, showCaptcha, isOpen });
</script>
