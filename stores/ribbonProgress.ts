import { defineStore } from 'pinia';
import type { Pokemon, Ribbon, Game, PokemonDetail } from '~/types';

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
  }),

  getters: {
    /** 現在選択中のポケモンの取得済みリボンID一覧 */
    currentCheckedRibbons(state): string[] {
      if (!state.selectedPokemon) return [];
      return state.progress[state.selectedPokemon.id] ?? [];
    },

    /** 現在選択中のポケモンの総合完了率 */
    totalCompletion(state): number {
      if (!state.selectedPokemon || state.ribbons.length === 0) return 0;
      const checked = state.progress[state.selectedPokemon.id]?.length ?? 0;
      return Math.round((checked / state.ribbons.length) * 100);
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

    /** リボン一覧を v-model の配列でまとめて更新 */
    setCheckedRibbons(pokemonId: string, ribbonIds: string[]): void {
      this.progress[pokemonId] = [...ribbonIds];
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
  },
});
