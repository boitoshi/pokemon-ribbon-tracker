<script lang="ts">
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { getGameName } from '$lib/utils/gameNames';
	import type { Ribbon } from '$lib/types';

	/** スワイプ判定の閾値（px） */
	const SWIPE_THRESHOLD = 50;

	// --- 状態 ---
	let currentIndex = $state(0);
	let genFilter = $state<number | null>(null);
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let showSwipeHint = $state(true);

	$effect(() => {
		if (typeof localStorage !== 'undefined' && localStorage.getItem('swipeHintDismissed') === '1') {
			showSwipeHint = false;
		}
	});

	// --- 派生値 ---
	const STATE_SORT_ORDER = { urgent: 0, missed: 1, available: 2, obtained: 3, future: 4, locked: 5 };

	const filteredRibbons = $derived(
		(genFilter === null
			? [...ribbonProgress.allRibbons]
			: [...ribbonProgress.allRibbons].filter((r) => r.generation === genFilter)
		).sort((a, b) => {
			const sa = STATE_SORT_ORDER[ribbonProgress.getRibbonState(a)] ?? 9;
			const sb = STATE_SORT_ORDER[ribbonProgress.getRibbonState(b)] ?? 9;
			if (sa !== sb) return sa - sb;
			return a.generation - b.generation;
		})
	);

	const currentRibbon = $derived<Ribbon | null>(filteredRibbons[currentIndex] ?? null);

	const isChecked = $derived(
		currentRibbon !== null && ribbonProgress.currentCheckedRibbons.includes(currentRibbon.id)
	);

	const currentRibbonState = $derived(
		currentRibbon ? ribbonProgress.getRibbonState(currentRibbon) : null
	);

	const availableGenerations = $derived(
		[...new Set(ribbonProgress.allRibbons.map((r) => r.generation))].sort((a, b) => a - b)
	);

	const uncheckedCount = $derived(
		filteredRibbons.filter((r) => !ribbonProgress.currentCheckedRibbons.includes(r.id)).length
	);

	// --- 操作メソッド ---
	function next(): void {
		if (filteredRibbons.length === 0) return;
		currentIndex = (currentIndex + 1) % filteredRibbons.length;
	}

	function prev(): void {
		if (filteredRibbons.length === 0) return;
		currentIndex = (currentIndex - 1 + filteredRibbons.length) % filteredRibbons.length;
	}

	function jumpToNextUnchecked(): void {
		const len = filteredRibbons.length;
		if (len === 0) return;

		// currentIndex + 1 から末尾まで探す
		for (let i = currentIndex + 1; i < len; i++) {
			if (!ribbonProgress.currentCheckedRibbons.includes(filteredRibbons[i].id)) {
				currentIndex = i;
				return;
			}
		}
		// 見つからなければ 0 から currentIndex まで探す
		for (let i = 0; i <= currentIndex; i++) {
			if (!ribbonProgress.currentCheckedRibbons.includes(filteredRibbons[i].id)) {
				currentIndex = i;
				return;
			}
		}
		// それでも見つからなければトースト
		toast.show('全部取得済みだよ！');
	}

	function toggleCurrent(): void {
		if (currentRibbon === null) return;
		if (!ribbonProgress.activeMyPokemonId) {
			toast.show('ポケモンを選ぶと記録できるよ！', 'info');
			return;
		}
		ribbonProgress.toggleRibbon(currentRibbon.id);
	}

	function onTouchStart(e: TouchEvent): void {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}

	function onTouchEnd(e: TouchEvent): void {
		const deltaX = e.changedTouches[0].clientX - touchStartX;
		const deltaY = e.changedTouches[0].clientY - touchStartY;
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
			if (showSwipeHint) {
				showSwipeHint = false;
				localStorage.setItem('swipeHintDismissed', '1');
			}
			if (deltaX < 0) {
				// 左スワイプ = 次
				next();
			} else {
				// 右スワイプ = 前
				prev();
			}
		}
	}

	function setGenFilter(gen: number | null): void {
		genFilter = gen;
		currentIndex = 0;
	}
</script>

<div class="flex h-[calc(100vh-5rem)] flex-col md:h-screen">
	<!-- 世代フィルター -->
	<div class="flex gap-2 overflow-x-auto border-b p-3">
		<button
			onclick={() => setGenFilter(null)}
			class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors
				{genFilter === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}"
		>
			全て
		</button>
		{#each availableGenerations as gen (gen)}
			<button
				onclick={() => setGenFilter(gen)}
				class="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors
					{genFilter === gen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}"
			>
				Gen{gen}
			</button>
		{/each}
	</div>

	<!-- マイポケモン未選択時 -->
	{#if filteredRibbons.length === 0}
		<div class="flex flex-1 items-center justify-center">
			<p class="text-gray-500">この世代のリボンはないよ</p>
		</div>

	<!-- メイン表示 -->
	{:else}
		<!-- 参照モードバナー -->
		{#if !ribbonProgress.activeMyPokemonId}
			<div class="flex items-center gap-2 border-b border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-700">
				<span>ℹ</span>
				<span><strong>参照モード</strong> — タップしても記録されません。<a href="/" class="underline hover:text-sky-900">ポケモンを選ぶ →</a></span>
			</div>
		{/if}

		<!-- カウンター表示 -->
		<div class="py-2 text-center text-sm text-gray-500">
			{currentIndex + 1} / {filteredRibbons.length}&nbsp;·&nbsp;未取得 {uncheckedCount}件
		</div>

		<!-- リボン表示エリア（タップ全体でトグル） -->
		<button
			class="flex w-full flex-1 flex-col items-center justify-center gap-4 p-8 transition-colors
				{isChecked
					? 'bg-green-50'
					: currentRibbonState === 'urgent'
						? 'bg-orange-50'
						: currentRibbonState === 'missed'
							? 'bg-red-50'
							: 'bg-white'}"
			onclick={toggleCurrent}
			ontouchstart={onTouchStart}
			ontouchend={onTouchEnd}
			aria-label={isChecked ? 'チェック済み（タップで解除）' : '未チェック（タップで取得済みにする）'}
		>
			<!-- 状態バッジ -->
			{#if currentRibbonState === 'urgent'}
				<span class="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white">⚡ 今すぐ取得必須！</span>
			{:else if currentRibbonState === 'missed'}
				<span class="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">❌ 取り逃し</span>
			{:else if currentRibbonState === 'locked'}
				<span class="rounded-full bg-gray-400 px-3 py-1 text-sm font-bold text-white">🚫 取得不可</span>
			{:else if currentRibbonState === 'future'}
				<span class="rounded-full bg-gray-300 px-3 py-1 text-sm font-medium text-gray-600">🔒 未来のリボン</span>
			{/if}

			<!-- チェック状態アイコン（大きく） -->
			<div
				class="flex h-20 w-20 items-center justify-center rounded-full border-4 text-4xl
					{isChecked
						? 'border-green-500 bg-green-500 text-white'
						: currentRibbonState === 'urgent'
							? 'border-orange-400 bg-white text-orange-400'
							: currentRibbonState === 'missed'
								? 'border-red-400 bg-white text-red-400'
								: 'border-gray-300 bg-white text-transparent'}"
			>
				{isChecked ? '✓' : currentRibbonState === 'urgent' ? '⚡' : currentRibbonState === 'missed' ? '×' : '✓'}
			</div>

			<!-- リボン名 -->
			{#if currentRibbon}
				<h2
					class="text-center text-2xl font-bold
						{isChecked
							? 'text-green-800'
							: currentRibbonState === 'urgent'
								? 'text-orange-800'
								: currentRibbonState === 'missed'
									? 'text-red-800'
									: 'text-gray-900'}"
				>
					{currentRibbon.name}
				</h2>

				<!-- タグ群 -->
				<div class="flex flex-wrap justify-center gap-2">
					<span class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
						{currentRibbon.category}
					</span>
					<span class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
						第{currentRibbon.generation}世代
					</span>
					{#if currentRibbon.eligibility?.type === 'level_max'}
						<span class="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
							⚠ Lv.{currentRibbon.eligibility.maxLevel}以下
						</span>
					{/if}
				</div>

				<!-- 説明文 -->
				{#if currentRibbon.description}
					<p class="max-w-xs text-center text-gray-600">{currentRibbon.description}</p>
				{/if}

				<!-- 対応ゲーム -->
				<div class="flex flex-wrap justify-center gap-1">
					{#each currentRibbon.games as gameId (gameId)}
						<span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
							{getGameName(gameId)}
						</span>
					{/each}
				</div>
			{/if}

			<!-- スワイプヒント -->
			{#if showSwipeHint}
				<p class="mt-2 text-xs text-gray-400">← スワイプで前後移動 →</p>
			{/if}
		</button>

		<!-- ナビゲーションボタン -->
		<div class="flex items-center gap-2 border-t p-4">
			<button
				onclick={prev}
				class="flex-1 rounded-lg bg-gray-100 py-3 font-medium text-gray-700 active:bg-gray-200"
			>
				← 前
			</button>
			<button
				onclick={jumpToNextUnchecked}
				class="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white active:bg-blue-700"
			>
				次の未取得へ
			</button>
			<button
				onclick={next}
				class="flex-1 rounded-lg bg-gray-100 py-3 font-medium text-gray-700 active:bg-gray-200"
			>
				次 →
			</button>
		</div>
	{/if}
</div>
