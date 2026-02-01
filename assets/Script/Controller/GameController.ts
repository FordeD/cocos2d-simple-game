import { BoardModel } from '../Model/BoardModel';
import PlayerModel from '../Model/PlayerModel';
import { TileModel } from '../Model/TileModel';
import MoveSystem from '../System/MoveSystem';
import BoardView from '../View/BoardView';
import PopupView from '../View/PopupView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {
  static instance: GameController;

  @property({ tooltip: 'Количество строк в игровом поле' }) rows = 8;
  @property({ tooltip: 'Количество колонок в игровом поле' }) cols = 8;

  @property({ tooltip: 'Максимальное количество действий' }) moves = 20;

  @property({ tooltip: 'Необходимое количество очков' }) targetScore = 500;
  @property({ tooltip: 'Количество обычных типов тайлов' }) defaultTiles = 5;
  @property({ tooltip: 'Шанс появления спецтайла (%)' })
  specialTileChance: number = 5;

  @property({ tooltip: 'Радиус взрыва спецтайла' })
  radiusPower: number = 1;

  @property({ tooltip: 'Радиус взрыва бустера' })
  radiusBoosterPower: number = 5;

  @property({ tooltip: 'Элемент-текст количества очков', type: cc.Label })
  scoreLabel: cc.Label = null;

  @property({ tooltip: 'Элемент-текст количества ходов', type: cc.Label })
  moveLabel: cc.Label = null;

  @property({ tooltip: 'Блок-контейнер Popup', type: cc.Node })
  popupBlock: cc.Node = null;

  @property({ tooltip: 'Элемент-контейнер игрового поля', type: cc.Node })
  tileContainerNode: cc.Node = null;

  @property({ tooltip: 'Количество очков за тайл', type: Number })
  scoreByTile: number = 5;

  @property({ tooltip: 'Множитель очков за комбинации', type: Number })
  scoreByTileMultipler: number = 1.5;

  @property({ tooltip: 'Элемент-текст количества обновлений игрового поля', type: cc.Label })
  rerollLabel: cc.Label = null;

  @property({ tooltip: 'Количество обновлений игрового поля', type: Number })
  rerollCount: number = 3;

  @property({ tooltip: 'Элемент-текст количества бомб', type: cc.Label })
  bombLabel: cc.Label = null;

  @property({ tooltip: 'Количество бомб', type: Number })
  bombCount: number = 3;

  board: BoardModel;
  player: PlayerModel;
  moveSystem: MoveSystem;
  score = 0;
  startMoves = 0;
  popupView: PopupView = null;
  boardView: BoardView = null;

  onLoad() {
    GameController.instance = this;
    this.initPlayerState();
  }

  start() {
    this.board = new BoardModel(this.rows, this.cols, this.specialTileChance);
    this.boardView = this.tileContainerNode.getComponent('BoardView');
    this.popupView = this.popupBlock.getComponent('PopupView');
    this.moveSystem = new MoveSystem(this.board, this.radiusBoosterPower);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.boardView.createTile(this.board.grid[r][c]);
      }
    }

    this.player.updateLabels();
  }

  initPlayerState() {
    this.player = new PlayerModel(
      {
        moves: this.moves,
        score: this.score,
        totalScore: this.targetScore,
        rerollCount: this.rerollCount,
        bombCount: this.bombCount,
      },
      {
        moves: this.moveLabel,
        score: this.scoreLabel,
        reroll: this.rerollLabel,
        bomb: this.bombLabel,
      },
      {
        scoreByTile: this.scoreByTile,
        scoreByTileMultipler: this.scoreByTileMultipler,
      },
    );
  }

  restartGame() {
    const allTiles = this.board.getAllTiles();
    this.moveSystem.animateAndResolve(allTiles);
    this.player.restart();
  }

  onTileClicked(row: number, col: number) {
    if (this.moveSystem.inputLocked || this.player.getMoves() === 0) return;

    const tile = this.board.getTile(row, col);
    if (!tile) return;

    let tilesToRemove: TileModel[] = [];

    if (this.player.checkActiveBooster()) {
      tilesToRemove = this.moveSystem.clearRadius(row, col);
    } else {
      if (tile.isSpecial()) {
        tilesToRemove = this.moveSystem.activateSpecial(tile);
      } else {
        const group = this.board.findGroup(row, col);
        if (group.length < 3) return;
        tilesToRemove = group;
      }
    }

    if (tilesToRemove.length === 0) return;

    this.moveSystem.inputLocked = true;

    this.moveSystem.animateAndResolve(tilesToRemove);
    if (!this.player.checkActiveBooster() && !tile.isSpecial()) {
      this.player.useMove();
      this.player.updateScore(tilesToRemove.length);
    }

    this.player.deactiveBooster();
    this.checkGameWin();
    this.checkGameLose();
  }

  useRerollBooster() {
    if (this.moveSystem.inputLocked) return;
    if (this.player.checkActiveBooster()) return;
    if (this.player.getReroll() === 0) return;
    const allTiles = this.board.getAllTiles();
    this.moveSystem.animateAndResolve(allTiles);
    this.player.useReroll();
  }

  useBombBooster() {
    if (this.moveSystem.inputLocked) return;
    if (this.player.checkActiveBooster()) return;
    if (this.player.getBombs() === 0) return;
    this.player.useBomb();
  }

  checkGameWin() {
    if (!this.player.isPlayerWin()) return;

    this.popupView.show({
      message: 'Вы выйграли!\nХотите повторить?',
      showButton: true,
      showClose: true,
      onClose: () => {
        this.popupView.node.active = false;
      },
      onButton: () => {
        this.popupView.node.active = false;
        this.restartGame();
      },
    });
  }

  checkGameLose() {
    if (!this.player.isPlayerLose()) return;
    const popupView: PopupView = this.popupBlock.getComponent('PopupView');

    popupView.show({
      message: 'У вас не осталось ходов.\nХотите повторить?',
      showButton: true,
      showClose: false,
      onButton: () => {
        popupView.node.active = false;
        this.restartGame();
      },
    });
  }
}
