/** ゲームID → 日本語名の対応表 */
export const GAME_NAMES: Record<string, string> = {
  ruby: 'ルビー',
  sapphire: 'サファイア',
  emerald: 'エメラルド',
  firered: 'ファイアレッド',
  leafgreen: 'リーフグリーン',
  colosseum: 'コロシアム',
  xd: 'XD',
  diamond: 'ダイヤモンド',
  pearl: 'パール',
  platinum: 'プラチナ',
  heartgold: 'ハートゴールド',
  soulsilver: 'ソウルシルバー',
  black: 'ブラック',
  white: 'ホワイト',
  black2: 'ブラック2',
  white2: 'ホワイト2',
  x: 'X',
  y: 'Y',
  oras: 'オメガルビー・アルファサファイア',
  sun: 'サン',
  moon: 'ムーン',
  usum: 'ウルトラサン・ウルトラムーン',
  lets_go: 'レッツゴー',
  sword: 'ソード',
  shield: 'シールド',
};

/** ゲームIDから日本語名を取得する */
export const getGameName = (gameId: string): string => GAME_NAMES[gameId] ?? gameId;
