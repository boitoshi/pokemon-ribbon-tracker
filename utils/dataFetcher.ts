import { ref } from 'vue';
import type { PokemonDetail, Ribbon, Game } from '~/types';

const REPO_URL = 'https://raw.githubusercontent.com/boitoshi/pokemon-data/main';

const isLoading = ref(false);
const error = ref<string | null>(null);

/** JSON フェッチの共通ラッパー */
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  return response.json() as Promise<T>;
}

/** ポケモン一覧を取得（失敗時はダミーデータ） */
async function fetchPokemonList(): Promise<PokemonDetail[]> {
  try {
    return await fetchJson<PokemonDetail[]>(`${REPO_URL}/pokemon.json`);
  } catch (err) {
    console.warn('ポケモンデータ取得に失敗しました。ダミーデータを使用します。', err);
    return getDummyPokemon();
  }
}

/** リボン一覧を取得（失敗時はダミーデータ） */
async function fetchRibbonList(): Promise<Ribbon[]> {
  try {
    return await fetchJson<Ribbon[]>(`${REPO_URL}/ribbons.json`);
  } catch (err) {
    console.warn('リボンデータ取得に失敗しました。ダミーデータを使用します。', err);
    return getDummyRibbons();
  }
}

/** ゲーム一覧を取得（失敗時はダミーデータ） */
async function fetchGameList(): Promise<Game[]> {
  try {
    return await fetchJson<Game[]>(`${REPO_URL}/games.json`);
  } catch (err) {
    console.warn('ゲームデータ取得に失敗しました。ダミーデータを使用します。', err);
    return getDummyGames();
  }
}

/**
 * 全データを並列で取得して store にセットするコンポーザブル。
 * isLoading / error はモジュールスコープで共有するため競合しない。
 */
export const usePokemonData = () => {
  const loadAll = async (): Promise<{
    pokemonData: PokemonDetail[];
    ribbonData: Ribbon[];
    gameData: Game[];
  }> => {
    isLoading.value = true;
    error.value = null;
    try {
      const [pokemonData, ribbonData, gameData] = await Promise.all([
        fetchPokemonList(),
        fetchRibbonList(),
        fetchGameList(),
      ]);
      return { pokemonData, ribbonData, gameData };
    } catch (err) {
      error.value = err instanceof Error ? err.message : '不明なエラーが発生しました';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, loadAll };
};

// ---- ダミーデータ ----

function getDummyPokemon(): PokemonDetail[] {
  return [
    {
      id: 'pikachu',
      dexNumber: 25,
      name: 'ピカチュウ',
      types: ['でんき'],
      generation: 1,
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      category: 'ねずみポケモン',
      height: 40,
      weight: 60,
      abilities: ['せいでんき', 'ひらいしん'],
    },
    {
      id: 'eevee',
      dexNumber: 133,
      name: 'イーブイ',
      types: ['ノーマル'],
      generation: 1,
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',
      category: 'しんかポケモン',
      height: 30,
      weight: 65,
      abilities: ['にげあし', 'てきおうりょく'],
    },
    {
      id: 'absol',
      dexNumber: 359,
      name: 'アブソル',
      types: ['あく'],
      generation: 3,
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/359.png',
      category: 'わざわいポケモン',
      height: 120,
      weight: 470,
      abilities: ['プレッシャー', 'きょううん'],
    },
  ];
}

function getDummyRibbons(): Ribbon[] {
  return [
    {
      id: 'champion-hoenn',
      name: 'チャンピオンリボン（ホウエン）',
      description: 'ホウエン地方のポケモンリーグで優勝した証',
      generation: 3,
      games: ['ruby', 'sapphire', 'emerald'],
      category: 'チャンピオン',
      requirements: 'ホウエンリーグを制覇する',
      image_url: '/ribbons/champion-hoenn.png',
    },
    {
      id: 'contest-master-cute',
      name: 'コンテストマスターリボン（かわいさ）',
      description: 'かわいさコンテストのマスターランクで優勝した証',
      generation: 3,
      games: ['ruby', 'sapphire', 'emerald'],
      category: 'コンテスト',
      requirements: 'かわいさコンテストをマスターランクで優勝する',
      image_url: '/ribbons/contest-master-cute.png',
    },
    {
      id: 'alert',
      name: 'アラートリボン',
      description: '常に周囲に注意を払っている証',
      generation: 4,
      games: ['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'],
      category: 'イベント',
      requirements: 'ダイヤモンド・パール・プラチナ・HG・SSで入手',
      image_url: '/ribbons/alert.png',
    },
    {
      id: 'champion-sinnoh',
      name: 'チャンピオンリボン（シンオウ）',
      description: 'シンオウ地方のポケモンリーグで優勝した証',
      generation: 4,
      games: ['diamond', 'pearl', 'platinum'],
      category: 'チャンピオン',
      requirements: 'シンオウリーグを制覇する',
    },
    {
      id: 'champion-unova',
      name: 'チャンピオンリボン（イッシュ）',
      description: 'イッシュ地方のポケモンリーグで優勝した証',
      generation: 5,
      games: ['black', 'white', 'black2', 'white2'],
      category: 'チャンピオン',
      requirements: 'イッシュリーグを制覇する',
    },
    {
      id: 'champion-kalos',
      name: 'チャンピオンリボン（カロス）',
      description: 'カロス地方のポケモンリーグで優勝した証',
      generation: 6,
      games: ['x', 'y'],
      category: 'チャンピオン',
      requirements: 'カロスリーグを制覇する',
    },
    {
      id: 'champion-alola',
      name: 'チャンピオンリボン（アローラ）',
      description: 'アローラ地方の初代チャンピオンになった証',
      generation: 7,
      games: ['sun', 'moon', 'usum'],
      category: 'チャンピオン',
      requirements: 'アローラリーグを制覇する',
    },
    {
      id: 'champion-galar',
      name: 'チャンピオンリボン（ガラル）',
      description: 'ガラル地方のチャンピオンカップを制覇した証',
      generation: 8,
      games: ['sword', 'shield'],
      category: 'チャンピオン',
      requirements: 'ガラルチャンピオンカップを制覇する',
    },
    {
      id: 'contest-master-cool',
      name: 'コンテストマスターリボン（かっこよさ）',
      description: 'かっこよさコンテストのマスターランクで優勝した証',
      generation: 3,
      games: ['ruby', 'sapphire', 'emerald'],
      category: 'コンテスト',
      requirements: 'かっこよさコンテストをマスターランクで優勝する',
    },
    {
      id: 'contest-master-beauty',
      name: 'コンテストマスターリボン（うつくしさ）',
      description: 'うつくしさコンテストのマスターランクで優勝した証',
      generation: 3,
      games: ['ruby', 'sapphire', 'emerald'],
      category: 'コンテスト',
      requirements: 'うつくしさコンテストをマスターランクで優勝する',
    },
    {
      id: 'contest-master-smart',
      name: 'コンテストマスターリボン（かしこさ）',
      description: 'かしこさコンテストのマスターランクで優勝した証',
      generation: 3,
      games: ['ruby', 'sapphire', 'emerald'],
      category: 'コンテスト',
      requirements: 'かしこさコンテストをマスターランクで優勝する',
    },
    {
      id: 'contest-master-tough',
      name: 'コンテストマスターリボン（たくましさ）',
      description: 'たくましさコンテストのマスターランクで優勝した証',
      generation: 3,
      games: ['ruby', 'sapphire', 'emerald'],
      category: 'コンテスト',
      requirements: 'たくましさコンテストをマスターランクで優勝する',
    },
    {
      id: 'battle-tower',
      name: 'バトルタワーリボン',
      description: 'バトルタワーで一定の連勝を達成した証',
      generation: 3,
      games: ['ruby', 'sapphire', 'emerald'],
      category: 'バトル施設',
      requirements: 'バトルタワーで56連勝する',
    },
    {
      id: 'effort',
      name: 'がんばリボン',
      description: '努力値を最大まで振った証',
      generation: 3,
      games: ['ruby', 'sapphire', 'emerald', 'diamond', 'pearl', 'platinum'],
      category: '思い出',
      requirements: '努力値を最大（510）にする',
    },
    {
      id: 'best-friends',
      name: 'なかよしリボン',
      description: 'なかよし度が最大になった証',
      generation: 8,
      games: ['sword', 'shield'],
      category: '思い出',
      requirements: 'なかよし度を最大にする',
    },
    {
      id: 'footprint',
      name: 'あしあとリボン',
      description: 'なつき度が最大になった証',
      generation: 4,
      games: ['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'],
      category: '思い出',
      requirements: 'なつき度を最大にし足跡博士に話しかける',
    },
    {
      id: 'shock',
      name: 'ショックリボン',
      description: 'リボンシンジケートで入手できるリボン',
      generation: 4,
      games: ['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'],
      category: 'イベント',
      requirements: '火曜日にリボンシンジケートを訪問する',
    },
  ];
}

function getDummyGames(): Game[] {
  return [
    { id: 'ruby', name: 'ポケットモンスター ルビー', shortName: 'ルビー', generation: 3, releaseDate: '2002-11-21', platform: 'GBA' },
    { id: 'sapphire', name: 'ポケットモンスター サファイア', shortName: 'サファイア', generation: 3, releaseDate: '2002-11-21', platform: 'GBA' },
    { id: 'emerald', name: 'ポケットモンスター エメラルド', shortName: 'エメラルド', generation: 3, releaseDate: '2004-09-16', platform: 'GBA' },
    { id: 'diamond', name: 'ポケットモンスター ダイヤモンド', shortName: 'ダイヤモンド', generation: 4, releaseDate: '2006-09-28', platform: 'DS' },
    { id: 'pearl', name: 'ポケットモンスター パール', shortName: 'パール', generation: 4, releaseDate: '2006-09-28', platform: 'DS' },
    { id: 'platinum', name: 'ポケットモンスター プラチナ', shortName: 'プラチナ', generation: 4, releaseDate: '2008-09-13', platform: 'DS' },
    { id: 'heartgold', name: 'ポケットモンスター ハートゴールド', shortName: 'ハートゴールド', generation: 4, releaseDate: '2009-09-12', platform: 'DS' },
    { id: 'soulsilver', name: 'ポケットモンスター ソウルシルバー', shortName: 'ソウルシルバー', generation: 4, releaseDate: '2009-09-12', platform: 'DS' },
    { id: 'black', name: 'ポケットモンスター ブラック', shortName: 'ブラック', generation: 5, releaseDate: '2010-09-18', platform: 'DS' },
    { id: 'white', name: 'ポケットモンスター ホワイト', shortName: 'ホワイト', generation: 5, releaseDate: '2010-09-18', platform: 'DS' },
    { id: 'black2', name: 'ポケットモンスター ブラック2', shortName: 'ブラック2', generation: 5, releaseDate: '2012-06-23', platform: 'DS' },
    { id: 'white2', name: 'ポケットモンスター ホワイト2', shortName: 'ホワイト2', generation: 5, releaseDate: '2012-06-23', platform: 'DS' },
    { id: 'x', name: 'ポケットモンスター X', shortName: 'X', generation: 6, releaseDate: '2013-10-12', platform: '3DS' },
    { id: 'y', name: 'ポケットモンスター Y', shortName: 'Y', generation: 6, releaseDate: '2013-10-12', platform: '3DS' },
    { id: 'oras', name: 'ポケットモンスター オメガルビー・アルファサファイア', shortName: 'ORAS', generation: 6, releaseDate: '2014-11-21', platform: '3DS' },
    { id: 'sun', name: 'ポケットモンスター サン', shortName: 'サン', generation: 7, releaseDate: '2016-11-18', platform: '3DS' },
    { id: 'moon', name: 'ポケットモンスター ムーン', shortName: 'ムーン', generation: 7, releaseDate: '2016-11-18', platform: '3DS' },
    { id: 'usum', name: 'ポケットモンスター ウルトラサン・ウルトラムーン', shortName: 'USUM', generation: 7, releaseDate: '2017-11-17', platform: '3DS' },
    { id: 'lets_go', name: 'ポケットモンスター Let\'s Go! ピカチュウ・イーブイ', shortName: 'レッツゴー', generation: 7, releaseDate: '2018-11-16', platform: 'Switch' },
    { id: 'sword', name: 'ポケットモンスター ソード', shortName: 'ソード', generation: 8, releaseDate: '2019-11-15', platform: 'Switch' },
    { id: 'shield', name: 'ポケットモンスター シールド', shortName: 'シールド', generation: 8, releaseDate: '2019-11-15', platform: 'Switch' },
  ];
}
