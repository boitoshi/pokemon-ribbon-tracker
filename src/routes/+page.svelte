<script lang="ts">
	import { onMount } from 'svelte';
	import type { FilterState, PokemonDetail } from '$lib/types';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { CATEGORY_MAP } from '$lib/utils/ribbonFilter';
	import Toast from '$lib/components/ui/Toast.svelte';
	import PokemonSearch from '$lib/components/tracker/PokemonSearch.svelte';
	import PokemonDetails from '$lib/components/tracker/PokemonDetails.svelte';
	import MyPokemonPanel from '$lib/components/tracker/MyPokemonPanel.svelte';
	import RibbonFilter from '$lib/components/tracker/RibbonFilter.svelte';
	import RibbonCard from '$lib/components/tracker/RibbonCard.svelte';

	/** 世代リスト定数 */
	const GENERATIONS = [3, 4, 5, 6, 7, 8, 9] as const;

	/** 世代カラーテーママップ */
	const GEN_THEME: Record<number, { gradient: string; border: string; accent: string }> = {
		3: { gradient: 'from-red-50 to-orange-50',    border: 'border-red-200',    accent: 'text-red-700' },
		4: { gradient: 'from-blue-50 to-indigo-50',   border: 'border-blue-200',   accent: 'text-blue-700' },
		5: { gradient: 'from-gray-50 to-slate-100',   border: 'border-gray-300',   accent: 'text-gray-700' },
		6: { gradient: 'from-sky-50 to-blue-50',      border: 'border-sky-200',    accent: 'text-sky-700' },
		7: { gradient: 'from-amber-50 to-yellow-50',  border: 'border-amber-200',  accent: 'text-amber-700' },
		8: { gradient: 'from-rose-50 to-red-50',      border: 'border-rose-200',   accent: 'text-rose-700' },
		9: { gradient: 'from-violet-50 to-purple-50', border: 'border-violet-200', accent: 'text-violet-700' },
	};
	const DEFAULT_GEN_THEME = { gradient: 'from-gray-50 to-slate-50', border: 'border-gray-200', accent: 'text-gray-700' };

	/** グリッド/リスト切り替え（デフォルトはグリッド） */
	let viewMode = $state<'list' | 'grid'>('grid');

	/** フィルター状態 */
	let filterState = $state<FilterState>({
		generation: null,
		type: null,
		status: null,
		search: ''
	});

	/** モバイルボトムシートの表示状態 */
	let showMobilePanel = $state(false);

	/** モバイルヘッダー内ポケモン検索クエリ */
	let mobileSearchQuery = $state('');

	/** モバイルヘッダー内ポケモン検索結果（最大10件） */
	const MOBILE_MAX_RESULTS = 10;
	const mobileSearchResults = $derived(
		(() => {
			const query = mobileSearchQuery.trim();
			if (!query) return [] as PokemonDetail[];
			return ribbonProgress.allPokemon.filter((p) => p.name.includes(query)).slice(0, MOBILE_MAX_RESULTS);
		})()
	);

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

	/** レベル制限リボンのうち、今すぐ取る必要があるもの */
	const urgentRibbons = $derived(
		ribbonProgress.allRibbons.filter((r) => ribbonProgress.getRibbonState(r) === 'urgent')
	);

	/** 世代別進捗のエントリ一覧（世代順） */
	const generationProgressEntries = $derived(
		Object.entries(ribbonProgress.generationProgress)
			.map(([gen, data]) => ({ gen: Number(gen), ...data }))
			.sort((a, b) => a.gen - b.gen)
	);

	/** 世代コンプリート一覧 */
	const completedGenerations = $derived(
		generationProgressEntries.filter(({ obtained, total }) => total > 0 && obtained === total)
	);

	/** 全体取得率 */
	const totalObtained = $derived(ribbonProgress.currentCheckedRibbons.length);
	const countableRibbons = $derived(
		ribbonProgress.allRibbons.filter((r) => {
			const s = ribbonProgress.getRibbonState(r);
			return s === 'obtained' || s === 'available' || s === 'urgent';
		})
	);
	const missedRibbons = $derived(
		ribbonProgress.allRibbons.filter((r) => ribbonProgress.getRibbonState(r) === 'missed')
	);
	const completionPercent = $derived(
		countableRibbons.length > 0
			? Math.round((totalObtained / countableRibbons.length) * 100)
			: 0
	);

	const lastConfirmedDate = $derived(
		ribbonProgress.activeMyPokemonId
			? ribbonProgress.getLastConfirmationDate(ribbonProgress.activeMyPokemonId)
			: undefined
	);

	/** アクティブポケモンの表示名 */
	const activePokemonName = $derived(
		ribbonProgress.activeMyPokemon
			? (ribbonProgress.activeMyPokemon.nickname ||
				ribbonProgress.allPokemon.find((p) => p.id === ribbonProgress.activeMyPokemon!.pokemonId)?.name ||
				'')
			: ''
	);

	/** アクティブポケモンの画像URL */
	const activePokemonImage = $derived(
		ribbonProgress.activeMyPokemon
			? ribbonProgress.allPokemon.find((p) => p.id === ribbonProgress.activeMyPokemon!.pokemonId)?.image
			: undefined
	);

	const hasNoActivePokemon = $derived(ribbonProgress.activeMyPokemonId === null);

	/** マイポケモン一覧の表示名取得 */
	function getMyPokemonName(mp: { id: string; pokemonId: string; nickname: string }): string {
		if (mp.nickname) return mp.nickname;
		return ribbonProgress.allPokemon.find((p) => p.id === mp.pokemonId)?.name ?? mp.pokemonId;
	}

	/** マイポケモン一覧の画像URL取得 */
	function getMyPokemonImage(pokemonId: string): string | undefined {
		return ribbonProgress.allPokemon.find((p) => p.id === pokemonId)?.image;
	}

	/** フィルター変更ハンドラ（generation は別管理） */
	function handleFilterChange(f: Omit<FilterState, 'generation'>): void {
		filterState = { ...filterState, ...f };
	}

	/** 世代フィルター切替 */
	function toggleGeneration(gen: number | null): void {
		filterState = { ...filterState, generation: filterState.generation === gen ? null : gen };
	}

	/** リボントグルハンドラ */
	function handleToggleRibbon(ribbonId: string): void {
		if (!ribbonProgress.activeMyPokemonId) {
			toast.info('マイポケモンを選択してください');
			return;
		}
		ribbonProgress.toggleRibbon(ribbonId);
	}

	function handleToggleManualMissed(ribbonId: string): void {
		if (!ribbonProgress.activeMyPokemonId) {
			toast.info('マイポケモンを選択してください');
			return;
		}
		ribbonProgress.toggleManualMissed(ribbonProgress.activeMyPokemonId, ribbonId);
		toast.success('取り逃し状態を更新しました');
	}

	let showResetConfirm = $state(false);

	/** 進捗リセット確認 */
	function handleResetProgress(): void {
		if (!ribbonProgress.activeMyPokemonId) return;
		showResetConfirm = true;
	}

	/** 進捗リセット実行 */
	function executeResetProgress(): void {
		ribbonProgress.resetProgress();
		toast.success('進捗をリセットしました');
		showResetConfirm = false;
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

	/** モバイル検索でポケモンを選択 */
	function handleMobileSelectPokemon(pokemon: PokemonDetail): void {
		ribbonProgress.selectPokemon(pokemon);
		mobileSearchQuery = '';
	}

	onMount(() => {
		ribbonProgress.init();
	});
</script>

<svelte:head>
	<title>トラッカー | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<Toast />

<!-- ===== モバイル専用スティッキーヘッダー（md:hidden） ===== -->
<div class="sticky top-0 z-20 border-b bg-white shadow-sm md:hidden">
	<!-- Row 1: アクティブポケモン + マイポケモンボタン -->
	<div class="flex items-center gap-2 px-3 py-2">
		{#if ribbonProgress.activeMyPokemon}
			<!-- アバター -->
			<div class="h-8 w-8 flex-shrink-0">
				{#if activePokemonImage}
					<img src={activePokemonImage} alt={activePokemonName} class="h-full w-full object-contain" />
				{:else}
					<div class="h-full w-full rounded-full bg-gray-200"></div>
				{/if}
			</div>
			<!-- 名前 + 進捗バー -->
			<div class="min-w-0 flex-1">
				<div class="truncate text-sm font-semibold text-gray-800">{activePokemonName}</div>
				<div class="flex items-center gap-1.5">
					<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
						<div
							class="h-full rounded-full bg-green-500 transition-all"
							style="width: {completionPercent}%"
						></div>
					</div>
					<span class="flex-shrink-0 text-xs text-gray-500">{completionPercent}%</span>
				</div>
			</div>
		{:else}
			<div class="flex-1 text-sm text-gray-400">ポケモンを選択してください</div>
		{/if}
		<!-- マイポケモンボタン -->
		<button
			class="flex-shrink-0 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
			onclick={() => (showMobilePanel = true)}
		>
			マイポケモン ▼
		</button>
	</div>

	<!-- Row 2: マイポケモンチップ + 検索 -->
	<div class="flex items-center gap-2 overflow-x-auto px-3 pb-2">
		<!-- マイポケモンチップ（横スクロール） -->
		{#if ribbonProgress.myPokemonList.length > 0}
			<div class="flex flex-shrink-0 gap-1.5">
				{#each ribbonProgress.myPokemonList as mp (mp.id)}
					<button
						class="flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors
							{ribbonProgress.activeMyPokemonId === mp.id
							? 'bg-blue-500 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						onclick={() => ribbonProgress.switchMyPokemon(mp.id)}
					>
						{#if getMyPokemonImage(mp.pokemonId)}
							<img src={getMyPokemonImage(mp.pokemonId)} alt={getMyPokemonName(mp)} class="h-4 w-4 object-contain" />
						{/if}
						<span>{getMyPokemonName(mp)}</span>
					</button>
				{/each}
			</div>
		{/if}
		<!-- + 追加ボタン -->
		<button
			class="flex-shrink-0 rounded-full border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500"
			onclick={() => (showMobilePanel = true)}
		>
			+ 追加
		</button>
		<!-- ポケモン検索（インライン） -->
		<div class="relative flex-shrink-0">
			<input
				type="text"
				bind:value={mobileSearchQuery}
				placeholder="ポケモンを検索..."
				class="w-36 rounded-full border px-3 py-1 text-xs"
			/>
			{#if mobileSearchResults.length > 0}
				<div class="absolute left-0 top-full z-30 mt-1 w-48 rounded-lg border bg-white shadow-lg">
					{#each mobileSearchResults as pokemon (pokemon.id)}
						<button
							class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50"
							onclick={() => handleMobileSelectPokemon(pokemon)}
						>
							{#if pokemon.image}
								<img src={pokemon.image} alt={pokemon.name} class="h-6 w-6 object-contain" />
							{/if}
							{pokemon.name}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- ===== モバイルボトムシートオーバーレイ（md:hidden） ===== -->
{#if showMobilePanel}
	<!-- バックドロップ -->
	<div
		class="fixed inset-0 z-[55] bg-black/50 md:hidden"
		role="button"
		tabindex="0"
		onclick={() => (showMobilePanel = false)}
		onkeydown={(e) => e.key === 'Escape' && (showMobilePanel = false)}
		aria-label="パネルを閉じる"
	></div>
	<!-- パネル本体 -->
	<div class="fixed bottom-0 left-0 right-0 z-[60] max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:hidden">
		<div class="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3">
			<h2 class="text-sm font-bold">マイポケモン</h2>
			<button
				class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				onclick={() => (showMobilePanel = false)}
			>
				✕
			</button>
		</div>
		<div class="p-3">
			<MyPokemonPanel />
		</div>
	</div>
{/if}

<!-- ===== メインレイアウト ===== -->
<div class="mx-auto max-w-7xl px-2 py-3 md:px-4 md:py-6">
	<div class="flex flex-col gap-4 md:flex-row md:gap-6">
		<!-- ===== 左サイドバー（モバイルでは非表示） ===== -->
		<aside class="hidden md:flex md:w-80 md:flex-shrink-0 md:flex-col md:gap-3">
			<!-- ポケモン検索 -->
			<PokemonSearch allPokemon={ribbonProgress.allPokemon} />

			<!-- ポケモン詳細 -->
			<PokemonDetails />

			<!-- マイポケモンパネル -->
			<MyPokemonPanel />
		</aside>

		<!-- ===== メインエリア（フィルター・リボン一覧） ===== -->
		<main class="min-w-0 flex-1">
			{#if hasNoActivePokemon}
				<div class="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-4">
					<p class="text-xs font-semibold text-sky-700">はじめての人向けガイド</p>
					<p class="mt-1 text-sm text-sky-800">
						今は<strong>参照モード</strong>です（一覧・フィルタ・可否確認）。
						マイポケモンを選ぶと<strong>記録モード</strong>になり、進捗や取り逃しを保存できます。
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						<a
							href="/setup"
							class="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 active:bg-sky-800"
						>⚙️ セットアップを始める</a>
						<p class="self-center text-xs text-sky-600">← 所持ゲーム・ハードを登録するとリボンの取得可否が分かります</p>
					</div>
				</div>
			{/if}

			<!-- ヒーローカード -->
			{#if ribbonProgress.activeMyPokemon}
				{@const activeGen = ribbonProgress.genMap.get(ribbonProgress.activeMyPokemon?.originGame ?? '')}
				{@const theme = (activeGen ? GEN_THEME[activeGen] : null) ?? DEFAULT_GEN_THEME}
				<div class="mb-4 overflow-hidden rounded-xl border shadow-sm {theme.border}">
					<!-- ヒーローカード本体 -->
					<div class="bg-gradient-to-r {theme.gradient} p-4">
						<div class="flex items-center gap-4">
							<!-- ポケモン画像（大） -->
							<div class="h-24 w-24 flex-shrink-0">
								{#if activePokemonImage}
									<img src={activePokemonImage} alt={activePokemonName}
											 class="h-full w-full object-contain drop-shadow-md" />
								{:else}
									<div class="flex h-full w-full items-center justify-center rounded-full bg-white/50 text-4xl">🐾</div>
								{/if}
							</div>
							<!-- テキスト情報 -->
							<div class="min-w-0 flex-1">
								<h2 class="text-xl font-bold {theme.accent}">{activePokemonName}</h2>
								{#if activeGen}
									<p class="mb-2 text-sm text-gray-500">Gen{activeGen}</p>
								{/if}
								<!-- プログレスバー -->
								<div class="mb-1 h-3 w-full overflow-hidden rounded-full bg-white/70">
									<div
										class="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
										style="width: {completionPercent}%"
									></div>
								</div>
								<div class="flex items-center justify-between text-xs text-gray-600">
									<span>{totalObtained}個取得 / 残り{countableRibbons.length - totalObtained}個</span>
									<span class="font-bold {theme.accent}">{completionPercent}%</span>
								</div>
								{#if missedRibbons.length > 0}
									<p class="text-xs text-red-600 font-medium">❌ 取り逃し {missedRibbons.length}個</p>
								{/if}
								{#if lastConfirmedDate}
									<p class="text-xs text-gray-600">不可逆転送の最終確認日: {lastConfirmedDate}</p>
								{/if}
							</div>
						</div>
					</div>
					<!-- エクスポート/インポート/リセット -->
					<div class="flex items-center justify-end gap-2 border-t bg-white/80 px-3 py-2">
						<button
							class="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
							onclick={handleExport}
						>エクスポート ▼</button>
						<label class="cursor-pointer rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200">
							インポート
							<input type="file" accept=".json" class="hidden" onchange={handleImport} />
						</label>
						<button
							class="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
							onclick={handleResetProgress}
						>リセット</button>
					</div>				{#if showResetConfirm}
					<div class="border-t border-red-100 bg-white/80 px-3 py-2">
						<div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
							<p class="mb-2 text-red-700">リボン進捗をリセットしますか？</p>
							<div class="flex gap-2">
								<button
									class="rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300"
									onclick={() => (showResetConfirm = false)}
								>キャンセル</button>
								<button
									class="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
									onclick={executeResetProgress}
								>リセット</button>
							</div>
						</div>
					</div>
				{/if}					<!-- 世代別ミニ進捗グリッド -->
					<div class="grid grid-cols-4 gap-1 border-t bg-white/50 p-2 md:grid-cols-7">
						{#each generationProgressEntries as { gen, obtained, total } (gen)}
							<div class="rounded bg-white/70 p-1.5 text-center">
								<div class="text-xs text-gray-500">Gen{gen}</div>
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

			<!-- 今すぐ取れる！カード -->
			{#if urgentRibbons.length > 0}
				<div class="mb-4 overflow-hidden rounded-xl border border-orange-200 bg-orange-50 shadow-sm">
					<div class="flex items-center justify-between px-4 py-3">
						<div class="flex items-center gap-2">
							<span class="text-lg">⚡</span>
							<h2 class="text-sm font-bold text-orange-800">今すぐ取れる！</h2>
							<span class="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
								{urgentRibbons.length}件
							</span>
						</div>
					</div>
					<p class="px-4 pb-2 text-xs text-orange-700">
						レベル上限前に取らないと詰む！
					</p>
					<div class="flex flex-col gap-2 px-3 pb-3">
						{#each urgentRibbons as ribbon (ribbon.id)}
							<RibbonCard
								{ribbon}
								ribbonState={ribbonProgress.getRibbonState(ribbon)}
								reasonLabels={ribbonProgress.getRibbonReasonLabels(ribbon)}
								onToggle={() => handleToggleRibbon(ribbon.id)}
								onToggleManualMissed={() => handleToggleManualMissed(ribbon.id)}
								isManualMissed={ribbonProgress.isManualMissed(ribbon.id)}
								manualMissedUpdatedAt={ribbonProgress.getManualMissedUpdatedAt(ribbon.id)}
								view="list"
							/>
						{/each}
					</div>
				</div>
			{/if}

			<!-- 世代コンプリートバナー -->
			{#each completedGenerations as { gen } (gen)}
				<div class="mb-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500
								px-3 py-2 text-sm font-bold text-white shadow-md">
					🎉 Gen{gen} コンプリート！
				</div>
			{/each}

			<!-- 世代ピル（常時表示） -->
			<div class="mb-2 flex gap-1 overflow-x-auto pb-1">
				<button
					class="flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors
						{filterState.generation === null ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					onclick={() => toggleGeneration(null)}
				>
					全て
				</button>
				{#each GENERATIONS as gen (gen)}
					<button
						class="flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors
							{filterState.generation === gen ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						onclick={() => toggleGeneration(gen)}
					>
						Gen{gen}
					</button>
				{/each}
			</div>

			<!-- フィルター -->
			<RibbonFilter onFilterChange={handleFilterChange} />

			<!-- リボン一覧 -->
			<div>
				<div class="mb-3 flex items-center justify-between">
					<p class="text-xs text-gray-500">
						{filteredRibbons.length}件表示
						{#if filterState.generation !== null || filterState.type !== null || filterState.status !== null || filterState.search}
							（フィルター適用中）
						{/if}
					</p>
					<div class="flex overflow-hidden rounded-lg border border-gray-200">
						<button
							class="px-3 py-1.5 text-xs transition-colors
								{viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}"
							onclick={() => (viewMode = 'grid')}
						>⊞ グリッド</button>
						<button
							class="border-l border-gray-200 px-3 py-1.5 text-xs transition-colors
								{viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}"
							onclick={() => (viewMode = 'list')}
						>☰ リスト</button>
					</div>
				</div>

				{#if filteredRibbons.length === 0}
					<div class="rounded-lg border border-dashed border-gray-200 py-12 text-center">
						<p class="text-gray-500">リボンが見つかりません</p>
						<p class="mt-1 text-xs text-gray-400">フィルターを変更してみてください</p>
					</div>
				{:else if viewMode === 'grid'}
					<div class="grid grid-cols-5 gap-2 md:grid-cols-8">
						{#each filteredRibbons as ribbon (ribbon.id)}
							<RibbonCard
								{ribbon}
								ribbonState={ribbonProgress.getRibbonState(ribbon)}
								reasonLabels={ribbonProgress.getRibbonReasonLabels(ribbon)}
								onToggle={() => handleToggleRibbon(ribbon.id)}
								onToggleManualMissed={() => handleToggleManualMissed(ribbon.id)}
								isManualMissed={ribbonProgress.isManualMissed(ribbon.id)}
								manualMissedUpdatedAt={ribbonProgress.getManualMissedUpdatedAt(ribbon.id)}
								view="grid"
							/>
						{/each}
					</div>
				{:else}
					<div class="flex flex-col gap-2">
						{#each filteredRibbons as ribbon (ribbon.id)}
							<RibbonCard
								{ribbon}
								ribbonState={ribbonProgress.getRibbonState(ribbon)}
								reasonLabels={ribbonProgress.getRibbonReasonLabels(ribbon)}
								onToggle={() => handleToggleRibbon(ribbon.id)}
								onToggleManualMissed={() => handleToggleManualMissed(ribbon.id)}
								isManualMissed={ribbonProgress.isManualMissed(ribbon.id)}
								manualMissedUpdatedAt={ribbonProgress.getManualMissedUpdatedAt(ribbon.id)}
								view="list"
							/>
						{/each}
					</div>
				{/if}
			</div>
		</main>
	</div>
</div>
