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
      category: '特性',
      requirements: 'ダイヤモンド・パール・プラチナ・HG・SSで入手',
      image_url: '/ribbons/alert.png',
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
  ];
}
