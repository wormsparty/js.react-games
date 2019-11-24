import { Canvas2D } from './canvas2d';
import {Tileset} from '../map/tileset';
import {Pos} from "./pos";
// import { WebAudio } from './webaudio';

export class Engine {
  private readonly canvas: HTMLCanvasElement | null;
  private readonly graphics: Canvas2D;
  // private readonly audio: WebAudio;

  readonly referenceWidth: number = 0;
  readonly referenceHeight: number = 0;

  public integerZoom: boolean = false;

  public mousePosX: number = 0;
  public mousePosY: number = 0;
  public isRightClick: boolean = false;

  setMousePos(x: number, y: number, which: number) {
    this.mousePosX = Math.floor((x - this.graphics.marginLeft) / this.graphics.scaleFactor);
    this.mousePosY = Math.floor((y - this.graphics.marginTop) / this.graphics.scaleFactor);
    this.isRightClick = which === 3;
  }
  click(x: number, y: number, which: number) {
    this.setMousePos(x, y, which);
  }
  clear(color: string) {
    this.graphics.clear(color);
  }
  rect(pos: Pos, w: number, h: number, color: string) {
    this.graphics.rect(pos, w, h, color);
  }
  text(str: string, coord: Pos, color: string) {
    this.graphics.text(str, coord, color);
  }
  textCentered(text: string, yy: number, color: string) {
    const coord = new Pos(this.referenceWidth / 2 - this.get_char_width() * text.length / 2, yy);
    this.text(text, coord, color);
  }
  get_char_width() {
    return this.graphics.get_char_width();
  }
  img(tileset: Tileset, pos: Pos, x: number, y: number) {
    this.graphics.img(tileset, pos, x, y);
  }
  /*load_sound(file, onload, onfailure) {
    this.audio.load(file, onload, onfailure);
  }
  play(filename) {
    this.audio.play(filename);
  }*/
  getZoom(width: number, height: number, referenceWidth: number, referenceHeight: number) {
    const zoomX = width / referenceWidth;
    const zoomY = height / referenceHeight;
    let zoom = zoomX;

    if (zoomY < zoom) {
      zoom = zoomY;
    }

    if (this.integerZoom) {
      zoom = Math.floor(zoom);

      if (zoom < 1) {
        zoom = 1;
      }

      return zoom;
    } else {
      return zoom;
    }
  }
  resize(width: number, height: number) {
    const zoom = this.getZoom(width, height, this.referenceWidth, this.referenceHeight);

    const borderx = Math.floor((width - this.referenceWidth * zoom) / 2);
    const bordery = Math.floor((height - this.referenceHeight * zoom) / 2);
    const ajustementx = Math.floor(width - this.referenceWidth * zoom - borderx * 2);
    const ajustementy = Math.floor(height - this.referenceHeight * zoom - bordery * 2);

    if (this.canvas != null) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.graphics.resize(zoom, borderx + ajustementx, borderx, bordery + ajustementy, bordery, width, height);
  }
  constructor(canvasId: string, width: number, height: number, fontSize: number, fontFamily: string, integerZoom: boolean, tilesizeX: number, tilesizeY: number) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.canvas.oncontextmenu = function() {
        return false;
    };

    this.graphics = new Canvas2D(this.canvas, width, height, fontSize, fontFamily, tilesizeX, tilesizeY);
    /*this.audio = new WebAudio();

    if (!this.audio) {
      console.log('Failed to initialize WebAudio.');
      return;
    }*/

    if (!this.graphics) {
      console.log('Failed to load Canvas2D.');
      return;
    }

    this.referenceWidth = width;
    this.referenceHeight = height;
    this.integerZoom = integerZoom;

    if (this.canvas != null) {
      this.canvas.focus();
    }
  }
}
