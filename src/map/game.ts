import {Engine} from '../common/engine';
import {Tileset} from './tileset';
import {TextureLoader} from './textureloader';
import {Level} from './level';
import {Editor} from './editor';
import {KeyPress} from "../common/keypress";

export class Game {
  public pressed: Map<string, KeyPress>;
  public tilesizeX = 14;
  public tilesizeY = 23;

  public readonly engine: Engine;
  private readonly textureLoader: TextureLoader;
  private tilesets: Map<string, Tileset> = new Map<string, Tileset>();

  private readonly editor: Editor | null;
  private level: Level;

  fps: number;

  constructor(enableEditor: boolean) {
    let width = 960;
    let height = 720;

    if (enableEditor) {
      this.editor = new Editor();
      width += this.editor.outerWidth();
      height += this.editor.outerHeight();
    } else {
      this.editor = null;
    }

    this.level = new Level();

    this.engine = new Engine(
      'canvas',
      width,
      height,
      6,
      'wonder',
      true,
      this.tilesizeX,
      this.tilesizeY);

    this.pressed = new Map();
    this.pressed.set('ArrowUp', {pressed: false, prevPressed: false});
    this.pressed.set('ArrowDown', {pressed: false, prevPressed: false});
    this.pressed.set('ArrowLeft', {pressed: false, prevPressed: false});
    this.pressed.set('ArrowRight', {pressed: false, prevPressed: false});
    this.pressed.set('w', {pressed: false, prevPressed: false});
    this.pressed.set('a', {pressed: false, prevPressed: false});
    this.pressed.set('s', {pressed: false, prevPressed: false});
    this.pressed.set('d', {pressed: false, prevPressed: false});

    this.textureLoader = new TextureLoader();
    this.fps = 30;
  }

  loop() {
    const allTilesetsLoaded = () => {
      this.updateAndDraw();
    };

    this.textureLoader.setLoadedFunction(allTilesetsLoaded);

    this.tilesets.set('terrain', new Tileset(process.env.PUBLIC_URL + '/terrain.png', this.textureLoader));
    //this.tilesets.set('personnages', new Tileset(process.env.PUBLIC_URL + '/personnages.png', this.textureLoader));
    //this.tilesets.set('objets', new Tileset(process.env.PUBLIC_URL + '/objets.png', this.textureLoader));

    if (this.editor != null) {
      this.editor.setHandles(this.engine, this.tilesets, this.tilesizeX, this.tilesizeY);
    }

    this.level.setHandles(this.engine, this.tilesets, this.tilesizeX, this.tilesizeY);
    this.textureLoader.waitLoaded();
  }

  updateAndDraw() {
    setInterval(() => {
      this.doUpdate();
      this.draw();
    }, 1000 / this.fps);
  }

  draw(): void {
    this.engine.clear('#000000');

    if (!this.textureLoader.isInitialized) {
      this.engine.textCentered('Loading...', 40, '#FFFFFF');
    } else {
      if (this.editor != null) {
        this.editor.draw();
      }

      this.level.draw(this.editor);
    }
  }

  doUpdate(): void {
    let key = this.pressed.get('ArrowUp')!;

    if (key.pressed && !key.prevPressed) {
      this.level.shiftTop++;
      key.prevPressed = key.pressed;
    }

    key = this.pressed.get('ArrowDown')!;

    if (key.pressed && !key.prevPressed) {
      this.level.shiftTop--;
      key.prevPressed = key.pressed;
    }

    key = this.pressed.get('ArrowLeft')!;

    if (key.pressed && !key.prevPressed) {
      this.level.shiftLeft++;
      key.prevPressed = key.pressed;
    }

    key = this.pressed.get('ArrowRight')!;

    if (key.pressed && !key.prevPressed) {
      this.level.shiftLeft--;
      key.prevPressed = key.pressed;
    }

    key = this.pressed.get('w')!;
    this.level.hero.pos.y += key.pressed ? -1 : 0;

    key = this.pressed.get('a')!;
    this.level.hero.pos.x += key.pressed ? -1 : 0;

    key = this.pressed.get('s')!;
    this.level.hero.pos.y += key.pressed ? 1 : 0;

    key = this.pressed.get('d')!;
    this.level.hero.pos.x += key.pressed ? 1 : 0;

    this.level.update(this.editor);
  }

  resize(width: number, height: number): void {
    this.engine.resize(width, height);
    this.draw();
  }

  setMousePos(x: number, y: number, which: number) {
    if (this.engine !== undefined && this.engine != null) {
      this.engine.setMousePos(x, y, which);
      this.level.onMouseMove(this.editor);
    }
  }

  mouseDown(x: number, y: number, which: number) {
    this.engine.click(x, y, which);

    if (this.editor == null || !this.editor.onClick()) {
      this.level.mouseDown(this.editor);
    }
  }

  mouseUp() {
    this.level.mouseUp();
  }


  import(data: string) {
    this.level.import(data);
  }
}
