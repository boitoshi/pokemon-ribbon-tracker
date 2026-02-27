import type { PokemonDetail, Ribbon, Game } from '$lib/types';
import { GAMES } from '$lib/data/games';
import { RIBBONS_GEN3 } from '$lib/data/ribbons-gen3';
import { RIBBONS_GEN4 } from '$lib/data/ribbons-gen4';
import { RIBBONS_GEN5 } from '$lib/data/ribbons-gen5';
import { RIBBONS_GEN6 } from '$lib/data/ribbons-gen6';
import { RIBBONS_GEN7 } from '$lib/data/ribbons-gen7';
import { RIBBONS_GEN8 } from '$lib/data/ribbons-gen8';
import { RIBBONS_GEN9 } from '$lib/data/ribbons-gen9';
import { MARKS_GEN9 } from '$lib/data/marks-gen9';
import { POKEMON_GEN3 } from '$lib/data/pokemon-gen3';

export interface AllData {
	pokemonData: PokemonDetail[];
	ribbonData: Ribbon[];
	gameData: Game[];
}

/** 全データを同期的に返す（全てローカル定義） */
export function loadAllData(): AllData {
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
			...MARKS_GEN9
		],
		gameData: GAMES
	};
}
