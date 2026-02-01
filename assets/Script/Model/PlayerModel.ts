const { ccclass } = cc._decorator;

@ccclass
export default class PlayerModel extends cc.Component {
  protected totalMoves: number = 0;
  protected currentMoves: number = 0;
  protected totalScore: number = 0;
  protected currentScore: number = 0;
  protected rerollCountTotal: number = 0;
  protected rerollCount: number = 0;
  protected bombCountTotal: number = 0;
  protected bombCount: number = 0;

  protected movesLabel: cc.Label = null;
  protected scoreLabel: cc.Label = null;
  protected rerollLabel: cc.Label = null;
  protected bombLabel: cc.Label = null;

  protected scoreByTile: number = 0;
  protected scoreByTileMultipler: number = 1;

  protected isActiveBombBooster: boolean = false;

  constructor(
    playerData: {
      moves: number;
      score: number;
      totalScore: number;
      rerollCount: number;
      bombCount: number;
    },
    labels: {
      moves: cc.Label;
      score: cc.Label;
      reroll: cc.Label;
      bomb: cc.Label;
    },
    scoreSettings: {
      scoreByTile: number;
      scoreByTileMultipler: number;
    },
  ) {
    super();

    this.totalMoves = playerData.moves;
    this.currentMoves = playerData.moves;
    this.totalScore = playerData.totalScore;
    this.currentScore = playerData.score;
    this.rerollCount = playerData.rerollCount;
    this.rerollCountTotal = playerData.rerollCount;
    this.bombCount = playerData.bombCount;
    this.bombCountTotal = playerData.bombCount;

    this.movesLabel = labels.moves;
    this.scoreLabel = labels.score;
    this.rerollLabel = labels.reroll;
    this.bombLabel = labels.bomb;

    this.scoreByTile = scoreSettings.scoreByTile;
    this.scoreByTileMultipler = scoreSettings.scoreByTileMultipler;
  }

  updateLabels() {
    this.movesLabel.string = `${this.currentMoves}`;
    this.scoreLabel.string = `${this.currentScore}/${this.totalScore}`;
    this.rerollLabel.string = `${this.rerollCount}`;
    this.bombLabel.string = `${this.bombCount}`;
  }

  isPlayerWin() {
    return this.currentScore >= this.totalScore;
  }

  isPlayerLose() {
    return !this.isPlayerWin() && this.currentMoves === 0;
  }

  useMove() {
    if (this.currentMoves <= 0) return 0;
    this.currentMoves--;
    this.updateLabels();
    return this.currentMoves;
  }

  getMoves() {
    return this.currentMoves;
  }

  getBombs() {
    return this.bombCount;
  }

  getReroll() {
    return this.rerollCount;
  }

  checkActiveBooster() {
    return this.isActiveBombBooster;
  }

  deactiveBooster() {
    this.isActiveBombBooster = false;
  }

  useBomb() {
    if (this.bombCount <= 0) return 0;
    this.bombCount--;
    this.updateLabels();
    this.isActiveBombBooster = true;
    return this.bombCount;
  }

  useReroll() {
    if (this.rerollCount <= 0) return 0;
    this.rerollCount--;
    this.updateLabels();
    return this.rerollCount;
  }

  updateScore(tilesCount: number) {
    this.currentScore += Math.round(tilesCount * this.scoreByTile * this.scoreByTileMultipler);
    this.updateLabels();
  }

  restart() {
    this.currentMoves = this.totalMoves;
    this.currentScore = 0;
    this.bombCount = this.bombCountTotal;
    this.rerollCount = this.rerollCountTotal;
    this.updateLabels();
  }
}
