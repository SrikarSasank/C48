class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.runnerMoving = false;
    this.leftKeyActive = false;
    this.sick = false;
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    runner = new Runner();
    runnerCount = runner.getCount();

    form = new Form();
    form.display();

    athlete1 = createSprite(width / 2 - 50, height - 100);
    athlete1.addImage("runner1", runner1_img);
    athlete1.scale = 0.35;

    athlete1.addImage("sick", sickImage);

    athlete2 = createSprite(width / 2 + 100, height - 100);
    athlete2.addImage("runner2", runner2_img);
    athlete2.scale = 0.35;

    athlete2.addImage("sick", sickImage);

    athletes = [athlete1, athlete2];

    fruits = new Group();
    powerCoins = new Group();

    junks = new Group();

    var junksPositions = [
      { x: width / 2 + 250, y: height - 800, image: junk2Image },
      { x: width / 2 - 150, y: height - 1300, image: junk1Image },
      { x: width / 2 + 250, y: height - 1800, image: junk1Image },
      { x: width / 2 - 180, y: height - 2300, image: junk2Image },
      { x: width / 2, y: height - 2800, image: junk2Image },
      { x: width / 2 - 180, y: height - 3300, image: junk1Image },
      { x: width / 2 + 180, y: height - 3300, image: junk2Image },
      { x: width / 2 + 250, y: height - 3800, image: junk2Image },
      { x: width / 2 - 150, y: height - 4300, image: junk1Image },
      { x: width / 2 + 250, y: height - 4800, image: junk2Image },
      { x: width / 2, y: height - 5300, image: junk1Image },
      { x: width / 2 - 180, y: height - 5500, image: junk2Image }
    ];

    // Adding fruits sprite in the game
    this.addSprites(fruits, 4, fruitImage, 0.02);

    // Adding coin sprite in the game
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);

    //Adding junks sprite in the game
    this.addSprites(
      junks,
      junksPositions.length,
      junk1Image,
      0.04,
      junksPositions
    );
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      //C41 //SA
      if (positions.length > 0) {
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      } else {
        x = random(width / 2 + 150, width / 2 - 150);
        y = random(-height * 4.5, height - 400);
      }
      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(120, 50);
    form.titleImg.class("gameTitleAfterEffect");

    
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Leaderboard");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Runner.getRunnersInfo();
    runner.getAthletesAtEnd();

    if (allRunners !== undefined) {
      image(track, 0, -height * 5,width, height * 6);

      this.showFruitBar();
      this.showLife();
      this.showLeaderboard();

      //index of the array
      var index = 0;
      for (var rnr in allRunners) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allRunners[rnr].positionX;
        var y = height - allRunners[rnr].positionY;

        var currentlife = allRunners[rnr].life;

        if (currentlife <= 0) {
          athletes[index - 1].changeImage("sick");
          athletes[index - 1].scale = 0.3;
        }

        athletes[index - 1].position.x = x;
        athletes[index - 1].position.y = y;

        if (index === runner.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFruit(index);
          this.handlePowerCoins(index);
          this.handleAthleteACollisionWithAthleteB(index);
          this.handleJunkCollision(index);

          if (runner.life <= 0) {
            this.sick = true;
            this.runnerMoving = false;
          }

          // Changing camera position in y direction
          camera.position.y = athletes[index - 1].position.y;
        }
      }

      if (this.runnerMoving) {
        runner.positionY += 5;
        runner.update();
      }

      // handling keyboard events
      this.handleRunnerControls();

      // Finshing Line
      const finshLine = height * 6 - 100;

      if (runner.positionY > finshLine) {
        gameState = 2;
        runner.rank += 1;
        Runner.updateAthletesAtEnd(runner.rank);
        runner.update();
        this.showRank();
      }

      drawSprites();
    }
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        runnerCount: 0,
        gameState: 0,
        runners: {},
        athletesAtEnd: 0
      });
      window.location.reload();
    });
  }

  showLife() {
    push();
    image(lifeImage, width / 2 - 130, height - runner.positionY - 400, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - runner.positionY - 400, 185, 20);
    fill("#f50057");
    rect(width / 2 - 100, height - runner.positionY - 400, runner.life, 20);
    noStroke();
    pop();
  }

  showFruitBar() {
    push();
    image(fruitImage, width / 2 - 130, height - runner.positionY - 350, 20, 20);
    fill("white");
    rect(width / 2 - 100, height - runner.positionY - 350, 185, 20);
    fill("#ffc400");
    rect(width / 2 - 100, height - runner.positionY - 350, runner.fruit, 20);
    noStroke();
    pop();
  }

  showLeaderboard() {
    var leader1, leader2;
    var runners = Object.values(allRunners);
    if (
      (runners[0].rank === 0 && runners[1].rank === 0) ||
      runners[0].rank === 1
    ) {
      // &emsp;    This tag is used for displaying four spaces.
      leader1 =
        runners[0].rank +
        "&emsp;" +
        runners[0].name +
        "&emsp;" +
        runners[0].score;

      leader2 =
        runners[1].rank +
        "&emsp;" +
        runners[1].name +
        "&emsp;" +
        runners[1].score;
    }

    if (runners[1].rank === 1) {
      leader1 =
        runners[1].rank +
        "&emsp;" +
        runners[1].name +
        "&emsp;" +
        runners[1].score;

      leader2 =
        runners[0].rank +
        "&emsp;" +
        runners[0].name +
        "&emsp;" +
        runners[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handleRunnerControls() {
    if (!this.sick) {
      if (keyIsDown(UP_ARROW)) {
        this.runnerMoving = true;
        runner.positionY += 10;
        runner.update();
      }

      if (keyIsDown(LEFT_ARROW) && runner.positionX > width / 3 - 50) {
        this.leftKeyActive = true;
        runner.positionX -= 5;
        runner.update();
      }

      if (keyIsDown(RIGHT_ARROW) && runner.positionX < width / 2 + 300) {
        this.leftKeyActive = false;
        runner.positionX += 5;
        runner.update();
      }
    }
  }

  handleFruit(index) {
    // Adding fruit
    athletes[index - 1].overlap(fruits, function(collector, collected) {
      runner.fruit = 185;
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });

    // Reducing Runner car fruit
    if (runner.fruit > 0 && this.runnerMoving) {
      runner.fruit -= 0.3;
    }

    if (runner.fruit <= 0) {
      gameState = 2;
      this.gameOver();
    }
  }

  handlePowerCoins(index) {
    athletes[index - 1].overlap(powerCoins, function(collector, collected) {
      runner.score += 21;
      runner.update();
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
  }

  handleJunkCollision(index) {
    if (athletes[index - 1].collide(junks)) {
      if (this.leftKeyActive) {
        runner.positionX += 100;
      } else {
        runner.positionX -= 100;
      }

      //Reducing Runnner Life
      if (runner.life > 0) {
        runner.life -= 185 / 4;
      }

      runner.update();
    }
  }

  handleAthleteACollisionWithAthleteB(index) {
    if (index === 1) {
      if (athletes[index - 1].collide(athletes[1])) {
        if (this.leftKeyActive) {
          runner.positionX += 100;
        } else {
          runner.positionX -= 100;
        }

        //Reducing Runner Life
        if (runner.life > 0) {
          runner.life -= 185 / 4;
        }

        runner.update();
      }
    }
    if (index === 2) {
      if (athletes[index - 1].collide(athletes[0])) {
        if (this.leftKeyActive) {
          runner.positionX += 100;
        } else {
          runner.positionX -= 100;
        }

        //Reducing Runner Life
        if (runner.life > 0) {
          runner.life -= 185 / 4;
        }

        runner.update();
      }
    }
  }

  showRank() {
    swal({
      title: `Awesome!${"\n"}Rank${"\n"}${runner.rank}`,
      text: "You reached the finish line successfully",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  gameOver() {
    swal({
      title: `Game Over`,
      text: "Oops you lost the race....!!!",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Thanks For Playing"
    });
  }

  end() {
    console.log("Game Over");
  }
}
