import { defineStore } from 'pinia';
import type { Pokemon, Ribbon, Game, PokemonDetail, MyPokemon, ExportData } from '~/types';

const STORAGE_PREFIX = 'ribbon_progress_';
const MY_POKEMON_STORAGE_KEY = 'my_pokemon_list';

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
    /** 登録したマイポケモン一覧 */
    myPokemonList: [] as MyPokemon[],
    /** 現在アクティブなマイポケモンID */
    activeMyPokemonId: null as string | null,
  }),

  getters: {
    /** 進捗管理に使うキー（マイポケモンID or ポケモンID） */
    currentProgressKey(state): string | null {
      if (state.activeMyPokemonId) return state.activeMyPokemonId;
      return state.selectedPokemon?.id ?? null;
    },

    /** 現在選択中のポケモンの取得済みリボンID一覧 */
    currentCheckedRibbons(): string[] {
      const key = this.currentProgressKey;
      if (!key) return [];
      return this.$state.progress[key] ?? [];
    },

    /** 現在選択中のポケモンの総合完了率 */
    totalCompletion(): number {
      const key = this.currentProgressKey;
      if (!key || this.ribbons.length === 0) return 0;
      const checked = this.$state.progress[key]?.length ?? 0;
      return Math.round((checked / this.ribbons.length) * 100);
    },

    /** 現在アクティブなマイポケモンを取得 */
    activeMyPokemon(state): MyPokemon | null {
      if (!state.activeMyPokemonId) return null;
      return state.myPokemonList.find((p) => p.id === state.activeMyPokemonId) ?? null;
    },

    /** 選択中のポケモンの世代を取得 */
    selectedPokemonGeneration(state): number | null {
      if (!state.selectedPokemon) return null;
      const detail = state.pokemonList.find((p) => p.id === state.selectedPokemon?.id);
      return detail?.generation ?? null;
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
      if (!this.progress[pokemonId]) {
        this.progress[pokemonId] = [];
      }
      const idx = this.progress[pokemonId].indexOf(ribbonId);
      if (idx === -1) {
        this.progress[pokemonId].push(ribbonId);
      } else {
        this.progress[pokemonId].splice(idx, 1);
      }
      this.saveProgress(pokemonId);
    },

    /** 進捗をリセット */
    clearProgress(pokemonId: string): void {
      this.progress[pokemonId] = [];
      localStorage.removeItem(`${STORAGE_PREFIX}${pokemonId}`);
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

    /** マイポケモンを登録 */
    registerMyPokemon(
      pokemonId: string,
      nickname: string,
      originGame: string,
      memo: string
    ): MyPokemon {
      const myPokemon: MyPokemon = {
        id: `my_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        pokemonId,
        nickname,
        originGame,
        memo,
        createdAt: new Date().toISOString(),
      };
      this.myPokemonList.push(myPokemon);
      this.progress[myPokemon.id] = [];
      this.saveMyPokemonList();
      return myPokemon;
    },

    /** マイポケモンを更新 */
    updateMyPokemon(
      id: string,
      updates: Partial<Pick<MyPokemon, 'nickname' | 'originGame' | 'memo'>>
    ): void {
      const pokemon = this.myPokemonList.find((p) => p.id === id);
      if (!pokemon) return;
      if (updates.nickname !== undefined) pokemon.nickname = updates.nickname;
      if (updates.originGame !== undefined) pokemon.originGame = updates.originGame;
      if (updates.memo !== undefined) pokemon.memo = updates.memo;
      this.saveMyPokemonList();
    },

    /** マイポケモンを削除（進捗データも削除） */
    removeMyPokemon(id: string): void {
      const idx = this.myPokemonList.findIndex((p) => p.id === id);
      if (idx === -1) return;
      this.myPokemonList.splice(idx, 1);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- 動的キーで進捗データを削除する必要がある
      delete this.progress[id];
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
      if (this.activeMyPokemonId === id) {
        this.activeMyPokemonId = null;
      }
      this.saveMyPokemonList();
    },

    /** マイポケモンを選択してアクティブにする */
    selectMyPokemon(myPokemonId: string): void {
      const myPokemon = this.myPokemonList.find((p) => p.id === myPokemonId);
      if (!myPokemon) return;
      this.activeMyPokemonId = myPokemonId;
      const detail = this.pokemonList.find((p) => p.id === myPokemon.pokemonId);
      if (detail) {
        this.selectedPokemon = {
          id: detail.id,
          number: String(detail.dexNumber).padStart(3, '0'),
          name: detail.name,
          imageUrl: detail.image,
          types: detail.types,
        };
      }
      this.loadProgress(myPokemonId);
    },

    /** マイポケモン一覧を localStorage から読み込む */
    loadMyPokemonList(): void {
      try {
        const saved = localStorage.getItem(MY_POKEMON_STORAGE_KEY);
        this.myPokemonList = saved ? (JSON.parse(saved) as MyPokemon[]) : [];
      } catch {
        this.myPokemonList = [];
      }
    },

    /** マイポケモン一覧を localStorage に保存 */
    saveMyPokemonList(): void {
      try {
        localStorage.setItem(MY_POKEMON_STORAGE_KEY, JSON.stringify(this.myPokemonList));
      } catch {
        console.error('マイポケモンの保存に失敗しました');
      }
    },

    /** 全データをJSON文字列としてエクスポート */
    exportProgress(): string {
      const data: ExportData = {
        version: 1,
        myPokemonList: this.myPokemonList,
        progress: this.progress,
      };
      return JSON.stringify(data);
    },

    /** JSON文字列からデータをインポート */
    importProgress(json: string): void {
      try {
        const raw = JSON.parse(json) as Record<string, unknown>;

        if (raw.version === 1 && raw.progress) {
          // v1 format (with myPokemonList)
          const data = raw as unknown as ExportData;
          for (const [key, value] of Object.entries(data.progress)) {
            if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
              throw new Error(`Invalid data for key: ${key}`);
            }
          }
          this.progress = data.progress;
          if (Array.isArray(data.myPokemonList)) {
            this.myPokemonList = data.myPokemonList;
            this.saveMyPokemonList();
          }
        } else if (typeof raw === 'object' && !Array.isArray(raw) && !raw.version) {
          // Legacy format (just progress object)
          const data = raw as Record<string, string[]>;
          for (const [key, value] of Object.entries(data)) {
            if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
              throw new Error(`Invalid data for key: ${key}`);
            }
          }
          this.progress = data;
        } else {
          throw new Error('不明なデータ形式です');
        }

        for (const pokemonId of Object.keys(this.progress)) {
          this.saveProgress(pokemonId);
        }
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : '進捗データの形式が不正です');
      }
    },
  },
});
