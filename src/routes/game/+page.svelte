<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { loadAllData } from '$lib/utils/dataFetcher';
	import { getCategoryColor } from '$lib/utils/categoryColor';

	const GENERATIONS = [3, 4, 5, 6, 7, 8, 9] as const;

	/** 全リボン・ソフトデータをロード（SSG: onMount 不要） */
	const { ribbonData, gameData } = loadAllData();

	/** URL の ?g=<gameId>（クライアントのみ・リンク遷移に追従） */
	const selectedGameId = $derived(browser ? page.url.searchParams.get('g') : null);

	/** 選択中のソフト */
	const selectedGame = $derived(
		selectedGameId ? (gameData.find((g) => g.id === selectedGameId) ?? null) : null
	);

	/** 世代別ソフト一覧（0件の世代は除外） */
	const gamesByGen = $derived(
		GENERATIONS.map((gen) => ({
			gen,
			games: gameData.filter((g) => g.generation === gen)
		})).filter(({ games }) => games.length > 0)
	);

	/** 選択ソフトで取得できるリボン/あかし一覧 */
	const obtainableRibbons = $derived(
		selectedGame ? ribbonData.filter((r) => r.games.includes(selectedGame.id)) : []
	);

	/** 件数サマリー */
	const obtainableRibbonCount = $derived(obtainableRibbons.filter((r) => r.type !== 'mark').length);
	const obtainableMarkCount = $derived(obtainableRibbons.length - obtainableRibbonCount);
</script>

<svelte:head>
	<title>ソフトから探す | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-6">
	{#if selectedGameId && !selectedGame}
		<!-- ===== 不明な ID ===== -->
		<a href="{base}/game" class="text-sm font-medium text-sky-700 underline hover:text-sky-900">
			← ソフト一覧へ
		</a>
		<div
			class="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
		>
			ソフトが見つかりませんでした
		</div>
	{:else if selectedGame}
		<!-- ===== 詳細パネル ===== -->
		<a href="{base}/game" class="text-sm font-medium text-sky-700 underline hover:text-sky-900">
			← ソフト一覧へ
		</a>

		<div class="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
			<!-- ヘッダー -->
			<div class="border-b border-gray-100 bg-gray-50 px-4 py-3">
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-lg font-bold text-gray-800">{selectedGame.name}</h1>
					<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
						Gen{selectedGame.generation}
					</span>
				</div>
				<p class="mt-1 text-xs text-gray-500">
					{selectedGame.platform} ・ 発売日: {selectedGame.releaseDate}
				</p>
			</div>

			<div class="space-y-3 px-4 py-3">
				<!-- 件数サマリー -->
				<div class="rounded-lg bg-sky-50 px-3 py-2">
					<p class="text-sm font-bold text-sky-800">
						このソフトで取れるもの: リボン {obtainableRibbonCount}種 ＋ あかし {obtainableMarkCount}種
					</p>
				</div>

				<!-- リボン/あかし一覧 -->
				{#if obtainableRibbons.length === 0}
					<div
						class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
					>
						このソフトで取得できるリボン/あかしのデータはまだありません
					</div>
				{:else}
					<div class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
						{#each obtainableRibbons as ribbon (ribbon.id)}
							<a
								href="{base}/ribbon?r={ribbon.id}"
								class="flex flex-wrap items-center gap-2 px-3 py-2.5 transition-colors hover:bg-sky-50"
							>
								<span class="text-sm font-medium text-gray-800">{ribbon.name}</span>
								{#if ribbon.type === 'mark'}
									<span class="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-bold text-teal-700">
										あかし
									</span>
								{/if}
								<span
									class="ml-auto shrink-0 rounded px-2 py-0.5 text-xs font-medium {getCategoryColor(
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
		</div>
	{:else}
		<!-- ===== 一覧モード ===== -->
		<h1 class="mb-1 text-2xl font-bold text-gray-800">🕹️ ソフトから探す</h1>
		<p class="mb-4 text-sm text-gray-500">
			ソフトを選ぶと、そのソフトで取得できるリボン/あかしが分かります。
		</p>

		<div class="space-y-3">
			{#each gamesByGen as { gen, games } (gen)}
				<div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
					<div class="flex items-center gap-3 bg-gray-50 px-4 py-3">
						<span class="text-sm font-bold text-gray-700">Gen{gen}</span>
						<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
							{games.length} 本
						</span>
					</div>
					<div class="divide-y divide-gray-100 bg-white">
						{#each games as game (game.id)}
							<a
								href="{base}/game?g={game.id}"
								class="flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-sky-50"
							>
								<span class="text-sm font-medium text-gray-800">{game.shortName}</span>
								<span class="ml-auto text-xs text-gray-400">
									{game.platform} ・ {game.releaseDate}
								</span>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
