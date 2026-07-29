<script lang="ts">
	import { base } from '$app/paths';
	import { SvelteSet } from 'svelte/reactivity';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { GAMES } from '$lib/data/games';
	import { loadAllData } from '$lib/utils/dataFetcher';
	import { normalizeForSearch } from '$lib/utils/searchNormalize';
	import { getCategoryColor } from '$lib/utils/categoryColor';
	import RibbonSpeciesList from '$lib/components/pokedex/RibbonSpeciesList.svelte';
	import type { Ribbon } from '$lib/types';

	const GENERATIONS = [3, 4, 5, 6, 7, 8, 9] as const;

	/** 全リボン・ポケモンデータをロード（SSG: onMount 不要） */
	const { ribbonData, pokemonData } = loadAllData();

	/** URL の ?r=<ribbonId>（クライアントのみ・リンク遷移に追従） */
	const selectedRibbonId = $derived(browser ? page.url.searchParams.get('r') : null);

	/** 選択中のリボン */
	const selectedRibbon = $derived(
		selectedRibbonId ? (ribbonData.find((r) => r.id === selectedRibbonId) ?? null) : null
	);

	/** 検索クエリ（一覧モード用） */
	let searchQuery = $state<string>('');

	/** 世代別リボンデータ */
	const ribbonsByGen = $derived(
		GENERATIONS.map((gen) => ({
			gen,
			ribbons: ribbonData.filter((r) => r.generation === gen)
		}))
	);

	/** 検索フィルタ済み世代別リボンデータ（0件の世代は除外） */
	const filteredRibbonsByGen = $derived(
		ribbonsByGen
			.map(({ gen, ribbons }) => ({
				gen,
				ribbons:
					searchQuery.trim() === ''
						? ribbons
						: ribbons.filter((r) => {
								const q = normalizeForSearch(searchQuery);
								return (
									normalizeForSearch(r.name).includes(q) ||
									(r.requirements ? normalizeForSearch(r.requirements).includes(q) : false) ||
									normalizeForSearch(r.category).includes(q)
								);
							})
			}))
			.filter(({ ribbons }) => ribbons.length > 0)
	);

	/** 検索ヒット件数 */
	const filteredRibbonCount = $derived(
		filteredRibbonsByGen.reduce((acc, { ribbons }) => acc + ribbons.length, 0)
	);

	/** 世代別折りたたみ状態（Gen3 を初期展開） */
	const openGens = new SvelteSet<number>([3]);
	function toggleGen(gen: number): void {
		if (openGens.has(gen)) openGens.delete(gen);
		else openGens.add(gen);
	}

	/** 検索クエリが変化したとき、ヒットした Gen を自動展開 */
	$effect(() => {
		if (searchQuery.trim()) {
			filteredRibbonsByGen.forEach(({ gen }) => openGens.add(gen));
		}
	});

	/** ゲームIDから短縮名を取得 */
	function getGameName(id: string): string {
		return GAMES.find((g) => g.id === id)?.shortName ?? id;
	}

	/** level_max 制限があるか */
	function hasLevelMax(ribbon: Ribbon): boolean {
		return ribbon.eligibility?.type === 'level_max';
	}
</script>

<svelte:head>
	<title>リボンから探す | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-6">
	{#if selectedRibbonId && !selectedRibbon}
		<!-- ===== 不明な ID ===== -->
		<a href="{base}/ribbon" class="text-sm font-medium text-sky-700 underline hover:text-sky-900">
			← リボン一覧へ
		</a>
		<div
			class="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
		>
			リボンが見つかりませんでした
		</div>
	{:else if selectedRibbon}
		<!-- ===== 詳細パネル ===== -->
		<a href="{base}/ribbon" class="text-sm font-medium text-sky-700 underline hover:text-sky-900">
			← リボン一覧へ
		</a>

		<div class="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
			<!-- ヘッダー -->
			<div class="border-b border-gray-100 bg-gray-50 px-4 py-3">
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-lg font-bold text-gray-800">{selectedRibbon.name}</h1>
					{#if selectedRibbon.type === 'mark'}
						<span class="rounded bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
							あかし
						</span>
					{/if}
					<span
						class="rounded px-2 py-0.5 text-xs font-medium {getCategoryColor(
							selectedRibbon.category
						)}"
					>
						{selectedRibbon.category}
					</span>
					<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
						Gen{selectedRibbon.generation}
					</span>
				</div>
			</div>

			<div class="space-y-3 px-4 py-3">
				<!-- 注記 -->
				{#if selectedRibbon.eligibility?.type === 'level_max' && selectedRibbon.eligibility.maxLevel !== undefined}
					<p
						class="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700"
					>
						⚠️ レベル{selectedRibbon.eligibility
							.maxLevel}以下限定。レベルが上限を超えると永久に取れなくなります。
					</p>
				{/if}
				{#if selectedRibbon.eligibility?.type === 'shadow_only'}
					<p
						class="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700"
					>
						🌑 シャドウポケモン限定。コロシアム/XDのシャドウポケモンだけが対象です。
					</p>
				{/if}
				{#if selectedRibbon.transferable === false}
					<p
						class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
					>
						🚫 HOME転送でこのリボン/あかしは引き継げません。
					</p>
				{/if}

				<!-- 取得条件・説明 -->
				{#if selectedRibbon.requirements}
					<div>
						<h2 class="mb-1 text-xs font-bold tracking-wide text-gray-500">取得条件</h2>
						<p class="text-sm text-gray-800">{selectedRibbon.requirements}</p>
					</div>
				{/if}
				{#if selectedRibbon.description}
					<div>
						<h2 class="mb-1 text-xs font-bold tracking-wide text-gray-500">説明</h2>
						<p class="text-sm text-gray-700">{selectedRibbon.description}</p>
					</div>
				{/if}

				<!-- 対象ソフト -->
				<div>
					<h2 class="mb-1 text-xs font-bold tracking-wide text-gray-500">対象ソフト</h2>
					<div class="flex flex-wrap gap-1">
						{#each selectedRibbon.games as gameId (gameId)}
							<a
								href="{base}/game?g={gameId}"
								class="rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
							>
								{getGameName(gameId)}
							</a>
						{/each}
					</div>
				</div>

				<!-- つけられるポケモン（逆引き） -->
				<div class="border-t border-gray-100 pt-3">
					<RibbonSpeciesList ribbon={selectedRibbon} allPokemon={pokemonData} />
				</div>
			</div>
		</div>
	{:else}
		<!-- ===== 一覧モード ===== -->
		<h1 class="mb-1 text-2xl font-bold text-gray-800">🎀 リボンから探す</h1>
		<p class="mb-4 text-sm text-gray-500">
			リボン/あかしを選ぶと、取得条件・対象ソフト・つけられるポケモンが分かります。
		</p>

		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<!-- 検索ボックス -->
			<div class="relative min-w-44 max-w-xs flex-1">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="リボン名・条件・カテゴリで検索…"
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
			{#if searchQuery}
				<span class="shrink-0 text-xs text-gray-500">
					該当: <span class="font-semibold text-sky-600">{filteredRibbonCount}</span> 件
				</span>
			{/if}
		</div>

		<div class="space-y-3">
			{#if filteredRibbonsByGen.length === 0}
				<div
					class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
				>
					リボンが見つかりませんでした
				</div>
			{/if}
			{#each filteredRibbonsByGen as { gen, ribbons } (gen)}
				<div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
					<!-- アコーディオンヘッダー -->
					<button
						class="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
						onclick={() => toggleGen(gen)}
					>
						<div class="flex items-center gap-3">
							<span class="text-sm font-bold text-gray-700">Gen{gen}</span>
							<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
								{ribbons.length} 種
							</span>
						</div>
						<span class="text-sm text-gray-400">{openGens.has(gen) ? '▲' : '▼'}</span>
					</button>

					<!-- アコーディオンコンテンツ -->
					{#if openGens.has(gen)}
						<div class="divide-y divide-gray-100 bg-white">
							{#each ribbons as ribbon (ribbon.id)}
								<a
									href="{base}/ribbon?r={ribbon.id}"
									class="flex flex-wrap items-start gap-2 px-4 py-3 transition-colors hover:bg-sky-50"
								>
									<div class="min-w-0 flex-1">
										<div class="flex flex-wrap items-center gap-1.5">
											<span class="text-sm font-medium text-gray-800">{ribbon.name}</span>
											{#if ribbon.type === 'mark'}
												<span
													class="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-bold text-teal-700"
												>
													あかし
												</span>
											{/if}
											{#if hasLevelMax(ribbon)}
												<span
													class="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-bold text-orange-700"
												>
													レベル上限注意
												</span>
											{/if}
										</div>
										{#if ribbon.requirements}
											<p class="mt-0.5 text-xs text-gray-500">{ribbon.requirements}</p>
										{/if}
									</div>
									<span
										class="shrink-0 rounded px-2 py-0.5 text-xs font-medium {getCategoryColor(
											ribbon.category
										)}"
									>
										{ribbon.category}
									</span>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
