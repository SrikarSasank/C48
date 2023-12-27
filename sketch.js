var canvas;
var backgroundImage, runner1_img, runner2_img, track;
var fruitImage, powerCoinImage, lifeImage;
var junk1Image, junk2Image;
var database, gameState;
var sickImage;
var form, runner, runnerCount;
var allRunners, athlete1, athlete2, fruits, powerCoins, junks;
var athletes = [];

function preload() {
  backgroundImage = loadImage("./assets/bg.png");
  runner1_img = loadImage("../assets/runner1.png");
  runner2_img = loadImage("../assets/runner2.png");
  track = loadImage("../assets/track.png");
  fruitImage = loadImage("./assets/fruit.png");
  powerCoinImage = loadImage("./assets/goldCoin.png");
  junk1Image = loadImage("./assets/junk1.png");
  junk2Image = loadImage("./assets/junk2.png");
  lifeImage = loadImage("./assets/life.png");
  sickImage = loadImage("./assets/sick.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState();
  game.start();
}

function draw() {
  background(backgroundImage);
  if (runnerCount === 2) {
    game.update(1);
  }
  if (gameState === 1) {
    game.play();
  }

  if (gameState === 2) {
    game.showLeaderboard();
    game.end();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
