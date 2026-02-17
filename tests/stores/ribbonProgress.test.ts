import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRibbonProgressStore } from '../../stores/ribbonProgress';
import type { Pokemon, Ribbon, Game, PokemonDetail } from '../../types/index';

// localStorage モック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      const { [key]: _, ...rest } = store;
      store = rest;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// テストデータ
const testPokemon: Pokemon = {
  id: 'pikachu',
  number: '025',
  name: 'ピカチュウ',
  types: ['でんき'],
};

const testPokemon2: Pokemon = {
  id: 'eevee',
  number: '133',
  name: 'イーブイ',
  types: ['ノーマル'],
};

const testRibbons: Ribbon[] = [
  {
    id: 'champion-hoenn',
    name: 'チャンピオンリボン（ホウエン）',
    description: 'test',
    generation: 3,
    games: ['ruby'],
    category: 'チャンピオン',
  },
  {
    id: 'effort',
    name: 'がんばリボン',
    description: 'test',
    generation: 3,
    games: ['ruby'],
    category: '思い出',
  },
  {
    id: 'alert',
    name: 'アラートリボン',
    description: 'test',
    generation: 4,
    games: ['diamond'],
    category: 'イベント',
  },
];

const testGames: Game[] = [
  {
    id: 'ruby',
    name: 'ポケットモンスター ルビー',
    shortName: 'ルビー',
    generation: 3,
    releaseDate: '2002-11-21',
    platform: 'GBA',
  },
];

const testPokemonDetail: PokemonDetail = {
  id: 'pikachu',
  dexNumber: 25,
  name: 'ピカチュウ',
  types: ['でんき'],
  generation: 1,
  image: 'https://example.com/pikachu.png',
  category: 'ねずみポケモン',
  height: 40,
  weight: 60,
  abilities: ['せいでんき', 'ひらいしん'],
};

describe('useRibbonProgressStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('selectedPokemon が null であること', () => {
      const store = useRibbonProgressStore();
      expect(store.selectedPokemon).toBeNull();
    });

    it('ribbons が空配列であること', () => {
      const store = useRibbonProgressStore();
      expect(store.ribbons).toHaveLength(0);
    });

    it('games が空配列であること', () => {
      const store = useRibbonProgressStore();
      expect(store.games).toHaveLength(0);
    });

    it('pokemonList が空配列であること', () => {
      const store = useRibbonProgressStore();
      expect(store.pokemonList).toHaveLength(0);
    });

    it('progress が空オブジェクトであること', () => {
      const store = useRibbonProgressStore();
      expect(store.progress).toEqual({});
    });
  });

  describe('selectPokemon', () => {
    it('選択したポケモンが selectedPokemon にセットされる', () => {
      const store = useRibbonProgressStore();
      store.selectPokemon(testPokemon);
      expect(store.selectedPokemon).toEqual(testPokemon);
    });

    it('選択時に localStorage から進捗が読み込まれる', () => {
      const store = useRibbonProgressStore();
      localStorageMock.setItem('ribbon_progress_pikachu', JSON.stringify(['champion-hoenn']));
      store.selectPokemon(testPokemon);
      expect(store.progress['pikachu']).toEqual(['champion-hoenn']);
    });

    it('localStorage に保存データがない場合は空配列になる', () => {
      const store = useRibbonProgressStore();
      store.selectPokemon(testPokemon);
      expect(store.progress['pikachu']).toEqual([]);
    });

    it('別のポケモンに切り替えると selectedPokemon が更新される', () => {
      const store = useRibbonProgressStore();
      store.selectPokemon(testPokemon);
      store.selectPokemon(testPokemon2);
      expect(store.selectedPokemon).toEqual(testPokemon2);
    });
  });

  describe('toggleRibbon', () => {
    it('未取得のリボンを追加できる', () => {
      const store = useRibbonProgressStore();
      store.toggleRibbon('pikachu', 'champion-hoenn');
      expect(store.progress['pikachu']).toContain('champion-hoenn');
    });

    it('2回トグルするとリボンが削除される', () => {
      const store = useRibbonProgressStore();
      store.toggleRibbon('pikachu', 'champion-hoenn');
      store.toggleRibbon('pikachu', 'champion-hoenn');
      expect(store.progress['pikachu']).not.toContain('champion-hoenn');
    });

    it('複数のリボンを追加できる', () => {
      const store = useRibbonProgressStore();
      store.toggleRibbon('pikachu', 'champion-hoenn');
      store.toggleRibbon('pikachu', 'effort');
      expect(store.progress['pikachu']).toContain('champion-hoenn');
      expect(store.progress['pikachu']).toContain('effort');
      expect(store.progress['pikachu']).toHaveLength(2);
    });

    it('トグル後に localStorage に保存される', () => {
      const store = useRibbonProgressStore();
      store.toggleRibbon('pikachu', 'champion-hoenn');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ribbon_progress_pikachu',
        JSON.stringify(['champion-hoenn'])
      );
    });
  });

  describe('clearProgress', () => {
    it('ポケモンの進捗がリセットされる', () => {
      const store = useRibbonProgressStore();
      store.toggleRibbon('pikachu', 'champion-hoenn');
      store.toggleRibbon('pikachu', 'effort');
      store.clearProgress('pikachu');
      expect(store.progress['pikachu']).toEqual([]);
    });

    it('localStorage からも削除される', () => {
      const store = useRibbonProgressStore();
      store.toggleRibbon('pikachu', 'champion-hoenn');
      store.clearProgress('pikachu');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ribbon_progress_pikachu');
    });

    it('他のポケモンの進捗には影響しない', () => {
      const store = useRibbonProgressStore();
      store.toggleRibbon('pikachu', 'champion-hoenn');
      store.toggleRibbon('eevee', 'effort');
      store.clearProgress('pikachu');
      expect(store.progress['eevee']).toContain('effort');
    });
  });

  describe('setRibbons', () => {
    it('リボン一覧をセットできる', () => {
      const store = useRibbonProgressStore();
      store.setRibbons(testRibbons);
      expect(store.ribbons).toEqual(testRibbons);
      expect(store.ribbons).toHaveLength(3);
    });

    it('空配列で上書きできる', () => {
      const store = useRibbonProgressStore();
      store.setRibbons(testRibbons);
      store.setRibbons([]);
      expect(store.ribbons).toHaveLength(0);
    });
  });

  describe('setGames', () => {
    it('ゲーム一覧をセットできる', () => {
      const store = useRibbonProgressStore();
      store.setGames(testGames);
      expect(store.games).toEqual(testGames);
      expect(store.games).toHaveLength(1);
    });
  });

  describe('setPokemonList', () => {
    it('ポケモン一覧をセットできる', () => {
      const store = useRibbonProgressStore();
      store.setPokemonList([testPokemonDetail]);
      expect(store.pokemonList).toEqual([testPokemonDetail]);
      expect(store.pokemonList).toHaveLength(1);
    });
  });

  describe('currentCheckedRibbons ゲッター', () => {
    it('ポケモン未選択の場合は空配列を返す', () => {
      const store = useRibbonProgressStore();
      expect(store.currentCheckedRibbons).toEqual([]);
    });

    it('選択中ポケモンの取得済みリボンIDを返す', () => {
      const store = useRibbonProgressStore();
      store.selectPokemon(testPokemon);
      store.toggleRibbon('pikachu', 'champion-hoenn');
      store.toggleRibbon('pikachu', 'effort');
      expect(store.currentCheckedRibbons).toContain('champion-hoenn');
      expect(store.currentCheckedRibbons).toContain('effort');
      expect(store.currentCheckedRibbons).toHaveLength(2);
    });

    it('選択中ポケモンが変わると対応する進捗を返す', () => {
      const store = useRibbonProgressStore();
      store.toggleRibbon('pikachu', 'champion-hoenn');
      store.toggleRibbon('eevee', 'effort');

      store.selectPokemon(testPokemon);
      expect(store.currentCheckedRibbons).toEqual(['champion-hoenn']);

      store.selectPokemon(testPokemon2);
      expect(store.currentCheckedRibbons).toEqual(['effort']);
    });
  });

  describe('totalCompletion ゲッター', () => {
    it('ポケモン未選択の場合は 0 を返す', () => {
      const store = useRibbonProgressStore();
      expect(store.totalCompletion).toBe(0);
    });

    it('リボンデータが空の場合は 0 を返す', () => {
      const store = useRibbonProgressStore();
      store.selectPokemon(testPokemon);
      expect(store.totalCompletion).toBe(0);
    });

    it('0% の場合 0 を返す', () => {
      const store = useRibbonProgressStore();
      store.setRibbons(testRibbons);
      store.selectPokemon(testPokemon);
      expect(store.totalCompletion).toBe(0);
    });

    it('取得数に応じた完了率を返す（3件中1件 = 33%）', () => {
      const store = useRibbonProgressStore();
      store.setRibbons(testRibbons);
      store.selectPokemon(testPokemon);
      store.toggleRibbon('pikachu', 'champion-hoenn');
      expect(store.totalCompletion).toBe(33);
    });

    it('取得数に応じた完了率を返す（3件中2件 = 67%）', () => {
      const store = useRibbonProgressStore();
      store.setRibbons(testRibbons);
      store.selectPokemon(testPokemon);
      store.toggleRibbon('pikachu', 'champion-hoenn');
      store.toggleRibbon('pikachu', 'effort');
      expect(store.totalCompletion).toBe(67);
    });

    it('全件取得で 100% を返す', () => {
      const store = useRibbonProgressStore();
      store.setRibbons(testRibbons);
      store.selectPokemon(testPokemon);
      store.toggleRibbon('pikachu', 'champion-hoenn');
      store.toggleRibbon('pikachu', 'effort');
      store.toggleRibbon('pikachu', 'alert');
      expect(store.totalCompletion).toBe(100);
    });
  });
});
