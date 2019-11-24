import {Tileset} from './tileset';
import {Engine} from '../common/engine';
import {Pos} from "../common/pos";

export class Editor {
  public currentTileIndexX = 0;
  public currentTileIndexY = 0;
  public currentMenu = 0;
  public doExport: boolean = false;

  private readonly leftPanelWidth = 112;
  private readonly topBarHeight = 20;
  private readonly margin = 6;

  private engine: Engine | null = null;
  private tilesets: Tileset[] = new Array<Tileset>();
  private tilesizeX: number = 0;
  private tilesizeY: number = 0;

  setHandles(engine: Engine, tilesets: Array<Tileset>, tilesizeX: number, tilesizeY: number) {
    this.engine = engine;
    this.tilesets = tilesets;
    this.tilesizeX = tilesizeX;
    this.tilesizeY = tilesizeY;
  }
  outerWidth() {
    return this.leftPanelWidth + this.margin;
  }
  outerHeight() {
    return this.topBarHeight + this.margin;
  }

  draw() {
    if (this.engine == null) {
      return;
    }

    this.engine.rect(new Pos(0, 0), this.outerWidth(), this.engine.referenceHeight, '#AAA');
    const tileset = this.tilesets[this.currentMenu];

    const width = tileset.image.width;
    const height = tileset.image.height;

    const maxX = width / this.tilesizeX;
    const maxY = height / this.tilesizeY;

    for (let x = 0; x < maxX; x++) {
      for (let y = 0; y < maxY; y++) {
        const xx = x * this.tilesizeX;
        const yy = y * this.tilesizeY + this.outerHeight();

        this.engine.img(tileset, new Pos(xx, yy), x, y);

        if (x === this.currentTileIndexX && y === this.currentTileIndexY) {
          this.engine.rect(new Pos(xx, yy), this.tilesizeX, this.tilesizeY, 'rgba(25, 25, 25, 0.5)');
        } else if (this.engine.mousePosX >= xx && this.engine.mousePosX < xx + this.tilesizeX
          && this.engine.mousePosY >= yy && this.engine.mousePosY < yy + this.tilesizeY) {
          this.engine.rect(new Pos(xx, yy), this.tilesizeX, this.tilesizeY, 'rgba(55, 55, 55, 0.5)');
        }
      }
    }

    this.engine.rect(new Pos(this.leftPanelWidth, 0), this.margin, this.engine.referenceHeight, '#000000');

    this.engine.text('export', new Pos(4, 6), '#000');
    this.engine.text('layer: ' + this.currentMenu, new Pos(4, 16), '#000');
  }

  onClick(): boolean {
    if (this.engine != null && this.engine.mousePosX < this.leftPanelWidth && this.engine.mousePosX >= 0 && this.engine.mousePosY >= 0 && this.engine.mousePosY < this.engine.referenceHeight) {
      if (this.engine.mousePosY < this.outerHeight()) {
        if (this.engine.mousePosY < 12) {
          if (this.engine.mousePosX < 46) {
            this.doExport = true;
          }
        } else {
          this.currentMenu = (this.currentMenu + 1) % this.tilesets.length;
        }
      }
      else {
        const xx = Math.floor(this.engine.mousePosX / this.tilesizeX);
        const yy = Math.floor((this.engine.mousePosY - this.outerHeight()) / this.tilesizeY);

        const tileset = this.tilesets[this.currentMenu];

        const horizTiles = tileset.image.width / this.tilesizeX;
        const vertTiles = tileset.image.height / this.tilesizeY;

        if (xx >= 0 && yy >= 0 && xx < horizTiles && yy < vertTiles) {
          this.currentTileIndexX = xx;
          this.currentTileIndexY = yy;
        }
      }

      return true;
    }

    return false;
  }
}
