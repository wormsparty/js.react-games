import {Tileset} from './tileset';
import {Engine} from '../common/engine';
import {Pos} from "../rogue/map_logic";

export class Editor {
  public currentTileIndexX = 0;
  public currentTileIndexY = 0;
  public currentMenu = 'tiles';

  private readonly leftPanelWidth = 112;
  private readonly topBarHeight = 10;
  private readonly margin = 6;

  private engine: Engine | null = null;
  private tilesets: Map<string, Tileset> = new Map<string, Tileset>();
  private tilesize: number = 0;

  setHandles(engine: Engine, tilesets: Map<string, Tileset>, tilesize: number) {
    this.engine = engine;
    this.tilesets = tilesets;
    this.tilesize = tilesize;
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

    const tileset = this.tilesets.get(this.currentMenu)!;

    const width = tileset.image.width;
    const height = tileset.image.height;

    const maxX = width / this.tilesize;
    const maxY = height / this.tilesize;

    for (let x = 0; x < maxX; x++) {
      for (let y = 0; y < maxY; y++) {
        const xx = x * this.tilesize;
        const yy = y * this.tilesize + this.outerHeight();

        this.engine.img(tileset, new Pos(xx, yy), x, y);

        if (x === this.currentTileIndexX && y === this.currentTileIndexY) {
          this.engine.rect(new Pos(xx, yy), this.tilesize, this.tilesize, 'rgba(25, 25, 25, 0.5)');
        } else if (this.engine.mousePosX >= xx && this.engine.mousePosX < xx + this.tilesize
          && this.engine.mousePosY >= yy && this.engine.mousePosY < yy + this.tilesize) {
          this.engine.rect(new Pos(xx, yy), this.tilesize, this.tilesize, 'rgba(55, 55, 55, 0.5)');
        }
      }
    }

    this.engine.rect(new Pos(this.leftPanelWidth, 0), this.margin, this.engine.referenceHeight, '#000000');

    if (this.currentMenu === 'tiles') {
      this.engine.text('tiles', new Pos(4, 8), '#FFF');
    } else {
      this.engine.text('tiles', new Pos(4, 8), '#000');
    }

    if (this.currentMenu === 'foes') {
      this.engine.text('foes', new Pos(37, 8), '#FFF');
    } else {
      this.engine.text('foes', new Pos(37, 8), '#000');
    }

    if (this.currentMenu === 'goodies') {
      this.engine.text('goodies', new Pos(68, 8), '#FFF');
    } else {
      this.engine.text('goodies', new Pos(68, 8), '#000');
    }
  }

  onClick(): boolean {
    if (this.engine != null && this.engine.mousePosX < this.leftPanelWidth) {
      const tileset = this.tilesets.get(this.currentMenu)!;

      const xx = Math.floor(this.engine.mousePosX / this.tilesize);
      const yy = Math.floor((this.engine.mousePosY - this.outerHeight()) / this.tilesize);

      const horizTiles = tileset.image.width / this.tilesize;
      const vertTiles = tileset.image.height / this.tilesize;

      if (xx >= 0 && yy >= 0 && xx < horizTiles && yy < vertTiles) {
        this.currentTileIndexX = xx;
        this.currentTileIndexY = yy;
      }

      return true;
    }

    return false;
  }
}
