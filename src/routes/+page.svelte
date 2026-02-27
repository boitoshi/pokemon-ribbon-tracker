<script lang="ts">
	import { onMount } from 'svelte';
	import type { FilterState } from '$lib/types';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { CATEGORY_MAP } from '$lib/utils/ribbonFilter';
	import Toast from '$lib/components/ui/Toast.svelte';
	import PokemonSearch from '$lib/components/tracker/PokemonSearch.svelte';
	import PokemonDetails from '$lib/components/tracker/PokemonDetails.svelte';
	import MyPokemonPanel from '$lib/components/tracker/MyPokemonPanel.svelte';
	import RibbonFilter from '$lib/components/tracker/RibbonFilter.svelte';
	import RibbonCard from '$lib/components/tracker/RibbonCard.svelte';

	/** フィルター状態 */
	let filterState = $state<FilterState>({
		generation: null,
		type: null,
		status: null,
		search: ''
	});

	/** フィルタリング済みリボン一覧 */
	const filteredRibbons = $derived(
		(() => {
			let ribbons = ribbonProgress.allRibbons;

			if (filterState.generation !== null) {
				ribbons = ribbons.filter((r) => r.generation === filterState.generation);
			}

			if (filterState.type !== null) {
				if (filterState.type === 'mark') {
					ribbons = ribbons.filter((r) => r.type === 'mark');
				} else {
					const categoryName = CATEGORY_MAP[filterState.type];
					if (categoryName) {
						ribbons = ribbons.filter((r) => r.category === categoryName);
					}
				}
			}

			if (filterState.status === 'obtained') {
				ribbons = ribbons.filter((r) =>
					ribbonProgress.currentCheckedRibbons.includes(r.id)
				);
			} else if (filterState.status === 'not-obtained') {
				ribbons = ribbons.filter(
					(r) => !ribbonProgress.currentCheckedRibbons.includes(r.id)
				);
			}

			if (filterState.search) {
				ribbons = ribbons.filter((r) => r.name.includes(filterState.search));
			}

			return ribbons;
		})()
	);

	/** レベル制限リボンのうち、今すぐ取る必要があるもの（未取得かつ取得可能） */
	const urgentRibbons = $derived(
		ribbonProgress.activeMyPokemon
			? ribbonProgress.allRibbons.filter(
					(r) =>
						r.eligibility?.type === 'level_max' &&
						!ribbonProgress.currentCheckedRibbons.includes(r.id) &&
						ribbonProgress.getRibbonEligibility(r).eligible
				)
			: []
	);

	/** 世代別進捗のエントリ一覧（世代順） */
	const generationProgressEntries = $derived(
		Object.entries(ribbonProgress.generationProgress)
			.map(([gen, data]) => ({ gen: Number(gen), ...data }))
			.sort((a, b) => a.gen - b.gen)
	);

	/** 全体取得率 */
	const totalObtained = $derived(ribbonProgress.currentCheckedRibbons.length);
	const totalRibbons = $derived(ribbonProgress.allRibbons.length);
	const completionPercent = $derived(
		totalRibbons > 0 ? Math.round((totalObtained / totalRibbons) * 100) : 0
	);

	/** フィルター変更ハンドラ */
	function handleFilterChange(f: FilterState): void {
		filterState = f;
	}

	/** リボントグルハンドラ */
	function handleToggleRibbon(ribbonId: string): void {
		if (!ribbonProgress.activeMyPokemonId) {
			toast.info('マイポケモンを選択してください');
			return;
		}
		ribbonProgress.toggleRibbon(ribbonId);
	}

	/** 進捗リセット */
	function handleResetProgress(): void {
		if (!ribbonProgress.activeMyPokemonId) return;
		if (confirm('このポケモンのリボン進捗をリセットしますか？')) {
			ribbonProgress.resetProgress();
			toast.success('進捗をリセットしました');
		}
	}

	/** 進捗エクスポート */
	function handleExport(): void {
		try {
			ribbonProgress.exportProgress();
			toast.success('進捗をエクスポートしました');
		} catch {
			toast.error('エクスポートに失敗しました');
		}
	}

	/** 進捗インポート */
	function handleImport(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				ribbonProgress.importProgress(e.target?.result as string);
				toast.success('進捗をインポートしました');
			} catch {
				toast.error('インポートに失敗しました。ファイルを確認してください');
			}
		};
		reader.readAsText(file);
		input.value = '';
	}

	onMount(() => {
		ribbonProgress.init();
	});
</script>

<svelte:head>
	<title>トラッカー | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<Toast />

<div class="mx-auto max-w-7xl px-2 py-3 md:px-4 md:py-6">
	<div class="flex flex-col gap-4 md:flex-row md:gap-6">
		<!-- ===== 左サイドバー（検索・詳細・マイポケモン） ===== -->
		<aside class="flex flex-col gap-3 md:w-80 md:flex-shrink-0">
			<!-- ポケモン検索 -->
			<PokemonSearch allPokemon={ribbonProgress.allPokemon} />

			<!-- ポケモン詳細 -->
			<PokemonDetails />

			<!-- マイポケモンパネル -->
			<MyPokemonPanel />
		</aside>

		<!-- ===== メインエリア（フィルター・リボン一覧） ===== -->
		<main class="min-w-0 flex-1">
			<!-- 進捗サマリー -->
			{#if ribbonProgress.activeMyPokemon}
				<div class="mb-4 rounded-lg bg-white p-3 shadow md:p-4">
					<div class="mb-2 flex items-center justify-between">
						<div>
							<span class="text-sm font-medium text-gray-700">
								{ribbonProgress.activeMyPokemon.nickname || ribbonProgress.selectedPokemon?.name || ''}
							</span>
							<span class="ml-2 text-sm text-gray-500">
								{totalObtained} / {totalRibbons}個取得（{completionPercent}%）
							</span>
						</div>
						<div class="flex gap-2">
							<button
								class="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
								onclick={handleExport}
							>
								エクスポート
							</button>
							<label class="cursor-pointer rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200">
								インポート
								<input type="file" accept=".json" class="hidden" onchange={handleImport} />
							</label>
							<button
								class="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
								onclick={handleResetProgress}
							>
								リセット
							</button>
						</div>
					</div>
					<!-- プログレスバー -->
					<div class="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
						<div
							class="h-full rounded-full bg-green-500 transition-all"
							style="width: {completionPercent}%"
						></div>
					</div>
					<!-- 世代別進捗 -->
					<div class="grid grid-cols-4 gap-1 md:grid-cols-7">
						{#each generationProgressEntries as { gen, obtained, total } (gen)}
							<div class="rounded bg-gray-50 p-1.5 text-center">
								<div class="text-xs text-gray-500">第{gen}世代</div>
								<div class="text-xs font-medium">
									{obtained}<span class="text-gray-400">/{total}</span>
								</div>
								<div class="mt-0.5 h-1 overflow-hidden rounded-full bg-gray-200">
									<div
										class="h-full rounded-full bg-blue-500"
										style="width: {total > 0 ? Math.round((obtained / total) * 100) : 0}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- レベル制限リボン警告 -->
			{#if urgentRibbons.length > 0}
				<div class="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 md:p-4">
					<div class="mb-2 flex items-center gap-2">
						<span class="text-lg">⚠</span>
						<h2 class="text-sm font-bold text-orange-800">
							レベル上限前に取っておくべきリボン
						</h2>
					</div>
					<p class="mb-3 text-xs text-orange-700">
						以下のリボンはポケモンのレベルが上限を超えると取得不可になります。
					</p>
					<div class="flex flex-col gap-2">
						{#each urgentRibbons as ribbon (ribbon.id)}
							<RibbonCard
								{ribbon}
								isObtained={ribbonProgress.currentCheckedRibbons.includes(ribbon.id)}
								eligibility={ribbonProgress.getRibbonEligibility(ribbon)}
								onToggle={() => handleToggleRibbon(ribbon.id)}
							/>
						{/each}
					</div>
				</div>
			{/if}

			<!-- フィルター -->
			<RibbonFilter onFilterChange={handleFilterChange} />

			<!-- リボン一覧 -->
			<div>
				<div class="mb-2 flex items-center justify-between">
					<p class="text-xs text-gray-500">
						{filteredRibbons.length}件表示
						{#if filterState.generation !== null || filterState.type !== null || filterState.status !== null || filterState.search}
							（フィルター適用中）
						{/if}
					</p>
				</div>

				{#if filteredRibbons.length === 0}
					<div class="rounded-lg border border-dashed border-gray-200 py-12 text-center">
						<p class="text-gray-500">リボンが見つかりません</p>
						<p class="mt-1 text-xs text-gray-400">フィルターを変更してみてください</p>
					</div>
				{:else}
					<div class="flex flex-col gap-2">
						{#each filteredRibbons as ribbon (ribbon.id)}
							<RibbonCard
								{ribbon}
								isObtained={ribbonProgress.currentCheckedRibbons.includes(ribbon.id)}
								eligibility={ribbonProgress.getRibbonEligibility(ribbon)}
								onToggle={() => handleToggleRibbon(ribbon.id)}
							/>
						{/each}
					</div>
				{/if}
			</div>
		</main>
	</div>
</div>
