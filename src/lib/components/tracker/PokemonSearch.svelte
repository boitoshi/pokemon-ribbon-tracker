<script lang="ts">
	import type { PokemonDetail } from '$lib/types';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';

	/** Props */
	let { allPokemon }: { allPokemon: PokemonDetail[] } = $props();

	/** 検索クエリ */
	let searchQuery = $state('');

	/** 検索結果（最大20件） */
	const MAX_RESULTS = 20;

	const results = $derived(
		(() => {
			const query = searchQuery.trim();
			if (!query) return [];
			return allPokemon.filter((p) => p.name.includes(query)).slice(0, MAX_RESULTS);
		})()
	);

	/** ポケモンを選択する */
	function selectPokemon(pokemon: PokemonDetail): void {
		ribbonProgress.selectPokemon(pokemon);
		searchQuery = '';
	}

	/** 図鑑番号を3桁ゼロ埋みでフォーマットする */
	function formatDexNumber(n: number): string {
		return String(n).padStart(3, '0');
	}
</script>

<div class="rounded-lg bg-white p-2 shadow md:p-4">
	<div class="mb-2 md:mb-4">
		<label class="mb-1 block text-xs font-bold text-gray-700 md:mb-2"> ポケモンを検索 </label>
		<div class="relative">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="ピカチュウ、フシギダネなど..."
				class="w-full rounded-lg border px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base"
			/>
		</div>
	</div>

	<!-- 検索結果リスト -->
	{#if results.length > 0}
		<div class="mt-2 max-h-60 overflow-y-auto md:max-h-80">
			{#each results as pokemon (pokemon.id)}
				<button
					class="flex w-full items-center rounded p-2 text-left hover:bg-gray-100"
					onclick={() => selectPokemon(pokemon)}
				>
					<!-- サムネイル -->
					<div class="mr-3 h-10 w-10 flex-shrink-0">
						{#if pokemon.image}
							<img src={pokemon.image} alt={pokemon.name} class="h-full w-full object-contain" />
						{:else}
							<div class="h-full w-full rounded-full bg-gray-200"></div>
						{/if}
					</div>
					<!-- 名前・図鑑番号 -->
					<div>
						<div class="text-sm font-medium">{pokemon.name}</div>
						<div class="text-xs text-gray-500">#{formatDexNumber(pokemon.dexNumber)}</div>
					</div>
				</button>
			{/each}
		</div>
	{:else if searchQuery.trim()}
		<div class="py-4 text-center">
			<p class="text-gray-500">ポケモンが見つかりません</p>
			<p class="text-sm text-gray-400">別の名前で検索してください</p>
		</div>
	{/if}
</div>
