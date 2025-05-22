import { ref, Ref } from 'vue';

// GitHub リポジトリのURL
const REPO_URL = 'https://raw.githubusercontent.com/boitoshi/pokemon-data/main';

/**
 * 外部リポジトリからポケモンデータを取得するための関数
 */
export const usePokemonData = () => {
  const pokemonList: Ref<any[]> = ref([]);
  const ribbonList: Ref<any[]> = ref([]);
  const gameList: Ref<any[]> = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * ポケモンデータを取得
   */
  const fetchPokemonList = async () => {
    if (pokemonList.value.length > 0) return pokemonList.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // GitHubから直接JSONファイルを取得
      const response = await fetch(`${REPO_URL}/pokemon.json`);
      if (!response.ok) {
        throw new Error('ポケモンデータの取得に失敗しました');
      }
      const data = await response.json();
      pokemonList.value = data;
      return data;
    } catch (err: any) {
      console.error('ポケモンデータ取得エラー:', err);
      error.value = err.message || '不明なエラーが発生しました';
      
      // エラー時はダミーデータを返す（開発用）
      return getDummyPokemon();
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * リボンデータを取得
   */
  const fetchRibbonList = async () => {
    if (ribbonList.value.length > 0) return ribbonList.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${REPO_URL}/ribbons.json`);
      if (!response.ok) {
        throw new Error('リボンデータの取得に失敗しました');
      }
      const data = await response.json();
      ribbonList.value = data;
      return data;
    } catch (err: any) {
      console.error('リボンデータ取得エラー:', err);
      error.value = err.message || '不明なエラーが発生しました';
      
      // エラー時はダミーデータを返す（開発用）
      return getDummyRibbons();
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * ゲームデータを取得
   */
  const fetchGameList = async () => {
    if (gameList.value.length > 0) return gameList.value;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${REPO_URL}/games.json`);
      if (!response.ok) {
        throw new Error('ゲームデータの取得に失敗しました');
      }
      const data = await response.json();
      gameList.value = data;
      return data;
    } catch (err: any) {
      console.error('ゲームデータ取得エラー:', err);
      error.value = err.message || '不明なエラーが発生しました';
      
      // エラー時はダミーデータを返す（開発用）
      return getDummyGames();
    } finally {
      isLoading.value = false;
    }
  };

  // 開発用のダミーポケモンデータ
  const getDummyPokemon = () => {
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
      }
    ];
  };

  // 開発用のダミーリボンデータ
  const getDummyRibbons = () => {
    return [
      {
        id: 'champion-hoenn',
        name: 'チャンピオンリボン（ホウエン）',
        description: 'ホウエン地方のポケモンリーグで優勝した証',
        generation: 3,
        games: ['ruby', 'sapphire', 'emerald'],
        category: 'チャンピオン',
        image_url: '/ribbons/champion-hoenn.png',
      },
      {
        id: 'contest-master-cute',
        name: 'コンテストマスターリボン（かわいさ）',
        description: 'かわいさコンテストのマスターランクで優勝した証',
        generation: 3,
        games: ['ruby', 'sapphire', 'emerald'],
        category: 'コンテスト',
        image_url: '/ribbons/contest-master-cute.png',
      },
      {
        id: 'alert',
        name: 'アラートリボン',
        description: '常に周囲に注意を払っている証',
        generation: 4,
        games: ['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'],
        category: '特性',
        image_url: '/ribbons/alert.png',
      }
    ];
  };

  // 開発用のダミーゲームデータ
  const getDummyGames = () => {
    return [
      {
        id: 'ruby',
        name: 'ポケットモンスター ルビー',
        shortName: 'ルビー',
        generation: 3,
        releaseDate: '2002-11-21',
        platform: 'GBA'
      },
      {
        id: 'sapphire',
        name: 'ポケットモンスター サファイア',
        shortName: 'サファイア',
        generation: 3,
        releaseDate: '2002-11-21',
        platform: 'GBA'
      },
      {
        id: 'emerald',
        name: 'ポケットモンスター エメラルド',
        shortName: 'エメラルド',
        generation: 3,
        releaseDate: '2004-09-16',
        platform: 'GBA'
      },
      {
        id: 'diamond',
        name: 'ポケットモンスター ダイヤモンド',
        shortName: 'ダイヤモンド',
        generation: 4,
        releaseDate: '2006-09-28',
        platform: 'DS'
      },
      {
        id: 'pearl',
        name: 'ポケットモンスター パール',
        shortName: 'パール',
        generation: 4,
        releaseDate: '2006-09-28',
        platform: 'DS'
      }
    ];
  };

  return {
    pokemonList,
    ribbonList,
    gameList,
    isLoading,
    error,
    fetchPokemonList,
    fetchRibbonList,
    fetchGameList
  };
};
