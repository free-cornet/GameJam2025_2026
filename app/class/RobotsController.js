import Robot from "./Robot.js";

export class RobotsController {
  robot_INTERVAL_MIN = 650;
  robot_INTERVAL_MAX = 1350;

  nextrobotInterval = 0;
  robots = [];

  constructor(ctx, canvas, robotsImages, speed) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.robotsImages = robotsImages;
    this.speed = speed;

    this.setNextRobotTime();
  }

  setNextRobotTime() {
    const num = this.getRandomNumber(
      this.robot_INTERVAL_MIN,
      this.robot_INTERVAL_MAX
    );

    this.nextRobotInterval = num;
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createRobot() {
    const index = this.getRandomNumber(0, this.robotsImages.length - 1);
    const robotImage = this.robotsImages[index];
    const x = this.canvas.value.width * 1.5;
    const y = this.canvas.value.height - robotImage.height;
    const robot = new Robot(
      this.ctx,
      x,
      y,
      robotImage.width,
      robotImage.height,
      robotImage.image
    );

    this.robots.push(robot);
  }

  update(gameSpeed, frameTimeDelta) {
    if (this.nextRobotInterval.valueOf() <= 0.0) {
      this.createRobot();
      this.setNextRobotTime();
    }
    this.nextRobotInterval -= frameTimeDelta;

    this.robots.forEach((robot) => {
      robot.update(this.speed, gameSpeed, frameTimeDelta, this.scaleRatio);
    });

    this.robots = this.robots.filter((robot) => robot.x > -robot.width);
  }

  draw() {
    this.robots.forEach((robot) => robot.draw());
  }

  collideWith(sprite) {
    return this.robots.some((robot) => robot.collideWith(sprite));
  }

  reset() {
    this.robots = [];
  }
}