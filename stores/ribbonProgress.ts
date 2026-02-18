import { defineStore } from 'pinia';
import type { Pokemon, Ribbon, Game, PokemonDetail, MyPokemon } from '~/types';

const STORAGE_PREFIX = 'ribbon_progress_';

export const useRibbonProgressStore = defineStore('ribbonProgress', {
  state: () => ({
    /** 選択中のポケモン */
    selectedPokemon: null as Pokemon | null,
    /** 全リボンデータ */
    ribbons: [] as Ribbon[],
    /** 全ゲームデータ */
    games: [] as Game[],
    /** 全ポケモン一覧 */
    pokemonList: [] as PokemonDetail[],
    /** データ読み込み中フラグ */
    isLoading: false,
    /** エラーメッセージ */
    error: null as string | null,
    /** ポケモンIDごとの取得済みリボンIDセット: { [pokemonId]: Set<ribbonId> } */
    progress: {} as Record<string, string[]>,
    /** マイポケモン登録リスト */
    myPokemonList: [] as MyPokemon[],
    /** アクティブなマイポケモンID */
    activeMyPokemonId: null as string | null,
  }),

  getters: {
    /** 現在選択中のポケモンの取得済みリボンID一覧 */
    currentCheckedRibbons(state): string[] {
      if (state.activeMyPokemonId) {
        return state.progress[state.activeMyPokemonId] ?? [];
      }
      if (!state.selectedPokemon) return [];
      return state.progress[state.selectedPokemon.id] ?? [];
    },

    /** 現在選択中のポケモンの総合完了率 */
    totalCompletion(state): number {
      const key = state.activeMyPokemonId ?? state.selectedPokemon?.id;
      if (!key || state.ribbons.length === 0) return 0;
      const checked = state.progress[key]?.length ?? 0;
      return Math.round((checked / state.ribbons.length) * 100);
    },

    /** 選択中のポケモンの世代を取得 */
    selectedPokemonGeneration(state): number | null {
      if (!state.selectedPokemon) return null;
      const detail = state.pokemonList.find((p) => p.id === state.selectedPokemon?.id);
      return detail?.generation ?? null;
    },

    /** アクティブなマイポケモン */
    activeMyPokemon(state): MyPokemon | null {
      if (!state.activeMyPokemonId) return null;
      return state.myPokemonList.find((mp) => mp.id === state.activeMyPokemonId) ?? null;
    },
  },

  actions: {
    /** localStorage からポケモンの進捗を読み込む */
    loadProgress(pokemonId: string): void {
      try {
        const saved = localStorage.getItem(`${STORAGE_PREFIX}${pokemonId}`);
        this.progress[pokemonId] = saved ? (JSON.parse(saved) as string[]) : [];
      } catch {
        this.progress[pokemonId] = [];
      }
    },

    /** リボンの取得済み状態をトグル */
    toggleRibbon(pokemonId: string, ribbonId: string): void {
      const key = this.activeMyPokemonId ?? pokemonId;
      if (!this.progress[key]) {
        this.progress[key] = [];
      }
      const idx = this.progress[key].indexOf(ribbonId);
      if (idx === -1) {
        this.progress[key].push(ribbonId);
      } else {
        this.progress[key].splice(idx, 1);
      }
      this.saveProgress(key);
    },

    /** 進捗をリセット */
    clearProgress(pokemonId: string): void {
      const key = this.activeMyPokemonId ?? pokemonId;
      this.progress[key] = [];
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    },

    /** localStorage に保存 */
    saveProgress(pokemonId: string): void {
      try {
        localStorage.setItem(
          `${STORAGE_PREFIX}${pokemonId}`,
          JSON.stringify(this.progress[pokemonId])
        );
      } catch {
        console.error('進捗の保存に失敗しました');
      }
    },

    /** ポケモンを選択し進捗をロード */
    selectPokemon(pokemon: Pokemon): void {
      this.selectedPokemon = pokemon;
      this.activeMyPokemonId = null;
      this.loadProgress(pokemon.id);
    },

    /** リボンデータをセット */
    setRibbons(ribbons: Ribbon[]): void {
      this.ribbons = ribbons;
    },

    /** ゲームデータをセット */
    setGames(games: Game[]): void {
      this.games = games;
    },

    /** ポケモン一覧をセット */
    setPokemonList(list: PokemonDetail[]): void {
      this.pokemonList = list;
    },

    /** 全進捗データをJSON文字列としてエクスポート */
    exportProgress(): string {
      return JSON.stringify({
        progress: this.progress,
        myPokemonList: this.myPokemonList,
      });
    },

    /** JSON文字列から進捗データをインポート */
    importProgress(json: string): void {
      try {
        const raw = JSON.parse(json);
        // 新フォーマット: { progress, myPokemonList }
        if (raw && typeof raw === 'object' && 'progress' in raw) {
          const data = raw.progress as Record<string, string[]>;
          for (const [key, value] of Object.entries(data)) {
            if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
              throw new Error(`Invalid data for key: ${key}`);
            }
          }
          this.progress = data;
          for (const pokemonId of Object.keys(data)) {
            this.saveProgress(pokemonId);
          }
          // マイポケモンリストのインポート
          if (Array.isArray(raw.myPokemonList)) {
            this.myPokemonList = raw.myPokemonList as MyPokemon[];
            this.saveMyPokemonList();
          }
        } else {
          // 旧フォーマット: Record<string, string[]> 直接
          const data = raw as Record<string, string[]>;
          for (const [key, value] of Object.entries(data)) {
            if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
              throw new Error(`Invalid data for key: ${key}`);
            }
          }
          this.progress = data;
          for (const pokemonId of Object.keys(data)) {
            this.saveProgress(pokemonId);
          }
        }
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '進捗データの形式が不正です');
      }
    },

    /** マイポケモンリストを localStorage から読み込み */
    loadMyPokemonList(): void {
      try {
        const saved = localStorage.getItem('my_pokemon_list');
        this.myPokemonList = saved ? (JSON.parse(saved) as MyPokemon[]) : [];
      } catch {
        this.myPokemonList = [];
      }
    },

    /** マイポケモンリストを localStorage に保存 */
    saveMyPokemonList(): void {
      try {
        localStorage.setItem('my_pokemon_list', JSON.stringify(this.myPokemonList));
      } catch {
        console.error('マイポケモンリストの保存に失敗しました');
      }
    },

    /** マイポケモンを新規登録 */
    addMyPokemon(data: Omit<MyPokemon, 'id' | 'createdAt'>): MyPokemon {
      const newPokemon: MyPokemon = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      this.myPokemonList.push(newPokemon);
      this.saveMyPokemonList();
      return newPokemon;
    },

    /** マイポケモンを編集 */
    updateMyPokemon(id: string, data: Partial<Omit<MyPokemon, 'id' | 'createdAt'>>): void {
      const idx = this.myPokemonList.findIndex((mp) => mp.id === id);
      if (idx === -1) return;
      this.myPokemonList[idx] = { ...this.myPokemonList[idx], ...data };
      this.saveMyPokemonList();
    },

    /** マイポケモンを削除（関連 progress も削除） */
    removeMyPokemon(id: string): void {
      this.myPokemonList = this.myPokemonList.filter((mp) => mp.id !== id);
      // 関連する進捗データも削除
      const { [id]: _removed, ...rest } = this.progress;
      this.progress = rest;
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
      this.saveMyPokemonList();
      // アクティブだった場合はリセット
      if (this.activeMyPokemonId === id) {
        this.activeMyPokemonId = null;
      }
    },

    /** マイポケモンをアクティブに切り替え */
    switchMyPokemon(id: string): void {
      const mp = this.myPokemonList.find((m) => m.id === id);
      if (!mp) return;
      this.activeMyPokemonId = id;
      // pokemonList から対応する PokemonDetail を取得し、selectedPokemon を更新
      const detail = this.pokemonList.find((p) => p.id === mp.pokemonId);
      if (detail) {
        // toPokemon と同じ変換を行う（utils/pokemonMapper.ts 参照）
        this.selectedPokemon = {
          id: detail.id,
          number: String(detail.dexNumber).padStart(3, '0'),
          name: detail.name,
          imageUrl: detail.image,
          types: detail.types,
        };
      }
      this.loadProgress(id);
    },
  },
});
