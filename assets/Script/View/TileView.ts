import GameController from '../Controller/GameController';
import { TileModel, TileSpecialType } from '../Model/TileModel';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {
  @property({ tooltip: 'Системный параметр для логики', type: cc.Sprite })
  sprite: cc.Sprite = null;

  @property({ tooltip: 'Массив спрайтов всех обычных тайлов', type: [cc.SpriteFrame] })
  tileSprites: cc.SpriteFrame[] = [];

  @property({
    tooltip: 'Спрайт специального тайла для удаления строки тайлов',
    type: cc.SpriteFrame,
  })
  rowSpecialSprite: cc.SpriteFrame = null;

  @property({
    tooltip: 'Спрайт специального тайла для удаления колонки тайлов',
    type: cc.SpriteFrame,
  })
  columnSpecialSprite: cc.SpriteFrame = null;

  @property({
    tooltip: 'Спрайт специального тайла для удаления тайлов по радиусу',
    type: cc.SpriteFrame,
  })
  radiusSpecialSprite: cc.SpriteFrame = null;

  model: TileModel;

  init(tile: TileModel) {
    this.model = tile;

    if (tile.isSpecial()) {
      this.applySpecialVisual(tile.specialType);
    } else {
      this.sprite.spriteFrame = this.tileSprites[tile.color];
    }
  }

  applySpecialVisual(type: TileSpecialType) {
    switch (type) {
      case TileSpecialType.ClearRow:
        this.sprite.spriteFrame = this.rowSpecialSprite;
        break;
      case TileSpecialType.ClearColumn:
        this.sprite.spriteFrame = this.columnSpecialSprite;
        break;
      case TileSpecialType.ClearRadius:
        this.sprite.spriteFrame = this.radiusSpecialSprite;
        break;
    }
  }

  onLoad() {
    this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
  }

  onClick() {
    GameController.instance.onTileClicked(this.model.row, this.model.col);
  }
}
