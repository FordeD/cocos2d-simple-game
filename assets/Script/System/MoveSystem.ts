import GameController from '../Controller/GameController';
import { BoardModel } from '../Model/BoardModel';
import { TileModel, TileSpecialType } from '../Model/TileModel';
import BoardView from '../View/BoardView';

export default class MoveSystem extends cc.Component {
  board: BoardModel;
  radiusPower: number;
  boardView: BoardView;
  inputLocked: boolean = false;

  constructor(board: BoardModel, radiusPower: number) {
    super();
    this.board = board;
    this.radiusPower = radiusPower;
    this.boardView = GameController.instance.boardView;
  }

  processClick(tile: TileModel): TileModel[] {
    if (tile.isSpecial()) {
      return this.activateSpecial(tile);
    }

    return this.collectGroup(tile);
  }

  collectGroup(tile: TileModel): TileModel[] {
    return this.board.findGroup(tile.row, tile.col);
  }

  activateSpecial(tile: TileModel): TileModel[] {
    switch (tile.specialType) {
      case TileSpecialType.ClearRow:
        return this.clearRow(tile.row);

      case TileSpecialType.ClearColumn:
        return this.clearColumn(tile.col);

      case TileSpecialType.ClearRadius:
        return this.clearRadius(tile.row, tile.col);

      default:
        return [];
    }
  }

  useBombBooster(row: number, col: number) {}

  clearRow(row: number): TileModel[] {
    const result: TileModel[] = [];

    for (let c = 0; c < this.board.cols; c++) {
      const tile = this.board.grid[row][c];
      if (tile) result.push(tile);
    }

    return result;
  }

  clearColumn(col: number): TileModel[] {
    const result: TileModel[] = [];

    for (let r = 0; r < this.board.rows; r++) {
      const tile = this.board.grid[r][col];
      if (tile) result.push(tile);
    }

    return result;
  }

  clearRadius(row: number, col: number): TileModel[] {
    const result: TileModel[] = [];

    for (let r = row - this.radiusPower; r <= row + this.radiusPower; r++) {
      for (let c = col - this.radiusPower; c <= col + this.radiusPower; c++) {
        if (!this.board.isInside(r, c)) continue;

        const tile = this.board.grid[r][c];
        if (tile) result.push(tile);
      }
    }

    return result;
  }

  animateAndResolve(group) {
    // анимация удаления
    Promise.all(
      group.map(
        (t) =>
          new Promise<void>((res) => {
            if (!t.viewNode || !t.viewNode.isValid) {
              res();
              return;
            }

            cc.tween(t.viewNode)
              .to(0.2, { scale: 0 })
              .call(() => {
                if (t.viewNode && t.viewNode.isValid) {
                  t.viewNode.destroy();
                  t.viewNode = null;
                }
                res();
              })
              .start();
          }),
      ),
    ).then(() => {
      this.board.removeTiles(group);

      const moved = this.board.collapseAndFill();

      const fallTime = 0.25;
      const spawnDelay = 0.15;

      const existing: TileModel[] = [];
      const spawned: TileModel[] = [];

      moved.forEach((tile) => {
        if (tile.isNew) {
          spawned.push(tile);
        } else {
          existing.push(tile);
        }
      });

      existing.forEach((tile) => {
        this.boardView.moveTile(tile);
      });

      this.scheduleOnce(() => {
        spawned.forEach((tile) => {
          this.boardView.spawnNewTile(tile);
          tile.isNew = false;
          this.boardView.moveTile(tile);
        });

        this.inputLocked = false;
      }, fallTime + spawnDelay);
    });
  }
}
