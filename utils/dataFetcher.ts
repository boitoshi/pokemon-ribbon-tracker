import { ref } from 'vue';
import type { PokemonDetail, Ribbon, Game } from '~/types';
import { GAMES } from '~/data/games';
import { RIBBONS_GEN3 } from '~/data/ribbons-gen3';
import { POKEMON_GEN3 } from '~/data/pokemon-gen3';

const isLoading = ref(false);
const error = ref<string | null>(null);

/**
 * ローカルデータを返すコンポーザブル。
 * isLoading / error はページ側との後方互換のために保持する。
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
      return {
        pokemonData: POKEMON_GEN3,
        ribbonData: RIBBONS_GEN3,
        gameData: GAMES,
      };
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, loadAll };
};
