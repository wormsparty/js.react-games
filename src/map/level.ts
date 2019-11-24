import {Editor} from './editor';
import {Engine} from '../common/engine';
import {Tileset} from './tileset';
import {Pos} from "../common/pos";
import {Hero} from "./hero";

class Layer {
    public tileset: number;
    public cells: Array<Pos | undefined>;
    public cellsX: number;

    constructor(tileset: number, cellsX: number, cellsY: number) {
        this.tileset = tileset;
        this.cellsX = cellsX;
        this.cells = new Array<Pos>(cellsX * cellsY);
    }
}

enum TileSetType {
    Terrain = 0,
    Objets = 1,
    Teleporteurs = 2,
}

export class Level {
  private engine: Engine | null = null;

  private tilesets: Tileset[] = new Array<Tileset>();
  public tilesizeX: number = 0;
  public tilesizeY: number = 0;

  public layers: Layer[] = new Array<Layer>();
  public hero: Hero = new Hero(TileSetType.Objets, 0, 0);

  private isClicking = false;

  public shiftLeft = 0;
  public shiftTop = 0;

  public cellsX = 68;
  public cellsY = 31;

  setHandles(engine: Engine, tilesets: Array<Tileset>, tilesizeX: number, tilesizeY: number) {
    this.engine = engine;
    this.tilesets = tilesets;
    this.tilesizeX = tilesizeX;
    this.tilesizeY = tilesizeY;

    for(let i = 0; i < tilesets.length; i++) {
        this.layers.push(new Layer(i, this.cellsX, this.cellsY));
    }
  }

 /* exportToFile(json: any) {
    const a = document.createElement("a");
    const file = new Blob([json], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = 'export.json';
    a.click();
  }

  exportToJson(): any {
    const layers = [];

    for(const layer of this.layers) {
        const cells = [];

        for(const cell of layer.cells) {
            cells.push([cell.x, cell.y]);
        }
    }

   const json = {
        cells: cells,
   };

    return JSON.stringify(json);
  }

  import(data: string) {
      const json = JSON.parse(data);

      this.cells.clear();

      for(const cell of json.cells) {
          this.cells.set(new Pos(cell[0], cell[1]), new Cell(cell[2], cell[3], cell[4]));
      }
  }*/

  drawAt(tilesetNb: number, pos: Pos, tileX: number, tileY: number, editorOuterWidth: number, editorTopHeight: number) {
      if (this.engine == null) {
          return;
      }

      const tileset = this.tilesets[tilesetNb];

      const xx = (pos.x + this.shiftLeft) * this.tilesizeX;
      const yy = (pos.y + this.shiftTop) * this.tilesizeY;

      if (xx < 0 || xx >= this.engine.referenceWidth - editorOuterWidth
          || yy < 0 || yy >= this.engine.referenceHeight) {
          return;
      }

      this.engine.img(tileset, new Pos(xx + editorOuterWidth, yy + editorTopHeight), tileX, tileY);
  }

  draw(editor: Editor | null) {
    let editorOuterWidth = 0;
    let editorTopHeight = 0;

    if (editor != null) {
      editorOuterWidth = editor.outerWidth();
      editorTopHeight = editor.outerHeight();
    }

    if (this.engine == null) {
      return;
    }

    for (const layer of this.layers) {
        for (let i = 0; i < this.cellsX; i++) {
            for (let j = 0; j < this.cellsY; j++) {
                const cell = layer.cells[i + j * this.cellsX];

                if (cell !== undefined) {
                    this.drawAt(layer.tileset, new Pos(i, j), cell.x, cell.y, editorOuterWidth, editorTopHeight);
                }
            }
        }
    }

    this.drawAt(this.hero.tileset, this.hero.pos, this.hero.tilesetPosX, this.hero.tilesetPosY, editorOuterWidth, editorTopHeight);

    if (this.engine.mousePosX >= editorOuterWidth) {
      const xx = this.engine.mousePosX - (this.engine.mousePosX - editorOuterWidth) % this.tilesizeX;
      const yy = this.engine.mousePosY - (this.engine.mousePosY - editorTopHeight) % this.tilesizeY;

      this.engine.rect(new Pos(xx, yy), this.tilesizeX, this.tilesizeY, 'rgba(55, 55, 55, 0.5)');
    }
  }

  update(editor: Editor | null) {
    if (editor !== null) {
        if (editor.doExport) {
            // TODO
            //const json = this.exportToJson();
            //this.exportToFile(json);
            editor.doExport = false;
        }
    }
  }

  onMouseMove(editor: Editor | null) {
    if (!this.isClicking || editor == null || this.engine == null) {
      return;
    }

    const editorWidth = editor.outerWidth();
    const topBarHeight = editor.outerHeight();

    const xx = Math.floor((this.engine.mousePosX - editorWidth) / this.tilesizeX);
    const yy = Math.floor((this.engine.mousePosY - topBarHeight) / this.tilesizeY);

    const horizTiles = (this.engine.referenceWidth - editorWidth) / this.tilesizeX;
    const vertTiles = (this.engine.referenceHeight - topBarHeight) / this.tilesizeY;

    if (xx >= 0 && yy >= 0 && xx < horizTiles && yy < vertTiles) {
        const p = new Pos(xx - this.shiftLeft, yy - this.shiftTop);

        if (editor.currentMenu === this.hero.tileset
            && editor.currentTileIndexX === this.hero.tilesetPosX
            && editor.currentTileIndexY === this.hero.tilesetPosY) {
            this.hero.pos = p;
        } else {
            const layer = this.layers[editor.currentMenu];
            let pos: Pos | undefined;

            if (!this.engine.isRightClick) {
                pos = new Pos(editor.currentTileIndexX, editor.currentTileIndexY);
            } else {
                pos = undefined;
            }

            layer.cells[p.x + p.y * this.cellsX] = pos;
        }

    }
  }

  mouseDown(editor: Editor | null) {
    this.isClicking = true;
    this.onMouseMove(editor);
  }

  mouseUp() {
    this.isClicking = false;
  }
}
