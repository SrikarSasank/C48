class Runner {
  constructor() {
    this.name = null;
    this.index = null;
    this.positionX = 0;
    this.positionY = 0;
    this.rank = 0;
    this.fruit = 185;
    this.life = 185;
    this.score = 0;
  }

  addRunner() {
    var runnerIndex = "runners/runner" + this.index;

    if (this.index === 1) {
      this.positionX = width / 2 - 100;
    } else {
      this.positionX = width / 2 + 100;
    }

    database.ref(runnerIndex).set({
      name: this.name,
      positionX: this.positionX,
      positionY: this.positionY,
      rank: this.rank,
      score: this.score
    });
  }

  getDistance() {
    var runnerDistanceRef = database.ref("runners/runner" + this.index);
    runnerDistanceRef.on("value", data => {
      var data = data.val();
      this.positionX = data.positionX;
      this.positionY = data.positionY;
    });
  }

  getCount() {
    var runnerCountRef = database.ref("runnerCount");
    runnerCountRef.on("value", data => {
      runnerCount = data.val();
    });
  }

  updateCount(count) {
    database.ref("/").update({
      runnerCount: count
    });
  }

  update() {
    var runnerIndex = "runners/runner" + this.index;
    database.ref(runnerIndex).update({
      positionX: this.positionX,
      positionY: this.positionY,
      rank: this.rank,
      score: this.score,
      life: this.life
    });
  }

  static getRunnersInfo() {
    var runnerInfoRef = database.ref("runners");
    runnerInfoRef.on("value", data => {
      allRunners = data.val();
    });
  }

  getAthletesAtEnd() {
    database.ref("althletesAtEnd").on("value", data => {
      this.rank = data.val();
    });
  }

  static updateAthletesAtEnd(rank) {
    database.ref("/").update({
      althletesAtEnd: rank
    });
  }
}
