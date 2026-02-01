import GameController from '../Controller/GameController';
import { TileModel, TileColor, TileSpecialType } from './TileModel';

export class BoardModel {
  rows: number;
  cols: number;
  grid: (TileModel | null)[][] = [];
  specialTileChance: number = 0;

  constructor(rows: number, cols: number, specialTileChance: number) {
    this.rows = rows;
    this.cols = cols;
    this.specialTileChance = specialTileChance;
    this.generate();
  }

  getRandomColor(): TileColor {
    return Math.floor(Math.random() * GameController.instance.defaultTiles) as TileColor;
  }

  generate() {
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = this.createTile(r, c);
      }
    }
  }

  createTile(row: number, col: number): TileModel {
    const color = this.getRandomColor();
    const tile = new TileModel(row, col, color);

    if (Math.random() * 100 < this.specialTileChance) {
      tile.specialType = this.getRandomSpecialType();
      tile.color = TileColor.Other;
    }

    return tile;
  }

  getTile(row: number, col: number): TileModel | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return this.grid[row][col];
  }

  findGroup(row: number, col: number): TileModel[] {
    const start = this.getTile(row, col);
    if (!start) return [];

    const stack = [start];
    const visited = new Set<TileModel>();
    const result: TileModel[] = [];

    while (stack.length) {
      const tile = stack.pop();
      if (!tile || visited.has(tile)) continue;

      visited.add(tile);
      result.push(tile);

      const neighbors = [
        this.getTile(tile.row - 1, tile.col),
        this.getTile(tile.row + 1, tile.col),
        this.getTile(tile.row, tile.col - 1),
        this.getTile(tile.row, tile.col + 1),
      ];

      neighbors.forEach((n) => {
        if (n && n.color === start.color) stack.push(n);
      });
    }

    return result;
  }

  getRandomSpecialType(): TileSpecialType {
    const types = [
      TileSpecialType.ClearRow,
      TileSpecialType.ClearColumn,
      TileSpecialType.ClearRadius,
    ];

    return types[Math.floor(Math.random() * types.length)];
  }

  removeTiles(tiles: TileModel[]) {
    tiles.forEach((t) => {
      this.grid[t.row][t.col] = null;
    });
  }

  getAllTiles() {
    return [].concat(...this.grid);
  }

  collapseAndFill(): TileModel[] {
    const changed: TileModel[] = [];

    for (let c = 0; c < this.cols; c++) {
      const column: TileModel[] = [];

      for (let r = this.rows - 1; r >= 0; r--) {
        const tile = this.grid[r][c];
        if (tile) column.push(tile);
      }

      while (column.length < this.rows) {
        const tile = this.createTile(-1, c);
        tile.isNew = true;
        column.push(tile);
      }

      for (let r = this.rows - 1, i = 0; r >= 0; r--, i++) {
        const tile = column[i];
        tile.row = r;
        tile.col = c;
        this.grid[r][c] = tile;
        changed.push(tile);
      }
    }

    return changed;
  }

  isInside(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }
}
