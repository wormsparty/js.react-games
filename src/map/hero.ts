import {Pos} from "../common/pos";

export class Hero {
    public pos: Pos = new Pos(0, 0);
    public tileset: number;
    public tilesetPosX: number;
    public tilesetPosY: number;

    constructor(tileset: number, tilesetPosX: number, tilesetPosY: number) {
        this.tileset = tileset;
        this.tilesetPosX = tilesetPosX;
        this.tilesetPosY = tilesetPosY;
    }
}