export class Score {
  score = 0;
  HIGH_SCORE_KEY = "highScore";

  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  update(frameTimeDelta) {
    this.score += frameTimeDelta * 0.01;
  }

  reset() {
    this.score = 0;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20;

    const fontSize = 20;
    this.ctx.font = `${fontSize}px Verdana`;
    this.ctx.fillStyle = "#525250";
    const scoreX = (this.canvas.value.width / 2) - 25;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
  }

  getScore() {
    return this.score
  }
}