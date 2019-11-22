import {Editor} from './editor';
import {Engine} from '../common/engine';
import {Tileset} from './tileset';
import {Pos} from "../common/pos";

class Cell {
  public tileset: string;
  public tileX: number;
  public tileY: number;

  constructor(tileset: string, tileX: number, tileY: number) {
    this.tileset = tileset;
    this.tileX = tileX;
    this.tileY = tileY;
  }
}

export class Level {
  private engine: Engine | null = null;

  private tilesets: Map<string, Tileset> = new Map<string, Tileset>();
  public tilesize: number = 0;

  public cells: Map<Pos, Cell> = new Map<Pos, Cell>();

  private isClicking = false;

  public shiftLeft = 0;
  public shiftTop = 0;

  setHandles(engine: Engine, tilesets: Map<string, Tileset>, tilesize: number) {
    this.engine = engine;
    this.tilesets = tilesets;
    this.tilesize = tilesize;
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
      const tileset = this.tilesets.get(cell.tileset)!;

      const xx = (pos.x + this.shiftLeft) * this.tilesize;
      const yy = (pos.y + this.shiftTop) * this.tilesize;

      if (xx < 0 || xx >= this.engine.referenceWidth - editorOuterWidth
       || yy < 0 || yy >= this.engine.referenceHeight) {
        continue;
      }

      this.engine.img(tileset, new Pos(xx + editorOuterWidth, yy + editorTopHeight), cell.tileX, cell.tileY);
    }

    if (this.engine.mousePosX >= editorOuterWidth) {
      const xx = this.engine.mousePosX - (this.engine.mousePosX - editorOuterWidth) % this.tilesize;
      const yy = this.engine.mousePosY - (this.engine.mousePosY - editorTopHeight) % this.tilesize;

      this.engine.rect(new Pos(xx, yy), this.tilesize, this.tilesize, 'rgba(55, 55, 55, 0.5)');
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

    const xx = Math.floor((this.engine.mousePosX - editorWidth) / this.tilesize);
    const yy = Math.floor((this.engine.mousePosY - topBarHeight) / this.tilesize);

    const horizTiles = (this.engine.referenceWidth - editorWidth) / this.tilesize;
    const vertTiles = (this.engine.referenceHeight - topBarHeight) / this.tilesize;

    if (xx >= 0 && yy >= 0 && xx < horizTiles && yy < vertTiles) {
        const p = new Pos(xx - this.shiftLeft, yy - this.shiftTop);
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

  mouseDown(editor: Editor | null) {
    this.isClicking = true;
    this.onMouseMove(editor);
  }

  mouseUp() {
    this.isClicking = false;
  }
}
