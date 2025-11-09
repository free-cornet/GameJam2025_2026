<template>
    <ClientOnly>
    <PopupElement
        title="The Dino Game"
        anchor="center"
        :is-open="isOpen"
        @hide="handleHide"
        :width="600">
        <div id="app" style="display: flex; align-items: center; justify-content: center; height: 100vh;">
            <canvas ref="gameCanvas" width="600" height="400" style="border:2px solid grey;"></canvas>

            <button @click="start(); showText = !showText" v-show="showText"
                class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            >
                <div 
                class="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 border-2 border-gray-700"
                >
                    <div class="text-center mb-8">
                        <h2 class="text-4xl font-bold text-white mb-2">
                            <p>{{ message }}</p>
                        </h2>
                    </div>
                </div>
            </button>
        </div>
    </PopupElement>
    </ClientOnly>
</template>



<script setup>
import { useTemplateRef, onMounted, ref } from 'vue'
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
        {width: 60, height: 60, image: "../assets/robot.png"},
        {width: 60, height: 82, image: "../assets/robot_high.png"},
    ]

    const canvas = useTemplateRef('gameCanvas')
    const showText = ref('true')
    let ctx = null
    let previousTime = null;
    let triceratops = null;
    let robotsController = null;
    let gameSpeed = GAME_SPEED_START;
    let gameOver = false;
    let hasAddedEventListenersForRestart = false;
    let started = false;
    let score = null;
    let message = "Faites de votre mieux ! Nous verrons si vous avez l'habileté d'un être humain.";

    onMounted(() => {
        console.log(showText)
        canvas.value.focus()
        ctx = canvas.value.getContext("2d");
        //start()
    })

    function setScreen() {
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        createSprites();
    }

    function clearScreen () {
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
            console.log(scoreNum)
            if (scoreNum <= 50) {
                message = "Pfff... Seule un robot peut être aussi nul..."
            }else {
                if (scoreNum >= 100) {
                message = "Comment est-ce possible ??? Seule un robot peut être aussi fort !"
                } else {
                    //TODO won
                    message = "Juste en dessous de moi, c'est bon tu es un humain !"
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

        setScreen();

        requestAnimationFrame(gameLoop);

        //window.addEventListener("keyup", reset, { once: true });
        //window.addEventListener("touchstart", reset, { once: true });
    }

    defineExpose({ openCaptcha, showCaptcha, isOpen });
</script>
