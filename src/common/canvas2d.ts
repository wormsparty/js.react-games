import {Tileset} from '../map/tileset';
import {Pos} from "./pos";

export class Canvas2D {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly referenceWidth: number;
  private readonly referenceHeight: number;
  private readonly fontSize: number;
  private readonly font: string;
  private readonly fontFamily: string;
  private windowWidth: number;
  private windowHeight: number;
  public marginLeft: number;
  public marginRight: number;
  public marginTop: number;
  public marginBottom: number;
  public scaleFactor: number;
  public tilesize: number;

  constructor(canvas: HTMLCanvasElement, referenceWidth: number, referenceHeight: number, fontSize: number, fontFamily: string, tilesize: number) {
    this.ctx = canvas.getContext('2d')!;
    this.scaleFactor = 1;
    this.marginLeft = 0;
    this.marginRight = 0;
    this.marginTop = 0;
    this.marginBottom = 0;
    this.windowWidth = 0;
    this.windowHeight = 0;
    this.referenceWidth = referenceWidth;
    this.referenceHeight = referenceHeight;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.font = fontSize + 'px ' + fontFamily;
    this.tilesize = tilesize;
  }
  resize(scaleFactor: number, marginLeft: number, marginRight: number, marginTop: number, marginBottom: number, windowWidth: number, windowHeight: number) {
    this.scaleFactor = scaleFactor;
    this.marginLeft = marginLeft;
    this.marginRight = marginRight;
    this.marginTop = marginTop;
    this.marginBottom = marginBottom;
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;

    // This needs to be done at each resizing!
    this.ctx.imageSmoothingEnabled = false;
  }
  img(tileset: Tileset, pos: Pos, i: number, j: number) {
    const sx = this.tilesize * i;
    const sy = this.tilesize * j;

    let cutLeft = 0;
    let cutRight = 0;
    let cutTop = 0;
    let cutBottom = 0;

    if (pos.x < 0) {
      cutLeft = -pos.x;
    }

    if (pos.y < 0) {
      cutTop = -pos.y;
    }

    if (pos.x + this.tilesize > this.referenceWidth) {
      cutRight = pos.x + this.tilesize - this.referenceWidth;
    }

    if (pos.y + this.tilesize > this.referenceHeight) {
      cutBottom = pos.y + this.tilesize - this.referenceHeight;
    }

    if (cutLeft < this.tilesize
      && cutRight < this.tilesize
      && cutTop < this.tilesize
      && cutBottom < this.tilesize) {
      const targetX = (pos.x + cutLeft) * this.scaleFactor + this.marginLeft;
      const targetY = (pos.y + cutTop) * this.scaleFactor + this.marginTop;

      /*console.log('s = ' + sx + ', ' + sy);
      console.log('w = ' + w + ', h = ' + h);
      console.log('cut = ' + cutLeft + ', ' + cutRight + ', ' + cutTop + ', ' + cutBottom);
      console.log('target = ' + targetX + ',' + targetY);*/

      this.ctx.drawImage(
        tileset.image,
        sx + cutLeft,
        sy + cutTop,
        this.tilesize - cutLeft - cutRight,
        this.tilesize - cutTop - cutBottom,
        targetX,
        targetY,
        (this.tilesize - cutLeft - cutRight) * this.scaleFactor,
        (this.tilesize - cutTop - cutBottom) * this.scaleFactor);
    }
  }
  rect(pos: Pos, w: number, h: number, color: string) {
    this.ctx.fillStyle = color;

    let x = pos.x;
    let y = pos.y;

    if (x < 0) {
      w += x;
      x = 0;
    }

    if (y < 0) {
      h += y;
      y = 0;
    }

    if (x >= this.referenceWidth) {
      w -= x - this.referenceWidth;
      x = this.referenceWidth - 1;
    }

    if (y >= this.referenceHeight) {
      h -= y - this.referenceHeight;
      y = this.referenceHeight - 1;
    }

    if (w <= 0 || h <= 0) {
      return;
    }

    this.ctx.fillRect(
    this.marginLeft + x * this.scaleFactor,
    this.marginTop + y * this.scaleFactor,
      w * this.scaleFactor,
      h * this.scaleFactor);
  }
  text(str: string, pos: Pos, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.font = this.font;

    // TODO: Don't draw text outside
    const x = pos.x;
    const y = pos.y + this.fontSize - 3;

    this.ctx.save();
    this.ctx.translate(this.marginLeft, this.marginTop);
    this.ctx.scale(this.scaleFactor, this.scaleFactor);

    this.ctx.fillText(str, x, y);
    this.ctx.restore();
  }
  clear(color: string) {
    this.ctx.fillStyle = 'rgba(5, 5, 5, 1)';
    // handle.ctx.fillRect(0, 0, handle.windowWidth, handle.windowHeight);

    const ml = this.marginLeft;
    const mr = this.marginRight;
    const mb = this.marginBottom;
    const mt = this.marginTop;
    const ww = this.windowWidth;
    const wh = this.windowHeight;

    // Left band
    // this.ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    this.ctx.fillRect(0, 0, ml, wh);
    // Top band
    // this.ctx.fillStyle = 'rgba(255, 255, 0, 1)';
    this.ctx.fillRect(ml, 0, ww - mr - ml, mt);
    // Right band
    // this.ctx.fillStyle = 'rgba(255, 0, 255, 1)';
    this.ctx.fillRect(ww - mr, 0, mr, wh);
    // Bottom band
    // this.ctx.fillStyle = 'rgba(0, 255, 255, 1)';
    this.ctx.fillRect(ml, wh - mb, ww - mr - ml, mb);

    this.ctx.fillStyle = color;
    this.ctx.fillRect(ml, mt, ww - ml - mr, wh - mb - mt);
  }
  get_char_width() {
    return 8;
  }
}
