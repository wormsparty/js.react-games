import {Engine} from '../common/engine';
import {AllMaps} from './map_content';
import * as consts from './const';
import * as translations from './translations';
import {LevelMap, Pos, ObjPos, ProjPos, TeleportPos} from './map_logic';
import {item2color} from './const';
import {SpawnerState} from './target';

function make_first_letter_upper(str: string): string {
  return str.charAt(0).toUpperCase() + str.substr(1);
}

const charToCommand = new Map<string, Pos>([
  [ '7', new Pos(consts.charPerLine - 11, 0) ],
  [ '8', new Pos(consts.charPerLine - 8, 0) ],
  [ '9', new Pos(consts.charPerLine - 5, 0) ],
  [ '4', new Pos(consts.charPerLine - 11, 1) ],
  [ '5', new Pos(consts.charPerLine - 8, 1) ],
  [ '6', new Pos(consts.charPerLine - 5, 1) ],
  [ '1', new Pos(consts.charPerLine - 11, 2) ],
  [ '2', new Pos(consts.charPerLine - 8, 2) ],
  [ '3', new Pos(consts.charPerLine - 5, 2) ],
]);

const currencyFormatter = new Intl.NumberFormat('fr-CH', {
  style: 'decimal',
  minimumFractionDigits: 0,
});

class PersistedMapData {
  items: Map<string, Array<ObjPos>> = new Map<string, Array<ObjPos>>();
  projectiles: Array<ProjPos> = new Array<ProjPos>();
  spawner: SpawnerState | null = null;

  static parse(json: any): PersistedMapData | null {
    if (json === null) {
      return null;
    }

    const p = new PersistedMapData();

    p.items = new Map<string, Array<ObjPos>>();

    for (const item in json.items) {
      if (json.items.hasOwnProperty(item)) {
        const pss: Array<ObjPos> = [];
        const positions = json.items[item];

        for (const pos of positions) {
          pss.push(new ObjPos(pos.x, pos.y, pos.usage));
        }

        p.items.set(item, pss);
      }
    }

    p.projectiles = [];

    for (const proj of json.projectiles) {
      p.projectiles.push(new ProjPos(proj.x, proj.y, proj.vx, proj.vy, proj.symbol, proj.power));
    }

    p.spawner = SpawnerState.parse(json.spawner);
    return p;
  }
  print(): {} {
    const p: any = {
      items: {},
      projectiles: [],
      spawner: this.spawner!.print(),
    };

    for (const [item, positions] of this.items) {
      const pss: any = [];

      for (const pos of positions) {
        pss.push({
          x: pos.x,
          y: pos.y,
          usage: pos.usage,
        });
      }

      p.items[item] = pss;
    }

    for (const proj of this.projectiles) {
      p.projectiles.push({
        x: proj.x,
        y: proj.y,
        vx: proj.vx,
        vy: proj.vy,
        symbol: proj.symbol,
        power: proj.power,
      });
    }

    return p;
  }
  copy(): PersistedMapData {
    const cpy = new PersistedMapData();

    cpy.items = new Map<string, Array<ObjPos>>();

    for (const [item, positions] of this.items) {
      const pss: Array<ObjPos> = [];

      for (const p of positions) {
        pss.push(p.copy());
      }

      cpy.items.set(item, pss);
    }

    cpy.projectiles = [];

    for (const proj of this.projectiles) {
      cpy.projectiles.push(proj.copy());
    }

    if (this.spawner != null) {
      cpy.spawner = this.spawner.copy();
    }
    return cpy;
  }
}

class PersistedData {
  weapon: string = '';
  rocks: number = 0;
  coins: number = 0;
  heroPosition: Pos = new Pos(0, 0);
  mapData: Map<string, PersistedMapData> = new Map<string, PersistedMapData>();
  currentMapName: string = '';
  isRt: boolean = false;

  static parse(json: any): PersistedData | null {
    if (json === null) {
      return null;
    }

    if (json.heroPosition === undefined) {
      return null;
    }

    const p = new PersistedData();

    p.weapon = json.weapon;
    p.rocks = json.rocks;
    p.coins = json.coins;
    p.heroPosition = new Pos(json.heroPosition.x, json.heroPosition.y);
    p.mapData = new Map<string, PersistedMapData>();
    p.isRt = json.isRt;

    for (const map in json.mapData) {
      if (json.mapData.hasOwnProperty(map)) {
        var data = PersistedMapData.parse(json.mapData[map]);

        if (data != null) {
          p.mapData.set(map, data);
        }
      }
    }

    p.currentMapName = json.currentMapName;
    return p;
  }
  print(): {} {
    const p: any = {
      weapon: this.weapon,
      rocks: this.rocks,
      coins: this.coins,
      hero_position: {
        x: this.heroPosition.x,
        y: this.heroPosition.y
      },
      map_data: {},
      current_map_name: this.currentMapName,
      is_rt: this.isRt,
    };

    for (const [i, data] of this.mapData) {
      p.map_data[i] = data.print();
    }

    return p;
  }
  copy(): PersistedData {
    const cpy = new PersistedData();

    cpy.weapon = this.weapon;
    cpy.rocks = this.rocks;
    cpy.coins = this.coins;
    cpy.heroPosition = this.heroPosition.copy();
    cpy.isRt = this.isRt;

    cpy.mapData = new Map<string, PersistedMapData>();

    for (const [name, data] of this.mapData) {
      cpy.mapData.set(name, data.copy());
    }

    cpy.currentMapName = this.currentMapName;
    return cpy;
  }
}

export class Labyrinth {
  public pressed: Map<string, boolean>;
  private readonly engine: Engine;
  readonly charWidth: number;
  private currentStatus: string;
  private isThrowing: boolean;
  private isMenuOpen: boolean;
  private isMainMenu: boolean;
  private menuPosition: number = 0;
  private mainMenu: Array<any> = new Array<any>();
  private gameMenu: Array<any> = new Array<any>();

  gameOverMessage: string;
  lastSave: PersistedData | null = null;
  persistedData: PersistedData = new PersistedData();
  initialPersistedData: PersistedData | null = null;
  fps: number;

  currentMap: LevelMap | null = null;
  currentMapData: PersistedMapData = new PersistedMapData();

  static load_save(l: Labyrinth, save: PersistedData) {
    l.persistedData = save;

    l.isMainMenu = false;
    l.isMenuOpen = false;

    if (l.persistedData != null) {
      l.change_map(l.persistedData.currentMapName, false);
    }

    l.isMenuOpen = false;
    l.save_to_memory();
  }
  static load_from_storage(l: Labyrinth): void {
    var data = Labyrinth.get_from_storage();

    if (data != null) {
      Labyrinth.load_save(l, data);
    }
  }
  static save_to_storage(l: Labyrinth): void {
    if (l.persistedData != null) {
      const saveData = JSON.stringify(l.persistedData.print());
      window.localStorage.setItem('save', saveData);
    }

    l.isMenuOpen = false;
  }
  static clear_storage() {
    window.localStorage.clear();
  }
  static get_from_storage(): PersistedData | null {
    const saveData = window.localStorage.getItem('save');

    if (saveData === null) {
      return null;
    }

    const persistedData = PersistedData.parse(JSON.parse(saveData));

    if (persistedData === null) {
      return null;
    }

    return persistedData;
  }
  static open_main_menu(l: Labyrinth) {
    l.refresh_menu(true);
    l.isMainMenu = true;
  }
  static clear_and_start_tt(l: Labyrinth): void {
    if (l.initialPersistedData != null) {
      const newSave = l.initialPersistedData.copy();
      newSave.isRt = false;
      Labyrinth.load_save(l, newSave);
    }
  }
  static clear_and_start_rt(l: Labyrinth): void {
    if (l.initialPersistedData != null) {
      const newSave = l.initialPersistedData.copy();
      newSave.isRt = true;
      Labyrinth.load_save(l, newSave);
    }
  }
  parse_all_maps(): void {
    this.initialPersistedData = new PersistedData();
    this.initialPersistedData.mapData = new Map<string, PersistedMapData>();

    for (const [key, map] of AllMaps) {
      map.parse(key);

      const mapData = new PersistedMapData();
      mapData.items = new Map<string, Array<ObjPos>>();
      mapData.projectiles = [];
      mapData.spawner = new SpawnerState([], 0);

      for (const [item, positions] of map.initialItemPositions) {
        const itemPositions: Array<ObjPos> = [];

        for (const pos of positions) {
          itemPositions.push(pos.copy());
        }

        mapData.items.set(item, itemPositions);
      }

      this.initialPersistedData.mapData.set(key, mapData);
    }

    // Default values for production
    const initialMap = 'bateau';
    this.initialPersistedData.coins = 0;
    this.initialPersistedData.weapon = '';
    this.initialPersistedData.rocks = 0;

    // TODO: Remove, here are debugging values
  //  initialMap = 'hit_sword';
//    this.initialPersistedData.weapon = '\\';
   // this.initialPersistedData.rocks = 0;
    // TODO: END

    this.initialPersistedData.currentMapName = initialMap;
    this.initialPersistedData.heroPosition = AllMaps.get(initialMap)!.start;
  }
  draw(): void {
    if (this.isMainMenu) {
      this.engine.clear(consts.DefaultBackgroundColor);
      this.draw_main_menu();
    } else {
      if (this.currentMap != null) {
        this.engine.clear(this.currentMap.backgroundColor);
      }

      this.draw_all();
    }
  }
  do_update(): void {
    if (this.isMenuOpen || this.isMainMenu) {
      this.update_menu();
    } else {
      this.update_on_map();
    }
  }
  get_string_from(x: number, y: number, length: number): string {
    if (this.currentMap != null) {
      return this.currentMap.map.substr(y * (consts.charPerLine + 1) + x, length);
    }

    return '';
  }
  to_screen_coord(x: number, y: number, dx = 0, dy = 0): Pos {
    return new Pos(this.charWidth * x + dx, 16 * y + dy);
  }
  update_current_status(heroPos: Pos): void {
    let statusSet = false;
    let currentStatus = this.currentStatus;
    const lang = 'fr';

    if (this.currentMapData == null) {
      return;
    }

    for (const [item, positions] of this.currentMapData.items) {
      for (let i = 0 ; i < positions.length; i++) {
        if (positions[i].equals(heroPos)) {
          if (item === '$') {
            this.persistedData.coins++;
            positions.splice(i, 1);
            currentStatus = '> 1 $' + translations.pris.get(lang)!.get('M');
          } else {
            const description = translations.item2description.get(lang)!.get(item)!;
            currentStatus = translations.take.get(lang) + description.text;

            if (positions[i].usage > 1) {
              currentStatus += ' (x' + positions[i].usage + ')';
            }
          }

          statusSet = true;
          break;
        }
      }

      if (statusSet) {
        break;
      }
    }

    if (!statusSet) {
      this.currentStatus = '';
    } else {
      this.currentStatus = currentStatus;
    }

    if (this.persistedData.currentMapName === 'treasure') {
      this.currentStatus = '> Merci d\'avoir joué!';
      return;
    }
  }
  drop_current_slot_item_at(pos: Pos, symbol: string, usage: number) {
    // Drop item on the ground if any
    if (symbol !== '') {
      if (!this.currentMapData.items.has(symbol)) {
        this.currentMapData.items.set(symbol, []);
      }

      this.currentMapData.items.get(symbol)!.push(new ObjPos(pos.x, pos.y, usage));
    }
  }
  try_pick_or_drop_item(heroPos: Pos): boolean {
    const lang = 'fr';

    if (this.pressed.get('5')) {
      let itemPicked = false;
      let currentStatus = this.currentStatus;

      for (const [item, positions] of this.currentMapData.items) {
        const description = translations.item2description.get(lang)!.get(item)!;

        for (let i = 0 ; i < positions.length; i++) {
          if (positions[i].equals(heroPos)) {
            if (consts.weaponItems.indexOf(item) > -1) {
              if (this.persistedData.weapon !== '') {
                this.drop_current_slot_item_at(positions[i], this.persistedData.weapon, -1);
              }

              this.persistedData.weapon = item;
            } else if (consts.throwableItems.indexOf(item) > -1) {
              this.persistedData.rocks++;
            }

            const upper = make_first_letter_upper(description.text);
            currentStatus = '> ' + upper;

            if (positions[i].usage > 1) {
              currentStatus += ' (x' + positions[i].usage + ')';
            }

            currentStatus += translations.pris.get(lang)!.get(description.genre)!;
            positions.splice(i, 1);

            itemPicked = true;
            break;
          }
        }

        if (itemPicked) {
          break;
        }
      }

      if (!itemPicked) {
        this.currentStatus = '';
      } else {
        this.currentStatus = currentStatus;
      }

      return true;
    }

    return false;
  }
  try_enter_or_exit(heroPos: TeleportPos): [boolean, Pos | null, string] {
    const symbol = this.get_symbol_at(heroPos);

    if (symbol !== '>' && symbol !== '<') {
      return [false, null, ''];
    }

    return this.do_teleport(symbol, heroPos, heroPos, heroPos);
  }
  move_hero(heroPos: Pos, walkablePos: Pos, aimPos: Pos): [Pos, boolean] {
    const ret = this.try_teleport(heroPos, walkablePos);

    if (ret[0]) {
      this.change_map(ret[2], true);
      heroPos = ret[1];
      this.persistedData.heroPosition = ret[1];
      return [heroPos, true];
    } else {
      const [evt] = this.try_hit_target(heroPos, aimPos);

      if (evt === '') {
        heroPos = walkablePos;
        this.update_current_status(heroPos);
      } else if (evt === 'hit') {
        // this.currentStatus = translations.hit[lang][symbol];
      }

      return [heroPos, false];
    }

  }
  collides_with_obstacle(heroPos: Pos): boolean {
    if (this.currentMap.obstacleVisible === undefined) {
      return false;
    }

    for (const [chr, positions] of this.currentMap.obstacles) {
      if (this.currentMap.obstacleVisible(this, chr)) {
        for (const pos of positions) {
          if (heroPos.equals(pos)) {
            return true;
          }
        }
      }
    }

    return false;
  }
  // We get:
  // (1) The walkable future position,
  // (2) The real future direction (for aiming) and
  // (3) the new status, if we hit something
  get_future_position(heroPos: Pos): [Pos, Pos, string] {
    let x = heroPos.x;
    let y = heroPos.y;

    if (this.pressed.get('1') || this.pressed.get('2') || this.pressed.get('3')) {
      y++;
    }

    if (this.pressed.get('7') || this.pressed.get('8') || this.pressed.get('9')) {
      y--;
    }

    if (this.pressed.get('1') || this.pressed.get('4') || this.pressed.get('7')) {
      x--;
    }

    if (this.pressed.get('3') || this.pressed.get('6') || this.pressed.get('9')) {
      x++;
    }

    const futurePos: Pos = new Pos(x, y);
    const allowedWalkingSymbols = consts.walkableSymbols;

    let symbol = this.get_symbol_at(futurePos);

    if (allowedWalkingSymbols.indexOf(symbol) > -1) {
      return [futurePos, futurePos, ''];
    }

    if (heroPos.y !== futurePos.y) {
      symbol = this.currentMap.get_symbol_at(heroPos.x, futurePos.y);

      if (allowedWalkingSymbols.indexOf(symbol) > -1) {
        return [new Pos(heroPos.x, futurePos.y), futurePos, ''];
      } else {
        if (futurePos.x !== heroPos.x) {
          symbol = this.currentMap.get_symbol_at(futurePos.x, heroPos.y);
        }

        if (allowedWalkingSymbols.indexOf(symbol) > -1) {
          return [new Pos(futurePos.x, heroPos.y), futurePos, ''];
        } else {
          return [heroPos, futurePos, ''];
        }
      }
    } else {
      symbol = this.currentMap.get_symbol_at(futurePos.x, heroPos.y);

      if (allowedWalkingSymbols.indexOf(symbol) > -1) {
        return [new Pos(futurePos.x, heroPos.y), futurePos, ''];
      } else {
        return [ heroPos, futurePos, '' ];
      }
    }
  }
  change_map(mapName: string, resetTargets: boolean): void {
    this.currentMap = AllMaps.get(mapName)!;
    this.persistedData.currentMapName = mapName;
    this.currentMapData = this.persistedData.mapData.get(mapName)!;

    if (resetTargets) {
      this.currentMapData.spawner.reset();
    }
  }
  save_to_memory(): void {
    this.lastSave = this.persistedData.copy();
  }
  load_last_save() {
    this.persistedData = this.lastSave.copy();
    this.change_map(this.persistedData.currentMapName, false);
  }
  try_teleport(heroPos: Pos, futurePos: Pos): [boolean, Pos | undefined, string | undefined] {
    for (const [chr, teleportsForChar] of this.currentMap.teleports) {
      if (chr === '<' || chr === '>') { // These are treated separately
        continue;
      }

      for (const pos of teleportsForChar) {
        if (pos.equals(futurePos)) {
          return this.do_teleport(chr, pos, heroPos, futurePos);
        }
      }
    }

    return [
      false,
      undefined,
      undefined,
    ];
  }
  do_teleport(chr: string, pos: TeleportPos, heroPos: Pos, futurePos: Pos): [boolean, Pos, string] {
    const newMapName = this.currentMap.teleportMap.get(chr)!;
    const newMap = AllMaps.get(newMapName)!;
    let teleportsOfOtherMap;
    let id;

    if (chr === '>') {
      teleportsOfOtherMap = newMap.teleports.get('<')!;
      id = 0;
    } else if (chr === '<') {
      teleportsOfOtherMap = newMap.teleports.get('>')!;
      id = 0;
    } else {
      teleportsOfOtherMap = newMap.teleports.get(chr)!;
      id = pos.id;
    }

    const tp = teleportsOfOtherMap[id];

    let newX = tp.x + (futurePos.x - heroPos.x);
    let newY = tp.y + (futurePos.y - heroPos.y);

    // Fix the case where teleport + mouvement ends up in a wall!
    if (newMap.get_symbol_at(newX, newY) === '#') {
      if (newMap.get_symbol_at(tp.x, newY) === '#') {
        newY = tp.y;
      } else {
        newX = tp.x;
      }
    }

    return [
      true,
      new Pos(newX, newY),
      newMapName,
    ];
  }
  try_hit_target(heroPos: Pos, aimPos: Pos): [string, string] {
    if (this.currentMap.targetSpawner === null) {
      return [ '', '' ];
    }

    const targets = this.currentMapData.spawner.targets;

    for (let i = 0; i < targets.length;) {
      const target = targets[i];

      if (target.pos.equals(aimPos)) {
        const dmg = this.get_weapon_damage();

        if (target.symbol === 'O' && dmg !== 0) {
          target.pv -= dmg;

          if (target.pv <= 0) {
            targets.splice(i, 1);
            return [ 'hit', target.symbol ];
          } else {
            return [ 'push', target.symbol ];
          }
        } else {
          return [ 'push', target.symbol ];
        }
      }

      i++;
    }

    return [ '', '' ];
  }
  update_targets(heroPos: Pos): Pos {
    if (this.currentMap.targetSpawner !== undefined) {
      return this.currentMap.targetSpawner.update(this, this.currentMapData.spawner, heroPos);
    }

    return heroPos;
  }
  move_projectiles() {
    for (let i = 0; i < this.currentMapData.projectiles.length;) {
      const proj = this.currentMapData.projectiles[i];

      const newprojx = proj.x + proj.vx;
      const newprojy = proj.y + proj.vy;

      // If we go outside of the room, teleport the item to it!
      if (newprojy >= consts.mapLines || newprojy < 0
        || newprojx < 0 || newprojx >= consts.charPerLine)  {
        const [canTeleport, where, mapName] = this.try_teleport(proj, proj);

        if (canTeleport) {
          const mapData = this.persistedData.mapData.get(mapName);
          this.projectile2item(mapData, new Pos(where.x + proj.vx, where.y + proj.vy), i);
          continue;
        }
      }

      // If we hit a wall or water in the same room
      const symbol = this.currentMap.get_symbol_at(newprojx, newprojy);

      if (consts.walkableSymbols.indexOf(symbol) === -1) {
        this.projectile2item(this.currentMapData, proj, i);
        continue;
      }

      proj.x = newprojx;
      proj.y = newprojy;

      i++;
    }
  }
  move_targets_or_die(heroPos: Pos) {
    heroPos = this.update_targets(heroPos);
    const lang = this.personalInfo.lang;
    const symbol = this.get_symbol_at(heroPos);

    if (consts.walkableSymbols.indexOf(symbol) === -1) {
      this.gameOverMessage = translations.symbol2gameover[lang][symbol];
    } else {
      this.persistedData.heroPosition = heroPos;
    }

  }
  update_menu() {
    let currentMenu: Array<any>;

    if (this.isMainMenu) {
      currentMenu = this.mainMenu;
    } else {
      currentMenu = this.gameMenu;
    }

    if (this.pressed.get('8')) {
      let newP = this.menuPosition;

      if (newP > 0) {
        do {
          newP--;
        }
        while (newP !== -1 && !currentMenu[newP][2]);
      }

      if (newP !== -1) {
        this.menuPosition = newP;
      }
    }

    if (this.pressed.get('2')) {
      let newP = this.menuPosition;

      if (newP < currentMenu.length) {
        do {
          newP++;
        }
        while (newP !== currentMenu.length && !currentMenu[newP][2]);
      }

      if (newP !== currentMenu.length) {
        this.menuPosition = newP;
      }
    }

    if (this.pressed.get('5')) {
      currentMenu[this.menuPosition][1](this);
    }

    if (!this.isMainMenu && this.pressed.get('Escape')) {
      this.isMenuOpen = false;
    }
  }
  update_on_map() {
    if (this.gameOverMessage !== '') {
      if (this.pressed.get(' ')) {
        this.gameOverMessage = '';
        this.load_last_save();
      }

      return;
    }

    if (this.pressed.get('+')) {
      this.fps++;
    }

    if (this.pressed.get('-')) {
      this.fps--;
    }

    if (this.pressed.get('Shift') && this.persistedData.rocks > 0) {
      this.isThrowing = !this.isThrowing;
      return;
    }

    if (this.pressed.get('Escape')) {
      this.isMenuOpen = true;
      this.menuPosition = 0;
      this.refresh_menu(false); // This is to update the availability of Load()
      return;
    }

    const futurePos = this.get_future_position(this.persistedData.heroPosition);
    const lang = this.personalInfo.lang;

    const ret = this.try_enter_or_exit(futurePos[0]);

    if (ret !== undefined) {
      if (ret[0]) {
        this.change_map(ret[2], true);
        this.persistedData.heroPosition = ret[1];
        this.save_to_memory();
        return;
      }
    }

    if (this.try_pick_or_drop_item(this.persistedData.heroPosition)) {
      this.move_projectiles();
      this.move_targets_or_die(this.persistedData.heroPosition);
      return;
    }

    if (this.isThrowing) {
      if (this.persistedData.rocks > 0) {
        const item = translations.item2description[lang]['*'];

        this.currentStatus = '> ' + make_first_letter_upper(item.text + translations.lance[lang][item.genre]);

        // TODO: REFACTOR
        const x = this.persistedData.heroPosition.x;
        const y = this.persistedData.heroPosition.y;
        const vx = futurePos[1].x - x;
        const vy = futurePos[1].y - y;

        if (vx !== 0 || vy !== 0) {
          this.currentMapData.projectiles.push(new ProjPos(x, y, vx, vy, '*', 1));
          this.persistedData.rocks--;

          this.isThrowing = false;
          this.move_projectiles();
          this.move_targets_or_die(this.persistedData.heroPosition);
        }

        return;
      }
    }

    if (futurePos[2] !== '') {
      this.currentStatus = futurePos[2];
      this.move_projectiles();
      this.move_targets_or_die(this.persistedData.heroPosition);
      return;
    }

    if (this.collides_with_obstacle(futurePos[0])) {
      return;
    }

    const [newPos, mapChanged] = this.move_hero(this.persistedData.heroPosition, futurePos[0], futurePos[1]);
    this.persistedData.heroPosition = newPos;

    if (!mapChanged) {
      this.move_projectiles();
    }

    this.move_targets_or_die(this.persistedData.heroPosition);

    if (mapChanged && this.gameOverMessage === '') {
      this.save_to_memory();
    }
  }
  draw_map() {
    for (let y = 0; y < consts.mapLines; y++) {
      for (let x = 0; x < consts.charPerLine;) {
        let length = 0;
        const val = this.currentMap.get_symbol_at(x, y);

        if (val === ' ' || val === '\n' || val === undefined) {
          x++;
          continue;
        }

        while (true) {
          length++;

          const chr = this.currentMap.get_symbol_at(x + length, y);

          if (chr !== val) {
            break;
          }
        }

        const coord = this.to_screen_coord(x, y + consts.headerSize);
        const str = this.get_string_from(x, y, length);
        let color;

        if (this.currentMap.tile2color !== undefined) {
          color = this.currentMap.tile2color.get(val);
        }

        if (color === undefined) {
          color = consts.globalTile2color[val];
        }

        if (color === undefined) {
          color = this.currentMap.textColor;
        }

        this.engine.rect(coord, str.length * this.charWidth, 16, this.currentMap.backgroundColor);
        this.engine.text(str, coord, color);
        x += length;
      }
    }

    if (this.currentMap.texts !== undefined) {
      const lang = this.personalInfo.lang;
      const texts = this.currentMap.texts[lang];

      for (const key in texts) {
        if (texts.hasOwnProperty(key)) {
          const pos = texts[key];
          this.engine.text(key, this.to_screen_coord(pos.x, pos.y), this.currentMap.textColor);
        }
      }
    }
  }
  draw_projectiles() {
    for (const proj of this.currentMapData.projectiles) {
      const coord = this.to_screen_coord(proj.x, proj.y + consts.headerSize);

      this.engine.rect(coord, this.charWidth, 16, this.currentMap.backgroundColor);
      this.engine.text(proj.symbol, coord, consts.projectile2color[proj.symbol]);
    }
  }
  draw_targets() {
    if (this.currentMap.targetSpawner !== undefined) {
      for (const target of this.currentMapData.spawner.targets) {
        const coord = this.to_screen_coord(target.pos.x, target.pos.y + consts.headerSize);

        this.engine.rect(coord, this.charWidth, 16, this.currentMap.backgroundColor);
        this.engine.text(target.symbol, coord, this.currentMap.targetSpawner.pv2color(target.pv));
      }
    }
  }
  draw_obstacles() {
    if (this.currentMap.obstacleVisible === undefined) {
      return false;
    }

    for (const [ chr, positions ] of this.currentMap.obstacles) {
      if (this.currentMap.obstacleVisible(this, chr)) {
        for (const pos of positions) {
          const coord = this.to_screen_coord(pos.x, pos.y + consts.headerSize);
          this.engine.rect(coord, this.charWidth, 16, this.currentMap.backgroundColor);
          this.engine.text(chr, coord, this.currentMap.obstacleColor);
        }
      }
    }
  }
  draw_character(chr: string, coord: Pos, color: string) {
    this.engine.rect(coord, this.charWidth, 16, this.currentMap.backgroundColor);
    this.engine.text(chr, coord, color);
  }
  draw_hero() {
    this.draw_character('@',
      this.to_screen_coord(this.persistedData.heroPosition.x, this.persistedData.heroPosition.y + consts.headerSize),
      consts.pnj2color['@']);
  }
  draw_items() {
    for (const [item, positions] of this.currentMapData.items) {

      for (const pos of positions) {
        const coord = this.to_screen_coord(pos.x, pos.y + consts.headerSize);
        const color = consts.item2color[item];

        this.engine.rect(coord, this.charWidth, 16, this.currentMap.backgroundColor);
        this.engine.text(item, coord, color);
      }
    }
  }
  get_weapon_damage() {
    return consts.weapon2damage.get(this.persistedData.weapon)!;
  }
  get_symbol_at(pos: Pos): string {
    return this.currentMap.get_symbol_at(pos.x, pos.y);
  }
  hits_projectile(pos: Pos): [number, number] {
    for (let i = 0; i < this.currentMapData.projectiles.length; i++) {
      const proj = this.currentMapData.projectiles[i];

      if (proj.equals(pos)) {
        return [i, proj.power];
      }
    }

    return [-1, 0];
  }
  projectile2item(mapData: PersistedMapData, where: Pos, projectilePosition: number) {
    const proj = this.currentMapData.projectiles[projectilePosition];

    if (!mapData.items.has(proj.symbol)) {
      mapData.items.set(proj.symbol, []);
    }

    const items = mapData.items.get(proj.symbol);
    let foundItem = false;

    for (const item of items) {
      if (item.equals(proj)) {
        item.usage++;
        foundItem = true;
        break;
      }
    }

    if (!foundItem) {
      items.push(new ObjPos(where.x, where.y, 1));
    }

    this.currentMapData.projectiles.splice(projectilePosition, 1);
  }
  draw_overlay() {
    const lang = 'fr';

    this.engine.text(this.currentStatus, this.to_screen_coord(2, 1), consts.White);

    const speed = 'FPS: ' + this.fps;

    const money = currencyFormatter.format(this.persistedData.coins) + ' $';
    this.engine.text(money, this.to_screen_coord(consts.charPerLine - money.length - 7, 1), item2color.$);
    this.engine.text('[esc]', this.to_screen_coord(consts.charPerLine - 6, 1), consts.OverlayNormal);

    if (this.persistedData.isRt) {
      this.engine.text(speed, this.to_screen_coord(consts.charPerLine - speed.length, 0), consts.OverlayNormal);
    }

    const h = consts.mapLines + consts.headerSize + 1;

    for (const [chr, pos] of charToCommand) {
      if (this.isThrowing) {
        this.engine.text(chr, this.to_screen_coord(pos.x, pos.y + h), consts.OverlaySelected);
      } else if (this.pressed.get(chr)) {
        this.engine.text(chr, this.to_screen_coord(pos.x, pos.y + h), consts.OverlayHighlight);
      } else {
        this.engine.text(chr, this.to_screen_coord(pos.x, pos.y + h), consts.OverlayNormal);
      }
    }

    if (this.persistedData.weapon !== '') {
      this.engine.text('- ' +
        make_first_letter_upper(translations.item2description[lang][this.persistedData.weapon].text),
        this.to_screen_coord(3, h), consts.OverlayHighlight);
    }

    if (this.persistedData.rocks !== 0) {
      this.engine.text('- ' +
        make_first_letter_upper(translations.item2description[lang]['*'].text) + ' (x' + this.persistedData.rocks + ')',
        this.to_screen_coord(3, h + 1), consts.OverlayHighlight);
    }

    if (this.persistedData.rocks > 0) {
      const txt = '⇧ ' + translations.lancer[lang];

      if (this.isThrowing) {
        this.engine.text(txt, this.to_screen_coord(29, h + 1, -2), consts.OverlaySelected);
      } else {
        this.engine.text(txt, this.to_screen_coord(29, h + 1, -2), consts.OverlayHighlight);
      }
    }
  }
  draw_message(): void {
    if (this.gameOverMessage !== '') {
      const lang = 'fr';
      const retry = translations.retry.get(lang)!;

      this.engine.rect(this.to_screen_coord(consts.charPerLine / 2 - 15, 10),
        30 * this.charWidth, 16 * 7, this.currentMap.backgroundColor);
      this.engine.text(' **************************** ',
        this.to_screen_coord(consts.charPerLine / 2 - 15, 10), consts.OverlayHighlight);

      for (let i = 11; i < 16; i++) {
        this.engine.text('*                            *',
           this.to_screen_coord(consts.charPerLine / 2 - 15, i), consts.OverlayHighlight);
      }

      this.engine.text(' **************************** ',
        this.to_screen_coord(consts.charPerLine / 2 - 15, 16), consts.OverlayHighlight);

      this.engine.text(this.gameOverMessage,
        this.to_screen_coord(consts.charPerLine / 2 - this.gameOverMessage.length / 2, 12), consts.OverlayHighlight);
      this.engine.text(retry, this.to_screen_coord(consts.charPerLine / 2 - retry.length / 2, 14), consts.OverlayHighlight);
    }
  }
  draw_main_menu(): void {
    let i = 0;

    for (const [text, , enabled] of this.mainMenu) {
      let txt: string;
      let x = consts.charPerLine / 2 - 18;
      let color: string;

      if (this.menuPosition === i) {
        txt = '> ' + text;
      } else {
        txt = text;
        x += 2;
      }

      if (enabled) {
        color = consts.OverlayHighlight;
      } else {
        color = consts.OverlayNormal;
      }

      this.engine.text(txt, this.to_screen_coord(x, 12 + i), color);
      i++;
    }
  }
  draw_menu(): void {
    if (this.isMenuOpen) {
      let i;

      this.engine.rect(this.to_screen_coord(consts.charPerLine / 2 - 15, 10),
        30 * this.charWidth, 16 * 7, this.currentMap.backgroundColor);
      this.engine.text(' **************************** ',
        this.to_screen_coord(consts.charPerLine / 2 - 15, 10), consts.OverlayHighlight);

      for (i = 11; i < 16; i++) {
        this.engine.text('*                            *',
          this.to_screen_coord(consts.charPerLine / 2 - 15, i), consts.OverlayHighlight);
      }

      this.engine.text(' **************************** ',
        this.to_screen_coord(consts.charPerLine / 2 - 15, 16), consts.OverlayHighlight);

      i = 0;

      for (const [text, func, enabled] of this.gameMenu) {
        let txt: string;
        let x = consts.charPerLine / 2 - 5;
        let color: string;

        if (this.menuPosition === i) {
          txt = '> ' + text;
        } else {
          txt = text;
          x += 2;
        }

        if (enabled) {
          color = consts.OverlayHighlight;
        } else {
          color = consts.OverlayNormal;
        }

        this.engine.text(txt, this.to_screen_coord(x, 12 + i), color);
        i++;
      }
    }
  }
  draw_all(): void {
    this.draw_map();
    this.draw_items();
    this.draw_hero();
    this.draw_projectiles();
    this.draw_targets();
    this.draw_obstacles();
    this.draw_overlay();
    this.draw_message();
    this.draw_menu();
  }
  resize(width: number, height: number): void {
    this.engine.resize(width, height);
    this.draw();
  }
  refresh_menu(resetPosition: boolean): void {
    let save = Labyrinth.get_from_storage();
    const lang = 'fr';

    // Throw away incompatible saves :)
    if (save !== null && save.isRt === undefined) {
      save = null;
    }

    this.mainMenu = [
      [ translations.new_game_tt.get(lang), (l: Labyrinth) => Labyrinth.clear_and_start_tt(l), true ],
      [ translations.new_game_rt.get(lang), (l: Labyrinth) => Labyrinth.clear_and_start_rt(l), true ],
      [ translations.load.get(lang), (l: Labyrinth) => Labyrinth.load_save(l, save), save !== null ],
      // [ translations.lang[lang], (l: Labyrinth) => Labyrinth.toggle_language(l), true ],
    ];

    this.gameMenu = [
      [ translations.save.get(lang), (l: Labyrinth) => Labyrinth.save_to_storage(l), true ],
      [ translations.load.get(lang), (l: Labyrinth) => Labyrinth.load_from_storage(l), save !== null ],
      [ translations.exit.get(lang), (l: Labyrinth) => Labyrinth.open_main_menu(l), true],
    ];

    if (resetPosition) {
      if (this.mainMenu[1][2]) {
        this.menuPosition = 2;
      } else {
        this.menuPosition = 0;
      }
    }
  }
  constructor() {
    this.engine = new Engine(
      'canvas',
      460,
      480,
      16,
      'Inconsolata, monospace',
      false,
      0);

    this.pressed = new Map([
      [ '1', false ],
      [ '2', false ],
      [ '3', false ],
      [ '4', false ],
      [ '5', false ],
      [ '6', false ],
      [ '7', false ],
      [ '8', false ],
      [ '9', false ],
      [ ' ', false ],
      [ 'Shift', false ],
      [ 'Escape', false ],
      [ '+', false],
      [ '-', false],
    ]);

    this.currentStatus = '';
    this.charWidth = this.engine.get_char_width();
    this.isThrowing = false;
    this.gameOverMessage = '';
    this.isMenuOpen = false;
    this.isMainMenu = true;
    this.fps = 6;

    this.parse_all_maps();
    this.refresh_menu(true);
  }
}
