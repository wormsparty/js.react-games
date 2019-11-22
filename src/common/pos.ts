export class Pos {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    equals(otherPos: Pos): boolean {
        return this.x === otherPos.x && this.y === otherPos.y;
    }

    copy(): Pos {
        return new Pos(this.x, this.y);
    }
}