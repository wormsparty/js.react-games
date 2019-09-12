import * as consts from './const';
import {TargetSpawner} from './target';
import {Labyrinth} from "./labyrinth";

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

export class TeleportPos extends Pos {
  id: number;

  constructor(x: number, y: number, id: number) {
    super(x, y);
    this.id = id;
  }
}

export class ObjPos extends Pos {
  usage: number;

  constructor(x: number, y: number, usage: number) {
    super(x, y);
    this.usage = usage;
  }

  copy(): ObjPos {
    return new ObjPos(this.x, this.y, this.usage);
  }
}

export class ProjPos extends Pos {
  vx: number;
  vy: number;
  symbol: string;
  power: number;

  constructor(x: number, y: number, vx: number, vy: number, symbol: string, power: number) {
    super(x, y);
    this.vx = vx;
    this.vy = vy;
    this.symbol = symbol;
    this.power = power;
  }

  copy(): ProjPos {
    return new ProjPos(this.x, this.y, this.vx, this.vy, this.symbol, this.power);
  }
}

export class LevelMap {
  map: string;
  meta: string;
  teleportMap: Map<string, string>;
  tile2color: Map<string, string>;
  texts: Map<string, Map<string, Pos>>;
  teleports: Map<string, Array<TeleportPos>>;
  teleportCount: Map<string, number>;
  obstacles: Map<string, Array<Pos>>;
  obstacleColor: string;
  initialItemPositions: Map<string, Array<ObjPos>>;
  start: Pos;
  backgroundColor: string;
  textColor: string;
  targetSpawner: TargetSpawner | null;
  obstacleVisible: ((laby: Labyrinth, str: string) => boolean) = () => false;

  constructor(map: string, meta: string, teleportMap: Map<string, string>,
              tile2color: Map<string, string>, texts: Map<string, Map<string, Pos>>, background: string,
              textColor: string, targetSpawner: TargetSpawner | null,
              obstacleVisible: ((laby: Labyrinth, str: string) => boolean) | null, obstacleColor: string) {
    this.map = map;
    this.meta = meta;
    this.teleportMap = teleportMap;
    this.tile2color = tile2color;
    this.texts = texts;
    this.teleports = new Map<string, Array<TeleportPos>>();
    this.teleportCount = new Map<string, number>();
    this.initialItemPositions = new Map<string, Array<ObjPos>>();
    this.start = new Pos(0, 0);
    this.targetSpawner = targetSpawner;
    this.obstacles = new Map<string, Array<Pos>>();

    if (obstacleVisible != null) {
      this.obstacleVisible = obstacleVisible;
    }

    if (background !== undefined) {
      this.backgroundColor = background;
    } else {
      this.backgroundColor = consts.DefaultBackgroundColor;
    }

    if (textColor !== '') {
      this.textColor = textColor;
    } else {
      this.textColor = consts.DefaultTextColor;
    }

    if (obstacleColor !== undefined) {
      this.obstacleColor = obstacleColor;
    } else {
      this.obstacleColor = consts.DefaultTextColor;
    }
  }

  parse(name: string): void {
    const visualMap: Array<string> = this.map.split('\n');
    const metaMap: Array<string> = this.meta.split('\n');

    if (visualMap.length !== consts.mapLines) {
      console.log('La carte V ' + name + ' n\'a pas exactement ' + consts.mapLines + ' lignes (' + visualMap.length + ')');
    }

    if (metaMap.length !== consts.mapLines) {
      console.log('La carte M ' + name + ' n\'a pas exactement ' + consts.mapLines + ' lignes (' + metaMap.length + ')');
    }

    for (let i = 0; i < consts.mapLines; i++) {
      if (visualMap[i].length !== consts.charPerLine) {
        console.log('V ' + name + ' l.' + i + ' n\'a pas exactement ' + consts.charPerLine + ' chars (' + visualMap[i].length + ')');
      }

      if (metaMap[i].length !== consts.charPerLine) {
        console.log('M ' + name + ' l.' + i + ' n\'a pas exactement ' + consts.charPerLine + ' chars (' + metaMap[i].length + ')');
      }
    }

    for (let y = 0; y < consts.mapLines; y++) {
      for (let x = 0; x < consts.charPerLine; x++) {
        const chr = metaMap[y][x];

        if (chr === '#') {
          if (visualMap[y][x] !== '#') {
            console.log('Les murs ne marchent pas en (' + x + ', ' + y + '), carte = ' + name);
          }
        } else if (consts.teleportSymbols.indexOf(chr) > -1) {
          if (!this.teleports.has(chr)) {
            this.teleports.set(chr, []);
            this.teleportCount.set(chr, 0);
          }

          this.teleports.get(chr)!.push(new TeleportPos(x, y, this.teleportCount.get(chr)!));
          this.teleportCount.set(chr, this.teleportCount.get(chr)! + 1);
        } else if (consts.itemSymbols.indexOf(chr) > -1) {
          if (!this.initialItemPositions.has(chr)) {
            this.initialItemPositions.set(chr, []);
          }

          this.initialItemPositions.get(chr)!.push(new ObjPos(x, y, 1));
        } else if (consts.obstacleSymbols.indexOf(chr) > -1) {
          if (!this.obstacles.has(chr)) {
            this.obstacles.set(chr, []);
          }

          this.obstacles.get(chr)!.push(new Pos(x, y));
        } else if (chr !== ' ' && chr !== undefined) {
          if (chr === '@') {
            this.start = new Pos(x, y);
          } else {
            console.log('Unknown char: ' + chr);
          }
        }
      }
    }
  }
  get_symbol_at(x: number, y: number): string {
    return this.map[y * (consts.charPerLine + 1) + x];
  }
}
