// ゲームタイトル定義データ
// 旧: utils/dataFetcher.ts の getDummyGames() から移行 + Gen 3 不足分を追加

import type { Game } from '~/types';

export const GAMES: Game[] = [
  // Gen 3 (GBA)
  { id: 'ruby', name: 'ポケットモンスター ルビー', shortName: 'ルビー', generation: 3, releaseDate: '2002-11-21', platform: 'GBA' },
  { id: 'sapphire', name: 'ポケットモンスター サファイア', shortName: 'サファイア', generation: 3, releaseDate: '2002-11-21', platform: 'GBA' },
  { id: 'emerald', name: 'ポケットモンスター エメラルド', shortName: 'エメラルド', generation: 3, releaseDate: '2004-09-16', platform: 'GBA' },
  { id: 'firered', name: 'ポケモン ファイアレッド', shortName: 'FR', generation: 3, releaseDate: '2004-01-29', platform: 'GBA' },
  { id: 'leafgreen', name: 'ポケモン リーフグリーン', shortName: 'LG', generation: 3, releaseDate: '2004-01-29', platform: 'GBA' },

  // Gen 3 (GCN)
  { id: 'colosseum', name: 'ポケモンコロシアム', shortName: 'コロシアム', generation: 3, releaseDate: '2003-11-21', platform: 'GCN' },
  { id: 'xd', name: 'ポケモンXD 闇の旋風ダークルギア', shortName: 'XD', generation: 3, releaseDate: '2005-08-04', platform: 'GCN' },

  // Gen 4 (DS)
  { id: 'diamond', name: 'ポケットモンスター ダイヤモンド', shortName: 'ダイヤモンド', generation: 4, releaseDate: '2006-09-28', platform: 'DS' },
  { id: 'pearl', name: 'ポケットモンスター パール', shortName: 'パール', generation: 4, releaseDate: '2006-09-28', platform: 'DS' },
  { id: 'platinum', name: 'ポケットモンスター プラチナ', shortName: 'プラチナ', generation: 4, releaseDate: '2008-09-13', platform: 'DS' },
  { id: 'heartgold', name: 'ポケットモンスター ハートゴールド', shortName: 'ハートゴールド', generation: 4, releaseDate: '2009-09-12', platform: 'DS' },
  { id: 'soulsilver', name: 'ポケットモンスター ソウルシルバー', shortName: 'ソウルシルバー', generation: 4, releaseDate: '2009-09-12', platform: 'DS' },

  // Gen 5 (DS)
  { id: 'black', name: 'ポケットモンスター ブラック', shortName: 'ブラック', generation: 5, releaseDate: '2010-09-18', platform: 'DS' },
  { id: 'white', name: 'ポケットモンスター ホワイト', shortName: 'ホワイト', generation: 5, releaseDate: '2010-09-18', platform: 'DS' },
  { id: 'black2', name: 'ポケットモンスター ブラック2', shortName: 'ブラック2', generation: 5, releaseDate: '2012-06-23', platform: 'DS' },
  { id: 'white2', name: 'ポケットモンスター ホワイト2', shortName: 'ホワイト2', generation: 5, releaseDate: '2012-06-23', platform: 'DS' },

  // Gen 6 (3DS)
  { id: 'x', name: 'ポケットモンスター X', shortName: 'X', generation: 6, releaseDate: '2013-10-12', platform: '3DS' },
  { id: 'y', name: 'ポケットモンスター Y', shortName: 'Y', generation: 6, releaseDate: '2013-10-12', platform: '3DS' },
  { id: 'oras', name: 'ポケットモンスター オメガルビー・アルファサファイア', shortName: 'ORAS', generation: 6, releaseDate: '2014-11-21', platform: '3DS' },

  // Gen 7 (3DS / Switch)
  { id: 'sun', name: 'ポケットモンスター サン', shortName: 'サン', generation: 7, releaseDate: '2016-11-18', platform: '3DS' },
  { id: 'moon', name: 'ポケットモンスター ムーン', shortName: 'ムーン', generation: 7, releaseDate: '2016-11-18', platform: '3DS' },
  { id: 'usum', name: 'ポケットモンスター ウルトラサン・ウルトラムーン', shortName: 'USUM', generation: 7, releaseDate: '2017-11-17', platform: '3DS' },
  { id: 'lets_go', name: "ポケットモンスター Let's Go! ピカチュウ・イーブイ", shortName: 'レッツゴー', generation: 7, releaseDate: '2018-11-16', platform: 'Switch' },

  // Gen 8 (Switch)
  { id: 'sword', name: 'ポケットモンスター ソード', shortName: 'ソード', generation: 8, releaseDate: '2019-11-15', platform: 'Switch' },
  { id: 'shield', name: 'ポケットモンスター シールド', shortName: 'シールド', generation: 8, releaseDate: '2019-11-15', platform: 'Switch' },

  // Gen 8 (Switch) - Legends
  { id: 'legends_arceus', name: 'Pokémon LEGENDS アルセウス', shortName: 'LA', generation: 8, releaseDate: '2022-01-28', platform: 'Switch' },

  // Gen 9 (Switch)
  { id: 'scarlet', name: 'ポケットモンスター スカーレット', shortName: 'SV', generation: 9, releaseDate: '2022-11-18', platform: 'Switch' },
  { id: 'violet', name: 'ポケットモンスター バイオレット', shortName: 'バイオレット', generation: 9, releaseDate: '2022-11-18', platform: 'Switch' },
];
