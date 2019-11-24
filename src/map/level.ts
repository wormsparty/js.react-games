import {Editor} from './editor';
import {Engine} from '../common/engine';
import {Tileset} from './tileset';
import {Pos} from "../common/pos";
import {Hero} from "./hero";

class Cell {
  public tileset: number;
  public tileX: number;
  public tileY: number;

  constructor(tileset: number, tileX: number, tileY: number) {
    this.tileset = tileset;
    this.tileX = tileX;
    this.tileY = tileY;
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

  public cells: Map<Pos, Cell> = new Map<Pos, Cell>();
  public hero: Hero = new Hero(TileSetType.Objets, 0, 0);

  private isClicking = false;

  public shiftLeft = 0;
  public shiftTop = 0;

  setHandles(engine: Engine, tilesets: Array<Tileset>, tilesizeX: number, tilesizeY: number) {
    this.engine = engine;
    this.tilesets = tilesets;
    this.tilesizeX = tilesizeX;
    this.tilesizeY = tilesizeY;
    this.cells = new Map<Pos, Cell>();
  }

  exportToFile(json: any) {
    const a = document.createElement("a");
    const file = new Blob([json], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = 'export.json';
    a.click();
  }

  exportToJson(): any {
    const cells = [];

    for(const [pos, cell] of this.cells) {
        cells.push([pos.x, pos.y, cell.tileset, cell.tileX, cell.tileY]);
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
  }

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

    for (const [pos, cell] of this.cells) {
      this.drawAt(cell.tileset, pos, cell.tileX, cell.tileY, editorOuterWidth, editorTopHeight);
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
            const json = this.exportToJson();
            this.exportToFile(json);
            editor.doExport = false;
        }
    }
  }

  findCellAtPos(p: Pos): [Pos | undefined, Cell | undefined ] {
      for (const [pos, cell] of this.cells) {
          if (pos.equals(p)) {
              return [ pos, cell ];
          }
      }

      return [ undefined, undefined ];
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
            const [pos, cell] = this.findCellAtPos(p);

            if (!this.engine.isRightClick) {
                if (pos === undefined || cell === undefined) {
                    this.cells.set(p, {tileset: editor.currentMenu, tileX: editor.currentTileIndexX, tileY: editor.currentTileIndexY});
                } else {
                    cell.tileset = editor.currentMenu;
                    cell.tileX = editor.currentTileIndexX;
                    cell.tileY = editor.currentTileIndexY;
                }
            } else if (pos !== undefined) {
                this.cells.delete(pos);
            }
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
