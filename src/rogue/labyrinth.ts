import {Engine} from "../common/engine";
import {TextureLoader} from "../map/textureloader";
import {KeyPress} from "../common/keypress";

export class Labyrinth {
    public pressed: Map<string, KeyPress>;
    public tilesize = 16;

    public readonly engine: Engine;
    private readonly textureLoader: TextureLoader;

    fps: number;

    constructor() {
        let width = 512;
        let height = 448;

        this.engine = new Engine(
            'canvas',
            width,
            height,
            6,
            'wonder',
            true,
            this.tilesize);

        this.pressed = new Map();
        this.pressed.set('ArrowUp', {pressed: false, prevPressed: false});
        this.pressed.set('ArrowDown', {pressed: false, prevPressed: false});
        this.pressed.set('ArrowLeft', {pressed: false, prevPressed: false});
        this.pressed.set('ArrowRight', {pressed: false, prevPressed: false});

        this.textureLoader = new TextureLoader();
        this.fps = 30;

        const allTilesetsLoaded = () => {
            this.updateAndDraw();
        };

        this.textureLoader.setLoadedFunction(allTilesetsLoaded);

        // TODO

        this.textureLoader.waitLoaded();
    }

    updateAndDraw() {
        setInterval(() => {
            this.doUpdate();
            this.draw();
        }, 1000 / this.fps);
    }

    draw(): void {
        this.engine.clear('#888888');

        if (!this.textureLoader.isInitialized) {
            this.engine.textCentered('Loading...', 40, '#FFFFFF');
        } else {
            // TODO
        }
    }
    doUpdate(): void {
    }
    resize(width: number, height: number): void {
        this.engine.resize(width, height);
        this.draw();
    }
}