<template>
  <div id="app">
    <canvas ref="gameCanvas"></canvas>
    <div 
      class="character" 
      :class="{ walking: isWalking }"
      :style="{ 
        left: stickman.x + 'px', 
        top: (stickman.y - 70) + 'px',
        transform: currentDirection
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: "SpriteGame",
  data() {
    return {
      trapCount: 0,
      isWalking: false,
      currentDirection: 'scaleX(1)', // Store current direction
      stickman: {
        x: 100,
        y: 0,
        velocityY: 0,
        isJumping: false,
        speed: 3,
        animationFrame: null,
      },
      ground: {
        y: 0,
      },
      canvasWidth: 0,
      canvasHeight: 0,
      gravity: 0.5,
      keys: {
        left: false,
        right: false,
      },
      stone: {
        x: 0,
        y: 0,
        velocityY: 9,
        radius: 0,
        active: false
      },
    };
  },

  computed: {
    initialGroundY() {
      return window.innerHeight * 0.75;
    },
    initialStoneX() {
      return window.innerWidth / 2;
    },
    initialStoneY() {
      return 0 - window.innerWidth / 2;
    },
    initialStoneRadius() {
      return window.innerWidth / 2;
    }
  },

  mounted() {
    this.setCanvasSize();
    this.ground.y = this.initialGroundY;
    this.stickman.y = this.ground.y - 20;
    this.stone.x = this.initialStoneX;
    this.stone.y = this.initialStoneY;
    this.stone.radius = this.initialStoneRadius;
    this.trapCount = localStorage.getItem('trapCount') ? parseInt(localStorage.getItem('trapCount')) : 0;

    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
    window.addEventListener("resize", this.handleResize);

    this.animate();
  },

  beforeDestroy() {
    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keyup", this.keyUp);
    window.removeEventListener("resize", this.handleResize);
    cancelAnimationFrame(this.stickman.animationFrame);
  },

  methods: {
    setCanvasSize() {
      const canvas = this.$refs.gameCanvas;
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight;
      canvas.width = this.canvasWidth;
      canvas.height = this.canvasHeight;
    },

    handleResize() {
      this.setCanvasSize();
      this.ground.y = this.canvasHeight * 0.75;
      this.stickman.y = this.ground.y - 20;
    },

    keyDown(e) {
      if (e.key === "ArrowRight") {
        this.keys.right = true;
        this.isWalking = true;
        this.currentDirection = 'scaleX(1)';
      }
      if (e.key === "ArrowLeft") {
        this.keys.left = true;
        this.isWalking = true;
        this.currentDirection = 'scaleX(-1)';
      }
      if (e.key === " " && !this.stickman.isJumping) {
        this.stickman.velocityY = -10;
        this.stickman.isJumping = true;
      }
    },

    keyUp(e) {
      if (e.key === "ArrowRight") {
        this.keys.right = false;
        if (!this.keys.left) this.isWalking = false;
      }
      if (e.key === "ArrowLeft") {
        this.keys.left = false;
        if (!this.keys.right) this.isWalking = false;
      }
    },

    animate() {
      if (this.keys.right) this.stickman.x += this.stickman.speed;
      if (this.keys.left) this.stickman.x -= this.stickman.speed;

      // Horizontal boundaries
      const margin = 64; // Half of sprite width
      if (this.stickman.x < margin) this.stickman.x = margin;
      if (this.stickman.x > this.canvasWidth - margin) this.stickman.x = this.canvasWidth - margin;

      this.stickman.velocityY += this.gravity;
      this.stickman.y += this.stickman.velocityY;

      // Ground collision
      const groundLevel = this.ground.y - 20;
      if (this.stickman.y > groundLevel) {
        this.stickman.y = groundLevel;
        this.stickman.velocityY = 0;
        this.stickman.isJumping = false;
      }

      this.checkTrapEvent();

      if (this.stone.active) {
        this.stoneTrap();
      }

      this.drawScene();
      this.animationFrame = requestAnimationFrame(this.animate);
    },
    
    checkTrapEvent() {
      if (this.trapCount === 0 && this.stickman.x >= this.canvasWidth / 2) {
        this.stone.active = true;
        this.trapCount += 1;
      }
    },

    stoneTrap() {
      // Stone falling
      this.stone.y += this.stone.velocityY;

      // Collision with stickman
      const dx = this.stickman.x - this.stone.x;
      const dy = (this.stickman.y - 64) - this.stone.y; // Center of 128px sprite
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (this.stone && distance < this.stone.radius + 64) {
        this.resetStone();
        localStorage.setItem('trapCount', this.trapCount);
        navigateTo("./gameOver");
      }

      // Reset stone if it hits ground
      if (this.stone && this.stone.y > this.ground.y - this.stone.radius + 5) {
        this.resetStone();
      }
    },

    resetStone() {
      this.stone.active = false;
    },

    drawScene() {
      const canvas = this.$refs.gameCanvas;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.beginPath();
      ctx.moveTo(0, this.ground.y);
      ctx.lineTo(canvas.width, this.ground.y);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Stone
      if (this.stone.active) {
        ctx.beginPath();    
        ctx.arc(this.stone.x, this.stone.y, this.stone.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#555";
        ctx.fill();
      }

      // Stickman is now rendered as a sprite div, not on canvas
    },
  },
};
</script>

<style scoped>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  position: relative;
}

canvas {
  display: block;
}

.character {
  position: absolute;
  width: 96px;
  height: 96px;
  background-image: url('../assets/walking.png');
  background-repeat: no-repeat;
  background-size: 768px 96px;
  pointer-events: none;
  transition: transform 0.1s;
}

.character.walking {
  animation: walk 0.6s steps(8) infinite;
}

@keyframes walk {
  from { background-position: 0px 0px; }
  to { background-position: -768px 0px; }
}
</style>