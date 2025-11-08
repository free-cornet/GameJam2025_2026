<template>
  <div id="app">
    <canvas ref="gameCanvas" width="600" height="400" style="border:1px solid #000;"></canvas>
  </div>
</template>

<script>
export default {
  name: "StickmanGame",
  data() {
    return {
      x: 50, // Starting X position
      y: 300, // Y position (fixed)
      targetX: 500, // Destination X
      speed: 2, // Pixels per frame
      animationFrame: null,
    };
  },
  mounted() {
    this.drawStickman();
    this.animate();
  },
  methods: {
    drawStickman() {
      const canvas = this.$refs.gameCanvas;
      const ctx = canvas.getContext("2d");

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stickman
      ctx.beginPath();
      ctx.arc(this.x, this.y - 30, 10, 0, Math.PI * 2); // Head
      ctx.moveTo(this.x, this.y - 20); // Body
      ctx.lineTo(this.x, this.y);
      ctx.moveTo(this.x, this.y - 10); // Arms
      ctx.lineTo(this.x - 10, this.y - 20);
      ctx.moveTo(this.x, this.y - 10);
      ctx.lineTo(this.x + 10, this.y - 20);
      ctx.moveTo(this.x, this.y); // Legs
      ctx.lineTo(this.x - 10, this.y + 20);
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + 10, this.y + 20);
      ctx.stroke();
    },
    animate() {
      if (this.x < this.targetX) {
        this.x += this.speed;
        this.drawStickman();
        this.animationFrame = requestAnimationFrame(this.animate);
      } else {
        cancelAnimationFrame(this.animationFrame);
      }
    },
  },
};
</script>

<style>
#app {
  text-align: center;
  margin-top: 50px;
}
</style>
