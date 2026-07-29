<script lang="ts">
	import type { PokemonDetail, Ribbon } from '$lib/types';
	import {
		getEligibleSpeciesCount,
		formatEligibleSpeciesCondition,
		getEligibleSpeciesForRibbon,
		type RibbonSpeciesCondition
	} from '$lib/utils/ribbonIndex';

	/** Props */
	let { ribbon, allPokemon }: { ribbon: Ribbon; allPokemon: PokemonDetail[] } = $props();

	/** 種族一覧の初期表示件数と追加表示件数 */
	const INITIAL_SPECIES_SHOWN = 24;
	const SPECIES_SHOWN_INCREMENT = 48;

	/** 常時表示する条件テキスト（種族配列は実体化しない軽量版） */
	const conditionText = $derived(
		formatEligibleSpeciesCondition(ribbon, getEligibleSpeciesCount(ribbon, allPokemon))
	);

	/** 種族一覧の開閉状態 */
	let open = $state(false);
	/** 開いたときに初めて計算する種族一覧キャッシュ */
	let condition = $state.raw<RibbonSpeciesCondition | null>(null);
	/** 種族の表示件数 */
	let shownCount = $state(INITIAL_SPECIES_SHOWN);

	/** 種族一覧の開閉をトグルする（開くときに初めて一覧を計算する） */
	function toggleSpeciesList(): void {
		if (!open && condition === null) {
			condition = getEligibleSpeciesForRibbon(ribbon, allPokemon);
			shownCount = INITIAL_SPECIES_SHOWN;
		}
		open = !open;
	}

	/** 種族一覧の表示件数を増やす */
	function showMoreSpecies(): void {
		shownCount += SPECIES_SHOWN_INCREMENT;
	}
</script>

<div class="w-full">
	<div class="flex flex-wrap items-center gap-2">
		<p class="text-xs text-gray-600">
			つけられるポケモン: {conditionText}
		</p>
		<button class="text-xs text-sky-600 underline" onclick={toggleSpeciesList}>
			{open ? '一覧を閉じる ▲' : '一覧を見る ▼'}
		</button>
	</div>
	{#if open && condition}
		<div class="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
			{#each condition.species.slice(0, shownCount) as species (species.id)}
				<a
					href="/pokemon?p={species.id}"
					class="flex flex-col items-center rounded-lg p-1 transition-colors hover:bg-sky-50"
				>
					<img
						src={species.image}
						alt={species.name}
						loading="lazy"
						class="h-12 w-12 object-contain"
					/>
					<span class="text-center text-[10px] leading-tight text-gray-600">
						{species.name}
					</span>
				</a>
			{/each}
		</div>
		{#if condition.species.length > shownCount}
			<button class="mt-2 text-xs text-sky-600 underline" onclick={showMoreSpecies}>
				さらに表示（残り {condition.species.length - shownCount} 件）
			</button>
		{/if}
	{/if}
</div>
