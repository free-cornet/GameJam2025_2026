<template>
  <div id="app">
    <canvas ref="gameCanvas"></canvas>
  </div>
</template>

<script>
export default {
  name: "StickmanGame",
  data() {
    return {
      trapCount : 0,
      stickman: {
        x: 100,
        y: 0,
        velocityY: 0,
        isJumping: false,
        speed: 3,
        animationFrame: null,
      },
      ground: {
        y: window.innerHeight * 0.75,
      },
      canvasWidth: window.innerWidth,
      canvasHeight: window.innerHeight,
      gravity: 0.5,
      keys: {
        left: false,
        right: false,
      },
      stone: {
        x: window.innerWidth / 2,
        y: 0 - window.innerWidth / 2,
        velocityY: 9,
        radius: window.innerWidth / 2,
        active: false
      },
    };
  },

  mounted() {
    this.setCanvasSize();
    this.ground.y = this.canvasHeight * 0.75;
    this.stickman.y= this.ground.y - 20;

    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
    window.addEventListener("resize", this.handleResize);

    this.animate();
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keyup", this.keyUp);
    window.removeEventListener("resize", handleResize);
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
      if (e.key === "ArrowRight") this.keys.right = true;
      if (e.key === "ArrowLeft") this.keys.left = true;
      if (e.key === " " && !this.stickman.isJumping) {
        this.stickman.velocityY = -10;
        this.stickman.isJumping = true;
      }
    },
    keyUp(e) {
      if (e.key === "ArrowRight") this.keys.right = false;
      if (e.key === "ArrowLeft") this.keys.left = false;
    },
    animate() {
      if (this.keys.right) this.stickman.x += this.stickman.speed;
      if (this.keys.left) this.stickman.x -= this.stickman.speed;

      // Horizontal boundaries
      const margin = 10; // buffer for stickman width
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

      if (this.stone.active){
        console.log("here");
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

    stoneTrap(){
      // Stone falling
      this.stone.y += this.stone.velocityY;

      // Collision with stickman
      const dx = this.stickman.x - this.stone.x;
      const dy = (this.stickman.y - 30) - this.stone.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (this.stone && distance < this.stone.radius + 5) {
        this.resetStone();
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
      if (this.stone.active){
        ctx.beginPath();    
        ctx.arc(this.stone.x, this.stone.y, this.stone.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#555";
        ctx.fill();
      }

      // Draw stickman
      ctx.beginPath();
      ctx.arc(this.stickman.x, this.stickman.y - 30, 10, 0, Math.PI * 2); // Head
      ctx.moveTo(this.stickman.x, this.stickman.y - 20); // Body
      ctx.lineTo(this.stickman.x, this.stickman.y);
      ctx.moveTo(this.stickman.x, this.stickman.y - 10); // Arms
      ctx.lineTo(this.stickman.x - 10, this.stickman.y - 20);
      ctx.moveTo(this.stickman.x, this.stickman.y - 10);
      ctx.lineTo(this.stickman.x + 10, this.stickman.y - 20);
      ctx.moveTo(this.stickman.x, this.stickman.y); // Legs
      ctx.lineTo(this.stickman.x - 10, this.stickman.y + 20);
      ctx.moveTo(this.stickman.x, this.stickman.y);
      ctx.lineTo(this.stickman.x + 10, this.stickman.y + 20);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
    },
  },
};
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}
canvas {
  display: block;
}
</style>
