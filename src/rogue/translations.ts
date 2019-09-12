export const pris = new Map<string, Map<string, string>>([
  ['en', new Map<string, string>([ ['M', ' taken'] ]) ],
  ['fr', new Map<string, string>([
    ['M', ' pris'],
    ['F', ' prise'],
  ])],
]);

export const take = new Map<string, string>([
  ['en', '[5] Take '],
  ['fr', '[5] Prendre '],
]);

export const lancer = new Map<string, string>([
  ['en', 'Throw'],
  ['fr', 'Lancer'],
]);

export const lance = new Map<string, Map<string, string>>([
  ['en', new Map<string, string>([ ['M', ' thrown']])],
  ['fr', new Map<string, string>([
    ['M', ' lancé'],
    ['F', ' lancée'],
  ])],
]);

export const item2description = new Map<string, Map<string, any>>([
  ['en', new Map<string, any>([
    ['*', { text: 'rock', genre: 'M' }],
    ['/', { text: 'sword', genre: 'M' }],
    ['\\', { text: 'sword lvl.2', genre: 'M' }],
    ['=', { text: 'fire spell', genre: 'M' }],
    ['', { text: 'nothing', genre: 'M' }]
  ])],
  ['fr', new Map<string, any>([
    ['*', { text: 'caillou', genre: 'M' }],
    ['/', { text: 'épée', genre: 'F' }],
    ['\\', { text: 'épée lvl.2', genre: 'F' }],
    ['=', { text: 'sort de feu', genre: 'M' }],
    ['' , { text: 'rien', genre: 'M' }],
  ])],
]);

export const symbol2gameover = new Map<string, Map<string, string>>([
  ['en', new Map<string, string>([
    ['#', 'Crushed!'],
    ['~', 'Drown!'],
    ['v', 'Impaled!'],
    ['>', 'Impaled!'],
    ['<', 'Impaled!'],
    ['^', 'Impaled!'],
  ])],
  ['fr', new Map<string, string>([
    ['#', 'Écrasé!'],
    ['~', 'Noyé!'],
    ['v', 'Empalé!'],
    ['<', 'Empalé!'],
    ['>', 'Empalé!'],
    ['^', 'Empalé!'],
  ])]
]);

export const retry = new Map<string, string>([
  ['en', 'Space to retry'],
  ['fr', 'Espace pour réessayer'],
]);

export const new_game_tt = new Map<string, string>([
  ['en', 'New game'],
  ['fr', 'Nouvelle partie'],
]);

export const load = new Map<string, string>([
  ['en', 'Load'],
  ['fr', 'Charger'],
]);

export const save = new Map<string, string>([
  ['en', 'Save'],
  ['fr', 'Sauver'],
]);

export const exit = new Map<string, string>([
  ['en', 'Exit'],
  ['fr', 'Quitter'],
]);
