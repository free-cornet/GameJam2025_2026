<template>
  <div id="app">
    <canvas ref="gameCanvas"></canvas>
    <div 
      v-if="stone.active"
      class="meteor"
      :style="{ 
        left: (stone.x - 1099/2) + 'px', 
        top: (stone.y - 1095/2) + 'px',
        transform: `scale(${(stone.radius * 2) / 1099})`
      }"
    ></div>
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
<style>
body {
  background-image: url('../assets/night.svg');
  background-size: cover;
}
@font-face {
    font-family: Cardinal;
    src: url('../assets/Cardinal.ttf');
}
</style>

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
        y: -100,
        velocityY: 0,
        isJumping: false,
        speed: 3,
        animationFrame: null,
      },
      ground: {
        y: 0,
        groundColors: ['#A0522D', '#8B4513', '#CD853F', '#D2B48C', '#BC8F8F'],
        selectedGroundColor: '',
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
        velocityY: 10,
        radius: 0,
        active: false
      },
      spikes: [
        {
          x: 0,
          y: 0,
          width: 60,
          height: 0,
          maxHeight: 40,
          active: false,
        },
        {
          x: 0,
          y: 0,
          width: 60,
          height: 0,
          maxHeight: 40,
          active: false,
        },
      ],

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
      return (window.innerWidth / 2) * 0.8;
    },
    initialSpikeY(){
      return window.innerHeight * 0.75;
    }
  },

  mounted() {
    this.setCanvasSize();
    this.ground.y = this.initialGroundY;
    this.ground.selectedGroundColor = this.ground.groundColors[Math.floor(Math.random() * this.ground.groundColors.length)];

    this.stickman.y = this.ground.y - 20;

    this.stone.x = this.initialStoneX;
    this.stone.y = this.initialStoneY;
    this.stone.radius = this.initialStoneRadius;

    this.trapCount = localStorage.getItem('trapCount') ? parseInt(localStorage.getItem('trapCount')) : 0;

    this.spikes[0].x = this.canvasWidth / 2 + 150;
    this.spikes[0].y = this.initialSpikeY;

    this.spikes[1].x = this.spikes[0].x + this.spikes[1].width;
    this.spikes[1].y = this.initialSpikeY;

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
      this.spikes.forEach(spike => {
        spike.y = this.canvasHeight * 0.75;
      });
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

      if (this.spikes[0].active){
        this.spikes.forEach(spike => {
          if (spike.active && spike.height < spike.maxHeight){
            spike.height += 5;
          }
        });
        this.checkSpikeCollision();
      }

      this.drawScene();
      this.animationFrame = requestAnimationFrame(this.animate);
    },
    
    checkTrapEvent() {
      if (this.trapCount === 0) {
        if (this.stickman.x >= (this.canvasWidth / 2 - 175)){
          this.stone.active = true;
        } 
      } 
      
      if (this.trapCount === 1) {
        if (this.stickman.x >= (this.canvasWidth / 2 - 150)){
          this.spikes[0].active = true;
        } 
        if (!(this.spikes[1].active) && this.spikes[0].active && this.stickman.x + 48 >= this.spikes[0].x){
          this.spikes[1].active = true;
        }
      }
    },

    stoneTrap() {
      // Stone falling
      this.stone.y += this.stone.velocityY;

      // Collision with stickman
      var stickman_center_x = this.stickman.x + 48;
      var stickman_center_y = this.stickman.y + 48 - 35;
      
      const dx = stickman_center_x - this.stone.x;
      const dy = stickman_center_y - this.stone.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (this.stone && distance < this.stone.radius) {
        this.resetStone();
        this.gameOver();
      }

      // Reset stone if it hits ground
      if (this.stone && this.stone.y > this.ground.y - this.stone.radius + 5) {
        this.resetStone();
      }
    },

    resetStone() {
      this.stone.active = false;
    },

    gameOver(){
      this.trapCount += 1;
      localStorage.setItem('trapCount', this.trapCount);
      navigateTo("./gameOver");
    },

    calculateSpikeY(spike, negative, x){
      var slope = spike.height / (spike.width / 2);
      var height = - (slope * x);
      if (negative) {
        return (- slope) * x + height;
      }
      return slope * x + height;
    },

    checkSpikeCollision(){
      this.spikes.forEach(spike => {
        if (spike.active && spike.height >= spike.maxHeight) {
          const spikeTopY = spike.y - spike.height;
          const spikeLeftX = spike.x - spike.width / 2;
          const spikeRightX = spike.x + spike.width / 2;

          const stickmanBottomY = this.stickman.y;
          const stickmanLeftX = this.stickman.x - 48;
          const stickmanRightX = this.stickman.x + 72;

          const horizontalOverlap = stickmanRightX >= spikeLeftX && stickmanLeftX <= spikeRightX;
          const verticalOverlap = stickmanBottomY >= spikeTopY;
          
          if (horizontalOverlap && verticalOverlap) {
            if (stickmanRightX > spike.x + spike.width / 2) {
              if (stickmanBottomY > this.calculateSpikeY(spike, true, stickmanRightX)){ 
                this.gameOver();
              }
            } else {
              if (stickmanBottomY > this.calculateSpikeY(spike, false, stickmanRightX)){
                this.gameOver();
              }
            }
          }
        }
      });
    },

    drawScene() {
      const canvas = this.$refs.gameCanvas;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground area below the line
      ctx.fillStyle = this.ground.selectedGroundColor;
      ctx.fillRect(0, this.ground.y, canvas.width, canvas.height - this.ground.y);

      // Draw ground
      ctx.beginPath();
      ctx.moveTo(0, this.ground.y);
      ctx.lineTo(canvas.width, this.ground.y);
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw spikes
      this.spikes.forEach(spike => {
        if (spike.active) {
          ctx.fillStyle = this.ground.selectedGroundColor; 
          ctx.beginPath();
          ctx.moveTo(spike.x, spike.y);
          ctx.lineTo(spike.x - spike.width / 2, spike.y);
          ctx.lineTo(spike.x, spike.y - spike.height);
          ctx.lineTo(spike.x + spike.width / 2, spike.y);
          ctx.closePath();
          ctx.fill();
        }
      });
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

.meteor {
  position: absolute;
  width: 1099px;
  height: 1095px;
  background-image: url('../assets/meteor.png');
  background-repeat: no-repeat;
  background-size: 1099px 1095px;
  transition: transform 0.1s;
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