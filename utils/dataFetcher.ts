import { ref } from 'vue';
import type { PokemonDetail, Ribbon, Game } from '~/types';
import { GAMES } from '~/data/games';
import { RIBBONS_GEN3 } from '~/data/ribbons-gen3';
import { RIBBONS_GEN4 } from '~/data/ribbons-gen4';
import { RIBBONS_GEN5 } from '~/data/ribbons-gen5';
import { RIBBONS_GEN6 } from '~/data/ribbons-gen6';
import { RIBBONS_GEN7 } from '~/data/ribbons-gen7';
import { RIBBONS_GEN8 } from '~/data/ribbons-gen8';
import { RIBBONS_GEN9 } from '~/data/ribbons-gen9';
import { MARKS_GEN9 } from '~/data/marks-gen9';
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
        ribbonData: [
          ...RIBBONS_GEN3,
          ...RIBBONS_GEN4,
          ...RIBBONS_GEN5,
          ...RIBBONS_GEN6,
          ...RIBBONS_GEN7,
          ...RIBBONS_GEN8,
          ...RIBBONS_GEN9,
          ...MARKS_GEN9,
        ],
        gameData: GAMES,
      };
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, loadAll };
};
