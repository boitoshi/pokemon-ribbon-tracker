<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import type { PokemonDetail, Ribbon } from '$lib/types';
	import { normalizeForSearch } from '$lib/utils/searchNormalize';
	import { getSpeciesRibbonSummary, ELIGIBILITY_DISCLAIMER } from '$lib/utils/ribbonIndex';
	import { getCategoryColor } from '$lib/utils/categoryColor';

	/** Props */
	let {
		allPokemon,
		allRibbons,
		selectedId = $bindable(null)
	}: {
		allPokemon: PokemonDetail[];
		allRibbons: Ribbon[];
		selectedId?: string | null;
	} = $props();

	/** 検索クエリ */
	let searchQuery = $state<string>('');

	/** 検索結果の最大件数 */
	const MAX_RESULTS = 20;

	/** 検索結果（最大20件） */
	const results = $derived(
		(() => {
			const query = normalizeForSearch(searchQuery.trim());
			if (!query) return [];
			return allPokemon
				.filter((p) => normalizeForSearch(p.name).includes(query))
				.slice(0, MAX_RESULTS);
		})()
	);

	/** 選択中の種族 */
	const selected = $derived(
		selectedId ? (allPokemon.find((p) => p.id === selectedId) ?? null) : null
	);

	/** 選択種族のリボンサマリー */
	const summary = $derived(selected ? getSpeciesRibbonSummary(selected, allRibbons) : null);

	/** 世代別折りたたみ状態 */
	const openGens = new SvelteSet<number>();

	/** 選択が変わったら最初の世代だけ展開する */
	$effect(() => {
		const gens = summary?.byGeneration.map((g) => g.gen) ?? [];
		untrack(() => {
			openGens.clear();
			if (gens.length > 0) openGens.add(gens[0]);
		});
	});

	function toggleGen(gen: number): void {
		if (openGens.has(gen)) openGens.delete(gen);
		else openGens.add(gen);
	}

	/** ポケモンを選択して URL クエリを更新する */
	function selectPokemon(pokemon: PokemonDetail): void {
		selectedId = pokemon.id;
		searchQuery = '';
		void goto(`?p=${pokemon.id}`, { replaceState: true, keepFocus: true, noScroll: true });
	}

	/** 図鑑番号を3桁ゼロ埋めでフォーマットする */
	function formatDexNumber(n: number): string {
		return String(n).padStart(3, '0');
	}
</script>

<div class="space-y-4">
	<!-- 検索ボックス -->
	<div class="relative max-w-xs">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="ポケモン名で検索…"
			class="w-full rounded-lg border border-gray-300 bg-white py-1.5 pr-8 pl-3 text-sm text-gray-800 placeholder-gray-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-300 focus:outline-none"
		/>
		{#if searchQuery}
			<button
				class="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
				aria-label="検索をクリア"
				onclick={() => (searchQuery = '')}
			>
				✕
			</button>
		{/if}
	</div>

	<!-- 検索結果リスト -->
	{#if results.length > 0}
		<div class="max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
			{#each results as pokemon (pokemon.id)}
				<button
					class="flex w-full items-center p-2 text-left hover:bg-gray-100"
					onclick={() => selectPokemon(pokemon)}
				>
					<div class="mr-3 h-10 w-10 shrink-0">
						{#if pokemon.image}
							<img
								src={pokemon.image}
								alt={pokemon.name}
								loading="lazy"
								class="h-full w-full object-contain"
							/>
						{:else}
							<div class="h-full w-full rounded-full bg-gray-200"></div>
						{/if}
					</div>
					<div>
						<div class="text-sm font-medium">{pokemon.name}</div>
						<div class="text-xs text-gray-500">#{formatDexNumber(pokemon.dexNumber)}</div>
					</div>
				</button>
			{/each}
		</div>
	{:else if searchQuery.trim()}
		<div
			class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500"
		>
			ポケモンが見つかりませんでした
		</div>
	{/if}

	<!-- 詳細パネル -->
	{#if selected && summary}
		<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
			<!-- ヘッダー -->
			<div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
				<div class="h-16 w-16 shrink-0 md:h-20 md:w-20">
					{#if selected.image}
						<img
							src={selected.image}
							alt={selected.name}
							loading="lazy"
							class="h-full w-full object-contain"
						/>
					{:else}
						<div class="h-full w-full rounded-full bg-gray-200"></div>
					{/if}
				</div>
				<div>
					<h2 class="text-lg font-bold text-gray-800">{selected.name}</h2>
					<p class="text-xs text-gray-500">
						#{formatDexNumber(selected.dexNumber)} ・ 第{selected.generation}世代登場
					</p>
					<div class="mt-1 flex flex-wrap gap-1">
						{#each selected.types as type (type)}
							<span class="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-700">{type}</span>
						{/each}
					</div>
				</div>
			</div>

			<div class="space-y-3 px-4 py-3">
				<!-- 合計サマリー -->
				<div class="rounded-lg bg-sky-50 px-3 py-2">
					<p class="text-sm font-bold text-sky-800">
						取得可能: リボン {summary.ribbonCount}種 ＋ あかし {summary.markCount}種
					</p>
					{#if summary.eventOnly.length > 0}
						<p class="mt-0.5 text-xs text-sky-700">
							ほかにイベント配布限定 {summary.eventOnly.length}種
						</p>
					{/if}
				</div>

				<!-- 世代別内訳 -->
				<div class="space-y-2">
					{#each summary.byGeneration as { gen, entries } (gen)}
						<div class="overflow-hidden rounded-xl border border-gray-200">
							<button
								class="flex w-full items-center justify-between bg-gray-50 px-3 py-2 text-left transition-colors hover:bg-gray-100"
								onclick={() => toggleGen(gen)}
							>
								<div class="flex items-center gap-2">
									<span class="text-sm font-bold text-gray-700">Gen{gen}</span>
									<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
										{entries.length} 種
									</span>
								</div>
								<span class="text-sm text-gray-400">{openGens.has(gen) ? '▲' : '▼'}</span>
							</button>
							{#if openGens.has(gen)}
								<div class="divide-y divide-gray-100">
									{#each entries as entry (entry.ribbon.id)}
										<div class="flex flex-wrap items-center gap-1.5 px-3 py-2">
											<span class="text-sm text-gray-800">{entry.ribbon.name}</span>
											<span
												class="rounded px-1.5 py-0.5 text-xs font-medium {getCategoryColor(
													entry.ribbon.category
												)}"
											>
												{entry.ribbon.category}
											</span>
											{#each entry.notes as note (note)}
												<span class="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
													{note}
												</span>
											{/each}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<p class="text-xs text-gray-400">{ELIGIBILITY_DISCLAIMER}</p>
			</div>
		</div>
	{:else if !searchQuery.trim()}
		<div
			class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
		>
			ポケモンを検索して、つけられるリボン/あかしを調べられます
		</div>
	{/if}
</div>
