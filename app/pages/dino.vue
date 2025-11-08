<template>
  <div id="app" style="display: flex; align-items: center; justify-content: center; height: 100vh;">
    <canvas ref="gameCanvas" width="600" height="400" style="border:2px solid grey;"></canvas>
  </div>
</template>



<script setup>
import { useTemplateRef, onMounted } from 'vue'
import { Triceratops  } from '~/class/Triceratops';
import { RobotsController } from '~/class/RobotsController';
import { Score } from '~/class/Score';

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
    let ctx = null
    let previousTime = null;
    let triceratops = null;
    let robotsController = null;
    let gameSpeed = GAME_SPEED_START;
    let gameOver = false;
    let hasAddedEventListenersForRestart = false;
    let started = false;
    let score = null;

    onMounted(() => {
        canvas.value.focus()
        ctx = canvas.value.getContext("2d");
        start()
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

            setTimeout(() => {
            window.addEventListener("keyup", reset, { once: true });
            window.addEventListener("touchstart", reset, { once: true });
            }, 1000);
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

        if (!gameOver && started) {
            //Update game objects
            triceratops.update(gameSpeed, frameTimeDelta);
            robotsController.update(gameSpeed, frameTimeDelta);
            score.update(frameTimeDelta)
            gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT
        }

        if (!gameOver && robotsController.collideWith(triceratops)) {
            gameOver = true;
            setupGameReset();
        }

        //Draw game objects
        triceratops.draw();
        robotsController.draw();
        score.draw();

        if (gameOver) {
            showGameOver();
        }

        if (!started) {
            showStart();
        }

        requestAnimationFrame(gameLoop);
    }

    function story() {
        ctx.fillStyle = "black"
        ctx.fillRect( 50, 50, 500, 300) //pos x, pos y, width, height
        ctx.fillStyle = "white"
        ctx.fillRect( 55, 55, 490, 290)

        const fontSize = 60
        ctx.font = `${fontSize}px Verdana`;
        ctx.fillStyle = "black";
        const x = canvas.value.width / 7;
        const y = canvas.value.height / 2;
        ctx.fillText("Voici un test d'adresse,<br> faites de votre mieux !", x, y);
    }

    function start() {
        story()

        /*setTimeout(() => {
            setScreen();

            requestAnimationFrame(gameLoop);

            window.addEventListener("keyup", reset, { once: true });
            window.addEventListener("touchstart", reset, { once: true });
        }, 20000);*/
    }

</script>
