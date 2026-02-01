export enum TileColor {
  Red,
  Blue,
  Green,
  Yellow,
  Purple,
  Other,
}

export enum TileSpecialType {
  None = 0,
  ClearRow = 1,
  ClearColumn = 2,
  ClearRadius = 3,
}

export class TileModel {
  row: number;
  col: number;
  color: number;

  isNew: boolean = false;

  specialType: TileSpecialType = TileSpecialType.None;

  viewNode: cc.Node | null = null;

  constructor(row: number, col: number, color: number) {
    this.row = row;
    this.col = col;
    this.color = color;
  }

  isSpecial(): boolean {
    return this.specialType !== TileSpecialType.None;
  }
}
