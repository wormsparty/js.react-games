export const charPerLine = 56;
export const mapLines = 22;
export const headerSize = 3;

export const DefaultBackgroundColor = '#000000';
export const DefaultTextColor =  '#FFFF00';
export const White = '#FFFFFF';
export const OverlayNormal =  '#555555';
export const OverlayHighlight =  '#FFFFFF';
export const OverlaySelected =  '#FF00FF';

/*
 * Map
 */
export const globalTile2color = {
  '#': '#646464',
  '.': '#646464',
  '~': '#C8C8C8',
};

export const teleportSymbols: Array<string> = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '>', '<' ];
export const itemSymbols: Array<string> = [ '*', '$', '/', '\\' ];
export const walkableSymbols: Array<string> = [ '.', '<', '>' ];
export const obstacleSymbols: Array<string> = [ 'x' ];

/*
 * PNJ
 */
export const pnj2color = {
  t: '#6699FF',
  '@': '#FF0000',
};

/*
 * Items
 */
export const item2color = {
  $: '#FFFF00',
  '=': '#FF0000',
  '*': '#dd99FF',
  '%': '#119900',
  '/': '#999999',
  '\\': '#FFFFFF',
};

export const weaponItems = [ '/', '\\' ];
export const throwableItems = [ '*' ];

export const projectile2color = {
  '*': '#999999',
  '&': '#FF0000',
};

export const weapon2damage = {
  '/': 1,
  '\\': 3,
  '': 0,
};
