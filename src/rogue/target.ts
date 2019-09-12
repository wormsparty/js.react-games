import {Pos} from './map_logic';
import {Labyrinth} from './labyrinth';
import * as consts from './const';
import * as translations from './translations';

export class Target {
  pos: Pos;
  symbol: string;
  pv: number;
  pvMax: number;

  constructor(pos: Pos, symbol: string, pv: number, pvMax: number) {
    this.pos = pos;
    this.symbol = symbol;
    this.pv = pv;
    this.pvMax = pvMax;
  }

  copy(): Target {
    return new Target(this.pos.copy(), this.symbol, this.pv, this.pvMax);
  }
}

export class SpawnerState {
  readonly targets: Array<Target>;
  tick: number;

  constructor(targets: Array<Target>, tick: number) {
    this.targets = targets;
    this.tick = tick;
  }

  static parse(json: any): SpawnerState | null {
    if (json === null) {
      return null;
    }

    const p = new SpawnerState([], json.tick);

    for (const target of json.targets) {
      p.targets.push(new Target(new Pos(target.pos.x, target.pos.y), target.symbol, target.pv, target.pvMax));
    }

    return p;
  }
  print(): {} {
    const json: any = {
      targets: [],
      tick: this.tick,
    };

    for (let i = 0; i < this.targets.length; i++) {
      json.targets[i] = {
        pos: {
          x: this.targets[i].pos.x,
          y: this.targets[i].pos.y,
        },
        symbol: this.targets[i].symbol,
        pv: this.targets[i].pv,
        pv_max: this.targets[i].pvMax,
      };
    }

    return json;
  }
  copy(): SpawnerState {
    const cpy = new SpawnerState([], this.tick);

    for (const t of this.targets) {
      cpy.targets.push(t.copy());
    }

    return cpy;
  }
  reset(): void {
    this.tick = 0;
    this.targets.splice(0, this.targets.length);
  }
}

export class TargetSpawner {
  private readonly spawnerUpdate: (s: SpawnerState) => void;
  private readonly targetUpdate: (str: string) => Pos;
  pv2color: (nb: number) => string;

  constructor(spawnerUpdate: (s: SpawnerState) => void, targetUpdate: (str: string) => Pos, pv2color: (nb: number) => string) {
    this.spawnerUpdate = spawnerUpdate;
    this.targetUpdate = targetUpdate;
    this.pv2color = pv2color;
  }

  inner_update(l: Labyrinth, i: number, target: Target, stateHolder: SpawnerState, heroPos: Pos, dp: Pos): [boolean, Pos | null] {
    const [hit, power] = l.hits_projectile(target.pos);
    const lang = 'fr';

    if (hit !== -1) {
      l.projectile2item(l.currentMapData, target.pos, hit);
      target.pv -= power;

      if (target.pv <= 0) {
        stateHolder.targets.splice(i, 1);
        return [ false, null ];
      }
    }

    if (target.pos.equals(heroPos)) {
      if (target.symbol === 'O') {
        // TODO: Check for teleports here??
        heroPos.x += dp.x;
        heroPos.y += dp.y;
      } else {
        l.gameOverMessage = translations.symbol2gameover.get(lang)!.get(target.symbol)!;
        return [ true, heroPos ];
      }
    }

    return [ true, null ];
  }
  update(l: Labyrinth, stateHolder: SpawnerState, heroPos: Pos): Pos {
    this.spawnerUpdate(stateHolder);

    for (let i = 0; i < stateHolder.targets.length;) {
      const target = stateHolder.targets[i];
      const dp = this.targetUpdate(target.symbol);

      // We need to make the test twice (see below).
      // This case is if the projectile hits directly
      // The case below is if the two are separated by 1:
      // the target gets at the same position as the projectile
      // -> It needs to count as a hit too
      let [cont, newPos] = this.inner_update(l, i, target, stateHolder, heroPos, dp);

      if (!cont) {
        continue;
      }

      if (newPos !== null) {
        return newPos;
      }

      target.pos.x += dp.x;
      target.pos.y += dp.y;

      if (target.pos.y >= consts.mapLines || target.pos.y < 0
        || target.pos.x < 0 || target.pos.x >= consts.charPerLine
        || l.get_symbol_at(target.pos) === '#') {
        stateHolder.targets.splice(i, 1);
        continue;
      }

      [cont, newPos] = this.inner_update(l, i, target, stateHolder, heroPos, dp);

      if (!cont) {
        continue;
      }

      if (newPos !== null) {
        return newPos;
      }

      i++;
    }

    return heroPos;
  }
}
