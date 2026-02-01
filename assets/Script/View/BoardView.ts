import GameController from '../Controller/GameController';
import { TileModel } from '../Model/TileModel';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardView extends cc.Component {
  @property({ tooltip: 'Префаб тайл-элемента', type: cc.Prefab })
  tilePrefab: cc.Prefab = null;

  tileSize: number = 0;

  onLoad() {
    const gc = GameController.instance;
    this.tileSize = Math.min(this.node.width / gc.cols, this.node.height / gc.rows);
  }

  gridToWorld(row: number, col: number): cc.Vec3 {
    const startX = -this.node.width / 2;
    const startY = this.node.height / 2;

    return cc.v3(
      startX + col * this.tileSize + this.tileSize / 2,
      startY - row * this.tileSize - this.tileSize / 2,
    );
  }

  createTile(tile: TileModel) {
    const node = cc.instantiate(this.tilePrefab);
    node.parent = this.node;
    node.width = this.tileSize;
    node.height = this.tileSize;

    node.setPosition(this.gridToWorld(tile.row, tile.col));
    tile.viewNode = node;

    const view = node.getComponent('TileView');
    view.init(tile);
  }

  moveTile(tile: TileModel) {
    if (!tile.viewNode) return;

    const target = this.gridToWorld(tile.row, tile.col);
    cc.tween(tile.viewNode).to(0.25, { position: target }).start();
  }

  spawnNewTile(tile: TileModel) {
    const node = cc.instantiate(this.tilePrefab);
    node.parent = this.node;
    node.width = this.tileSize;
    node.height = this.tileSize;

    const startX = this.gridToWorld(0, tile.col).x;
    const startY = this.node.height / 2 + this.tileSize;

    node.setPosition(startX, startY);

    tile.viewNode = node;

    const view = node.getComponent('TileView');
    view.init(tile);
  }
}
