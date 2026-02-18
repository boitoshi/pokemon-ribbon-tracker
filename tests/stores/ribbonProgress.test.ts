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

  describe('マイポケモン管理', () => {
    beforeEach(() => {
      vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' });
    });

    it('addMyPokemon で新規マイポケモンを登録できる', () => {
      const store = useRibbonProgressStore();
      const result = store.addMyPokemon({
        pokemonId: 'pikachu',
        nickname: 'ピカ',
        originGame: 'red',
        memo: 'テスト',
      });

      expect(store.myPokemonList).toHaveLength(1);
      expect(result.id).toBe('test-uuid');
      expect(result.createdAt).toBeTruthy();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'my_pokemon_list',
        JSON.stringify(store.myPokemonList)
      );
    });

    it('updateMyPokemon でマイポケモンを編集できる', () => {
      const store = useRibbonProgressStore();
      const added = store.addMyPokemon({
        pokemonId: 'pikachu',
        nickname: 'ピカ',
        originGame: 'red',
        memo: 'テスト',
      });

      store.updateMyPokemon(added.id, { nickname: '新しい名前' });

      expect(store.myPokemonList[0].nickname).toBe('新しい名前');
      expect(store.myPokemonList[0].memo).toBe('テスト');
      expect(store.myPokemonList[0].originGame).toBe('red');
    });

    it('removeMyPokemon でマイポケモンを削除できる', () => {
      const store = useRibbonProgressStore();
      const added = store.addMyPokemon({
        pokemonId: 'pikachu',
        nickname: 'ピカ',
        originGame: 'red',
        memo: 'テスト',
      });
      store.toggleRibbon(added.id, 'champion-hoenn');

      store.removeMyPokemon(added.id);

      expect(store.myPokemonList).toHaveLength(0);
      expect(store.progress[added.id]).toBeUndefined();
    });

    it('removeMyPokemon でアクティブなマイポケモンを削除するとリセットされる', () => {
      const store = useRibbonProgressStore();
      store.setPokemonList([testPokemonDetail]);
      const added = store.addMyPokemon({
        pokemonId: 'pikachu',
        nickname: 'ピカ',
        originGame: 'red',
        memo: 'テスト',
      });

      store.switchMyPokemon(added.id);
      expect(store.activeMyPokemonId).toBe(added.id);

      store.removeMyPokemon(added.id);
      expect(store.activeMyPokemonId).toBeNull();
    });

    it('switchMyPokemon でアクティブポケモンを切り替えられる', () => {
      const store = useRibbonProgressStore();
      store.setPokemonList([testPokemonDetail]);
      const added = store.addMyPokemon({
        pokemonId: 'pikachu',
        nickname: 'ピカ',
        originGame: 'red',
        memo: 'テスト',
      });

      store.switchMyPokemon(added.id);

      expect(store.activeMyPokemonId).toBe(added.id);
      expect(store.selectedPokemon).not.toBeNull();
      expect(store.selectedPokemon?.id).toBe('pikachu');
    });

    it('activeMyPokemonId がある場合 currentCheckedRibbons はマイポケモンの進捗を返す', () => {
      const store = useRibbonProgressStore();
      store.setPokemonList([testPokemonDetail]);
      const added = store.addMyPokemon({
        pokemonId: 'pikachu',
        nickname: 'ピカ',
        originGame: 'red',
        memo: 'テスト',
      });

      store.switchMyPokemon(added.id);
      store.toggleRibbon('dummy', 'ribbon1');

      expect(store.currentCheckedRibbons).toContain('ribbon1');
      expect(store.progress[added.id]).toContain('ribbon1');
    });

    it('selectPokemon すると activeMyPokemonId がリセットされる', () => {
      const store = useRibbonProgressStore();
      store.setPokemonList([testPokemonDetail]);
      const added = store.addMyPokemon({
        pokemonId: 'pikachu',
        nickname: 'ピカ',
        originGame: 'red',
        memo: 'テスト',
      });

      store.switchMyPokemon(added.id);
      expect(store.activeMyPokemonId).toBe(added.id);

      store.selectPokemon(testPokemon);
      expect(store.activeMyPokemonId).toBeNull();
    });

    it('loadMyPokemonList で localStorage から読み込める', () => {
      const store = useRibbonProgressStore();
      const savedList: MyPokemon[] = [
        {
          id: 'saved-uuid',
          pokemonId: 'pikachu',
          nickname: '保存済みピカチュウ',
          originGame: 'red',
          memo: '保存テスト',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ];
      localStorageMock.setItem('my_pokemon_list', JSON.stringify(savedList));

      store.loadMyPokemonList();

      expect(store.myPokemonList).toHaveLength(1);
      expect(store.myPokemonList[0].nickname).toBe('保存済みピカチュウ');
      expect(store.myPokemonList[0].id).toBe('saved-uuid');
    });
  });

  describe('エクスポート/インポート（マイポケモン対応）', () => {
    beforeEach(() => {
      vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' });
    });

    it('exportProgress がマイポケモンリストを含む', () => {
      const store = useRibbonProgressStore();
      store.addMyPokemon({
        pokemonId: 'pikachu',
        nickname: 'ピカ',
        originGame: 'red',
        memo: 'テスト',
      });

      const exported = JSON.parse(store.exportProgress());

      expect(exported).toHaveProperty('progress');
      expect(exported).toHaveProperty('myPokemonList');
      expect(exported.myPokemonList).toHaveLength(1);
      expect(exported.myPokemonList[0].nickname).toBe('ピカ');
    });

    it('importProgress で新フォーマット（progress + myPokemonList）を読み込める', () => {
      const store = useRibbonProgressStore();
      const newFormat = {
        progress: { pikachu: ['champion-hoenn', 'effort'] },
        myPokemonList: [
          {
            id: 'imported-uuid',
            pokemonId: 'pikachu',
            nickname: 'インポートピカ',
            originGame: 'red',
            memo: 'インポートテスト',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      };

      store.importProgress(JSON.stringify(newFormat));

      expect(store.progress['pikachu']).toEqual(['champion-hoenn', 'effort']);
      expect(store.myPokemonList).toHaveLength(1);
      expect(store.myPokemonList[0].nickname).toBe('インポートピカ');
    });

    it('importProgress で旧フォーマット（Record<string, string[]>）も読み込める', () => {
      const store = useRibbonProgressStore();
      store.addMyPokemon({
        pokemonId: 'eevee',
        nickname: 'イーブイ',
        originGame: 'red',
        memo: 'テスト',
      });
      const beforeMyPokemonList = [...store.myPokemonList];

      const oldFormat: Record<string, string[]> = {
        pikachu: ['champion-hoenn'],
        eevee: ['effort'],
      };

      store.importProgress(JSON.stringify(oldFormat));

      expect(store.progress['pikachu']).toEqual(['champion-hoenn']);
      expect(store.progress['eevee']).toEqual(['effort']);
      expect(store.myPokemonList).toEqual(beforeMyPokemonList);
    });
  });
});
