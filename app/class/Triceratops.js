export class Triceratops {
        WALK_ANIMATION_TIMER = 200;
        walkAnimationTimer = this.WALK_ANIMATION_TIMER;
        dinoRunImages = [];

        jumpPressed = false;
        jumpInProgress = false;
        falling = false;
        JUMP_INITIAL_VELOCITY = 0.8;
        GRAVITY = 0.002;
        velocityY = 0; // Current vertical velocity

        constructor(ctx, canvas, width, height, minJumpHeight, maxJumpHeight) {
            this.ctx = ctx;
            this.canvas = canvas;
            this.width = width;
            this.height = height;
            this.minJumpHeight = minJumpHeight;
            this.maxJumpHeight = maxJumpHeight;

            this.x = 10;
            this.y = this.canvas.value.height - this.height - 1.5;
            this.yStandingPosition = this.y;

            this.triceratops_still = new Image();
            this.triceratops_still.src = new URL("../assets/triceratops_still.png", import.meta.url).href;
            this.image = this.triceratops_still;

            const dinoRunImage1 = new Image();
            dinoRunImage1.src = new URL("../assets/triceratops_run1.png", import.meta.url).href;

            const dinoRunImage2 = new Image();
            dinoRunImage2.src = new URL("../assets/triceratops_run2.png", import.meta.url).href;

            this.dinoRunImages.push(dinoRunImage1);
            this.dinoRunImages.push(dinoRunImage2);

            //keyboard
            window.removeEventListener("keydown", this.keydown);
            window.removeEventListener("keyup", this.keyup);

            window.addEventListener("keydown", this.keydown);
            window.addEventListener("keyup", this.keyup);

            //touch
            window.removeEventListener("touchstart", this.touchstart);
            window.removeEventListener("touchend", this.touchend);

            window.addEventListener("touchstart", this.touchstart);
            window.addEventListener("touchend", this.touchend);
        }

        touchstart = () => {
            this.jumpPressed = true;
        };

        touchend = () => {
            this.jumpPressed = false;
        };

        keydown = (event) => {
            if (event.code === "Space") {
            this.jumpPressed = true;
            }
        };

        keyup = (event) => {
            if (event.code === "Space") {
            this.jumpPressed = false;
            }
        };

        update(gameSpeed, frameTimeDelta) {
            this.run(gameSpeed, frameTimeDelta);

            if (this.jumpInProgress) {
            this.image = this.triceratops_still;
            }

            this.jump(frameTimeDelta);
        }

        jump(frameTimeDelta) {
            // Initiate jump when space or click is pressed and dino is on ground
            if (this.jumpPressed && !this.jumpInProgress && !this.falling) {
                this.jumpInProgress = true;
                this.velocityY = -this.JUMP_INITIAL_VELOCITY; // Negative = upward
                this.falling = true; // Start falling phase immediately
            }

            // Apply gravity and update vertical position
            if (this.jumpInProgress || this.falling) {
                this.velocityY += this.GRAVITY * frameTimeDelta; // Apply gravity
                this.y += this.velocityY * frameTimeDelta;

                // Check if landed
                if (this.y >= this.yStandingPosition) {
                    this.y = this.yStandingPosition;
                    this.velocityY = 0;
                    this.falling = false;
                    this.jumpInProgress = false;
                }
            }
        }

        run(gameSpeed, frameTimeDelta) {
            if (this.walkAnimationTimer <= 0) {
            if (this.image === this.dinoRunImages[0]) {
                this.image = this.dinoRunImages[1];
            } else {
                this.image = this.dinoRunImages[0];
            }
            this.walkAnimationTimer = this.WALK_ANIMATION_TIMER;
            }
            this.walkAnimationTimer -= frameTimeDelta * gameSpeed;
        }

        draw() {
            this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }