<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { loadAllData } from '$lib/utils/dataFetcher';
	import PokemonRibbonLookup from '$lib/components/pokedex/PokemonRibbonLookup.svelte';

	/** 全リボン・ポケモンデータをロード（SSG: onMount 不要） */
	const { ribbonData, pokemonData } = loadAllData();

	/** 選択中の種族ID */
	let selectedPokemonId = $state<string | null>(null);

	// URL の ?p=<pokemonId> に追従（クライアントのみ。ブラウザバック等での変化も反映）
	$effect(() => {
		if (!browser) return;
		const id = page.url.searchParams.get('p');
		const valid = id !== null && pokemonData.some((p) => p.id === id) ? id : null;
		if (valid !== selectedPokemonId) selectedPokemonId = valid;
	});
</script>

<svelte:head>
	<title>ポケモンから探す | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-6">
	<h1 class="mb-1 text-2xl font-bold text-gray-800">🔍 ポケモンから探す</h1>
	<p class="mb-4 text-sm text-gray-500">
		ポケモンを選ぶと、つけられるリボン/あかしの合計と世代別の内訳が分かります。
	</p>

	<PokemonRibbonLookup
		allPokemon={pokemonData}
		allRibbons={ribbonData}
		bind:selectedId={selectedPokemonId}
	/>
</div>
