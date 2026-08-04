<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import type { FilterState, Ribbon } from '$lib/types';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { CATEGORY_MAP } from '$lib/utils/ribbonFilter';
	import Toast from '$lib/components/ui/Toast.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import QuickCheck from '$lib/components/tracker/QuickCheck.svelte';
	import ActivePokemonHeroCard from '$lib/components/tracker/ActivePokemonHeroCard.svelte';
	import PokemonSearch from '$lib/components/tracker/PokemonSearch.svelte';
	import PokemonDetails from '$lib/components/tracker/PokemonDetails.svelte';
	import MyPokemonPanel from '$lib/components/tracker/MyPokemonPanel.svelte';
	import RibbonFilter from '$lib/components/tracker/RibbonFilter.svelte';
	import RibbonCard from '$lib/components/tracker/RibbonCard.svelte';

	/**
	 * /box の表示モード。
	 * - swipe: 片手で1枚ずつ記録するスワイプUI（既定。ゲーム機を触りながら使う本命）
	 * - list:  一覧＋フィルタ（腰を据えて見直すときの裏モード）
	 */
	type BoxViewMode = 'swipe' | 'list';

	/** 一覧モード内でのリボンカードの並べ方 */
	type RibbonCardLayout = 'grid' | 'list';

	const VIEW_MODE_STORAGE_KEY = 'rt_box_view_mode';
	const DEFAULT_VIEW_MODE: BoxViewMode = 'swipe';
	const VIEW_MODES: readonly BoxViewMode[] = ['swipe', 'list'];
	const DEFAULT_CARD_LAYOUT: RibbonCardLayout = 'grid';

	/** 世代リスト定数 */
	const GENERATIONS = [3, 4, 5, 6, 7, 8, 9] as const;

	/** フィルタの初期値（リセットにも使う） */
	const EMPTY_FILTER: FilterState = {
		generation: null,
		type: null,
		status: null,
		search: ''
	};

	/** 表示モード（localStorage に保持。復元は onMount） */
	let viewMode = $state<BoxViewMode>(DEFAULT_VIEW_MODE);

	/** リボンカードの並べ方 */
	let cardLayout = $state<RibbonCardLayout>(DEFAULT_CARD_LAYOUT);

	/**
	 * フィルタ状態。generation も type/status/search も、ここが唯一の正。
	 * RibbonFilter は値とコールバックを受け取るだけで自前の state を持たない。
	 */
	let filterState = $state<FilterState>({ ...EMPTY_FILTER });

	/** 主役ピッカー（ボトムシート）の表示状態 */
	let sheetOpen = $state(false);
	/** シートを開いたトリガー要素（閉じたらフォーカスを戻す） */
	let sheetTriggerEl = $state<HTMLElement | null>(null);

	/** 主役ポケモンが未選択か（＝参照モード） */
	const hasNoActivePokemon = $derived(ribbonProgress.activeMyPokemonId === null);

	/** マイポケモンが1匹でも登録されているか */
	const hasMyPokemon = $derived(ribbonProgress.myPokemonList.length > 0);

	/** フィルタリング済みリボン一覧 */
	const filteredRibbons: Ribbon[] = $derived(
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
				ribbons = ribbons.filter((r) => ribbonProgress.currentCheckedSet.has(r.id));
			} else if (filterState.status === 'not-obtained') {
				ribbons = ribbons.filter((r) => !ribbonProgress.currentCheckedSet.has(r.id));
			}

			if (filterState.search) {
				ribbons = ribbons.filter((r) => r.name.includes(filterState.search));
			}

			return ribbons;
		})()
	);

	/** フィルタが1つでも掛かっているか */
	const hasActiveFilter: boolean = $derived(
		filterState.generation !== null ||
			filterState.type !== null ||
			filterState.status !== null ||
			filterState.search !== ''
	);

	/** レベル制限リボンのうち、今すぐ取る必要があるもの */
	const urgentRibbons: Ribbon[] = $derived(
		ribbonProgress.allRibbons.filter((r) => ribbonProgress.getRibbonState(r) === 'urgent')
	);

	/** 世代コンプリート一覧 */
	const completedGenerations: number[] = $derived(
		Object.entries(ribbonProgress.generationProgress)
			.filter(([, data]) => data.total > 0 && data.obtained === data.total)
			.map(([gen]) => Number(gen))
			.sort((a, b) => a - b)
	);

	/** localStorage から復元した値が表示モードとして妥当か判定する */
	function isBoxViewMode(value: string | null): value is BoxViewMode {
		return value !== null && (VIEW_MODES as readonly string[]).includes(value);
	}

	/** 表示モードを切り替えて次回のために保存する */
	function setViewMode(mode: BoxViewMode): void {
		viewMode = mode;
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
		} catch {
			// 保存できなくても操作は続行させる（プライベートモード等）
		}
	}

	/**
	 * 主役ピッカーを開く。
	 * QuickCheck の onRequestActivePokemon からも呼ばれるので引数は取らず、
	 * フォーカス復帰先は現在のフォーカス要素（＝押されたボタン）から拾う。
	 */
	function openActiveSheet(): void {
		sheetTriggerEl =
			typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
		sheetOpen = true;
	}

	function closeActiveSheet(): void {
		sheetOpen = false;
		sheetTriggerEl?.focus();
		sheetTriggerEl = null;
	}

	/** フィルタの部分更新（RibbonFilter からもここを通す） */
	function updateFilter(patch: Partial<FilterState>): void {
		filterState = { ...filterState, ...patch };
	}

	/** 世代フィルター切替 */
	function toggleGeneration(gen: number | null): void {
		updateFilter({ generation: filterState.generation === gen ? null : gen });
	}

	/** フィルタを全部解除する（世代ピル・検索も含めてここ1箇所） */
	function resetFilters(): void {
		filterState = { ...EMPTY_FILTER };
	}

	/** リボントグルハンドラ */
	function handleToggleRibbon(ribbonId: string): void {
		if (!ribbonProgress.activeMyPokemonId) {
			toast.info('記録する主役を決めてね');
			return;
		}
		ribbonProgress.toggleRibbon(ribbonId);
	}

	/** 取り逃しの手動トグル */
	function handleToggleManualMissed(ribbonId: string): void {
		if (!ribbonProgress.activeMyPokemonId) {
			toast.info('記録する主役を決めてね');
			return;
		}
		ribbonProgress.toggleManualMissed(ribbonProgress.activeMyPokemonId, ribbonId);
		toast.success('取り逃し状態を更新しました');
	}

	onMount(() => {
		ribbonProgress.init();
		try {
			const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
			if (isBoxViewMode(saved)) viewMode = saved;
		} catch {
			// 読めなければ既定（スワイプ）のままでよい
		}
	});
</script>

<svelte:head>
	<title>きろく | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<Toast />

<!--
	高さの取り方:
	- スワイプモードは h-full でシェル（+layout.svelte の main）の高さにぴったり収める。
	  カード内の「次の未取得へ」を親指の届く位置に固定したいので、ページ側はスクロールさせない。
	- 一覧モードは高さを指定せず、シェル側の main にスクロールを任せる（入れ子スクロールを作らない）。
	ビューポート単位（dvh/vh/h-screen）は使わないこと。上に主役バーが増えた瞬間に壊れるため。
-->
<div class="flex flex-col {viewMode === 'swipe' ? 'h-full min-h-0' : ''}">
	<!-- モード切替バー（記録画面なので本文優先。縦を食わない細い帯にする） -->
	<div
		class="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-2 border-b
			border-gray-200 bg-white px-3 py-1.5"
	>
		<h1 class="truncate text-sm font-bold text-gray-800">📦 きろく</h1>
		<div
			class="flex shrink-0 overflow-hidden rounded-lg border border-gray-200"
			role="group"
			aria-label="表示モード"
		>
			<button
				type="button"
				aria-pressed={viewMode === 'swipe'}
				class="px-3 py-1.5 text-xs font-medium transition-colors
					{viewMode === 'swipe' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}"
				onclick={() => setViewMode('swipe')}
			>
				⚡ スワイプ
			</button>
			<button
				type="button"
				aria-pressed={viewMode === 'list'}
				class="border-l border-gray-200 px-3 py-1.5 text-xs font-medium transition-colors
					{viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}"
				onclick={() => setViewMode('list')}
			>
				☰ 一覧
			</button>
		</div>
	</div>

	{#if viewMode === 'swipe'}
		<!-- ===== スワイプモード（既定） ===== -->
		<div class="mx-auto flex w-full max-w-2xl min-h-0 flex-1 flex-col">
			<QuickCheck onRequestActivePokemon={openActiveSheet} />
		</div>
	{:else}
		<!-- ===== 一覧モード（裏モード） ===== -->
		<div class="mx-auto w-full max-w-7xl px-2 py-3 md:px-4 md:py-4">
			<div class="flex flex-col gap-4 md:flex-row md:gap-6">
				<!-- 左サイドバー（デスクトップのみ） -->
				<aside class="hidden md:flex md:w-80 md:shrink-0 md:flex-col md:gap-3">
					<PokemonSearch allPokemon={ribbonProgress.allPokemon} />
					<PokemonDetails />
					<MyPokemonPanel />
				</aside>

				<!-- メインエリア -->
				<div class="min-w-0 flex-1">
					<!-- 主役未選択: まず1匹決める導線 -->
					{#if hasNoActivePokemon}
						<div class="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-4">
							<p class="text-sm font-bold text-sky-900">まず記録する1匹を決めよう</p>
							<p class="mt-1 text-sm text-sky-800">
								いまは<strong>参照モード</strong
								>。一覧やフィルタは使えるけど、タップしても取得状況は保存されないよ。
								主役を決めると<strong>記録モード</strong>になって、進捗や取り逃しが残せる。
							</p>
							<div class="mt-3 flex flex-wrap gap-2">
								<button
									type="button"
									class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm
										hover:bg-sky-700 active:bg-sky-800"
									onclick={openActiveSheet}
								>
									{hasMyPokemon ? '主役を選ぶ' : 'ポケモンを登録する'}
								</button>
								<a
									href="{base}/setup"
									class="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm font-semibold
										text-sky-700 hover:bg-sky-100"
								>
									⚙️ 所持ソフトを設定
								</a>
							</div>
							<p class="mt-2 text-xs text-sky-600">
								所持ゲーム・ハードを登録すると、リボンの取得可否が判定できるようになるよ
							</p>
						</div>
					{/if}

					<!-- 主役ヒーローカード（一覧モードだけ。スワイプでは縦を食うので出さない） -->
					<ActivePokemonHeroCard />

					<!-- 今すぐ取れる！カード -->
					{#if urgentRibbons.length > 0}
						<div
							class="mb-4 overflow-hidden rounded-xl border border-orange-200 bg-orange-50 shadow-sm"
						>
							<div class="flex items-center justify-between px-4 py-3">
								<div class="flex items-center gap-2">
									<span class="text-lg">⚡</span>
									<h2 class="text-sm font-bold text-orange-800">今すぐ取れる！</h2>
									<span class="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
										{urgentRibbons.length}件
									</span>
								</div>
							</div>
							<p class="px-4 pb-2 text-xs text-orange-700">レベル上限前に取らないと詰む！</p>
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
					{#each completedGenerations as gen (gen)}
						<div
							class="mb-2 rounded-lg bg-linear-to-r from-yellow-400 to-amber-500
								px-3 py-2 text-sm font-bold text-white shadow-md"
						>
							🎉 Gen{gen} コンプリート！
						</div>
					{/each}

					<!-- 世代ピル -->
					<div class="mb-2 flex gap-1 overflow-x-auto pb-1">
						<button
							type="button"
							class="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors
								{filterState.generation === null
								? 'bg-blue-500 text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
							onclick={() => toggleGeneration(null)}
						>
							全て
						</button>
						{#each GENERATIONS as gen (gen)}
							<button
								type="button"
								class="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors
									{filterState.generation === gen
									? 'bg-blue-500 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
								onclick={() => toggleGeneration(gen)}
							>
								Gen{gen}
							</button>
						{/each}
					</div>

					<!-- フィルター -->
					<RibbonFilter filter={filterState} onChange={updateFilter} onReset={resetFilters} />

					<!-- リボン一覧 -->
					<div>
						<div class="mb-3 flex items-center justify-between">
							<p class="text-xs text-gray-500">
								{filteredRibbons.length}件表示
								{#if hasActiveFilter}
									（フィルター適用中）
								{/if}
							</p>
							<div class="flex overflow-hidden rounded-lg border border-gray-200">
								<button
									type="button"
									aria-pressed={cardLayout === 'grid'}
									class="px-3 py-1.5 text-xs transition-colors
										{cardLayout === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}"
									onclick={() => (cardLayout = 'grid')}>⊞ グリッド</button
								>
								<button
									type="button"
									aria-pressed={cardLayout === 'list'}
									class="border-l border-gray-200 px-3 py-1.5 text-xs transition-colors
										{cardLayout === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}"
									onclick={() => (cardLayout = 'list')}>☰ リスト</button
								>
							</div>
						</div>

						{#if filteredRibbons.length === 0}
							<div class="rounded-lg border border-dashed border-gray-200 py-12 text-center">
								<p class="text-gray-500">リボンが見つかりません</p>
								<p class="mt-1 text-xs text-gray-400">フィルターを変更してみてください</p>
							</div>
						{:else if cardLayout === 'grid'}
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
				</div>
			</div>
		</div>
	{/if}
</div>

<!--
	主役ピッカー。スワイプ側の CTA からも一覧側の導線からも同じシートを開く。
	検索して「このコで始める」で新規登録、既存の子は MyPokemonPanel から切り替えられる。
-->
<BottomSheet open={sheetOpen} onClose={closeActiveSheet} title="記録する主役を決める">
	<div class="flex flex-col gap-3">
		<PokemonSearch allPokemon={ribbonProgress.allPokemon} />
		<MyPokemonPanel defaultOpen />
	</div>
</BottomSheet>
