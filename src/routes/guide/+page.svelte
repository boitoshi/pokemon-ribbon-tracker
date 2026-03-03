<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { GAMES } from '$lib/data/games';
	import { TRANSFER_ROUTES } from '$lib/data/transfer-routes';
	import { loadAllData } from '$lib/utils/dataFetcher';
	import { getTransferUxText } from '$lib/utils/transferUxText';
	import { normalizeForSearch } from '$lib/utils/searchNormalize';
	import type { Ribbon } from '$lib/types';

	const GENERATIONS = [3, 4, 5, 6, 7, 8, 9] as const;

	/** タブ */
	let activeTab = $state<'ribbons' | 'transfer' | 'tips'>('ribbons');

	/** 全リボンデータをロード（SSG: onMount 不要） */
	const { ribbonData } = loadAllData();

	/** ゲームIDから短縮名を取得 */
	function getGameName(id: string): string {
		return GAMES.find((g) => g.id === id)?.shortName ?? id;
	}

	/** 世代別リボンデータ */
	const ribbonsByGen = $derived(
		GENERATIONS.map((gen) => ({
			gen,
			ribbons: ribbonData.filter((r) => r.generation === gen)
		}))
	);

	/** 検索クエリ */
	let searchQuery = $state<string>('');

	/** 検索フィルタ済み世代別リボンデータ（0件の世代は除外） */
	const filteredRibbonsByGen = $derived(
		ribbonsByGen
			.map(({ gen, ribbons }) => ({
				gen,
				ribbons: searchQuery.trim() === ''
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

	/** カテゴリ → タグ色クラス */
	const CATEGORY_COLOR: Record<string, string> = {
		コンテスト:         'bg-pink-100 text-pink-700',
		バトル:             'bg-red-100 text-red-700',
		チャンピオン:       'bg-yellow-100 text-yellow-700',
		思い出:             'bg-cyan-100 text-cyan-700',
		購入:               'bg-purple-100 text-purple-700',
		イベント:           'bg-indigo-100 text-indigo-700',
		バトルフロンティア: 'bg-orange-100 text-orange-700',
	};
	function getCategoryColor(category: string): string {
		return CATEGORY_COLOR[category] ?? 'bg-gray-100 text-gray-600';
	}

	/** level_max 制限があるか */
	function hasLevelMax(ribbon: Ribbon): boolean {
		return ribbon.eligibility?.type === 'level_max';
	}

	/** 転送元〜先ラベル */
	function genLabel(gen: number): string {
		return `Gen${gen}`;
	}

	const irreversibleRouteCount = $derived(TRANSFER_ROUTES.filter((route) => route.isIrreversible).length);
	const deprecatedRouteCount = $derived(TRANSFER_ROUTES.filter((route) => route.isDeprecated).length);
</script>

<svelte:head>
	<title>ガイド | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-6">
	<h1 class="mb-1 text-2xl font-bold text-gray-800">リボン攻略ガイド</h1>
	<p class="mb-4 text-sm text-gray-500">リボン一覧・転送ルート・攻略Tipsをまとめたリファレンスです。</p>

	<!-- ===== タブナビ ===== -->
	<div class="mb-6 border-b border-gray-200">
		<nav class="-mb-px flex gap-1">
			{#each ([
				{ key: 'ribbons',  label: 'リボン一覧' },
				{ key: 'transfer', label: '転送ルート' },
				{ key: 'tips',     label: '攻略Tips'   },
			] as const) as tab (tab.key)}
				<button
					class="rounded-t px-4 py-2 text-sm font-medium transition-colors
						{activeTab === tab.key
							? 'border-b-2 border-blue-500 text-blue-600'
							: 'text-gray-500 hover:text-gray-700'}"
					onclick={() => (activeTab = tab.key)}
				>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>

	<!-- ===== リボン一覧タブ ===== -->
	{#if activeTab === 'ribbons'}
		<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
			<!-- 検索ボックス（左側） -->
			<div class="relative flex-1 min-w-44 max-w-xs">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="リボン名・条件・カテゴリで検索…"
					class="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-800 placeholder-gray-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-300"
				/>
				{#if searchQuery}
					<button
						class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
						aria-label="検索をクリア"
						onclick={() => (searchQuery = '')}
					>✕</button>
				{/if}
			</div>
			<!-- 右側コントロール -->
			<div class="flex items-center gap-3 shrink-0">
				{#if searchQuery}
					<span class="text-xs text-gray-500">該当: <span class="font-semibold text-sky-600">{filteredRibbonCount}</span> 件</span>
				{/if}
				<button
					class="text-xs text-sky-600 underline"
					onclick={() => GENERATIONS.forEach((g) => openGens.add(g))}
				>全て展開</button>
				<button
					class="text-xs text-sky-600 underline"
					onclick={() => GENERATIONS.forEach((g) => openGens.delete(g))}
				>全て折りたたむ</button>
			</div>
		</div>
		<div class="space-y-3">
			{#if filteredRibbonsByGen.length === 0}
				<div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
					リボンが見つかりませんでした
				</div>
			{/if}
			{#each filteredRibbonsByGen as { gen, ribbons } (gen)}
				<div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
					<!-- アコーディオンヘッダー -->
					<button
						class="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left hover:bg-gray-100 transition-colors"
						onclick={() => toggleGen(gen)}
					>
						<div class="flex items-center gap-3">
							<span class="text-sm font-bold text-gray-700">Gen{gen}</span>
							<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
								{ribbons.length} 種
							</span>
						</div>
						<span class="text-gray-400 text-sm">{openGens.has(gen) ? '▲' : '▼'}</span>
					</button>

					<!-- アコーディオンコンテンツ -->
					{#if openGens.has(gen)}
						<div class="divide-y divide-gray-100">
							{#each ribbons as ribbon (ribbon.id)}
								<div class="flex flex-wrap items-start gap-2 px-4 py-3">
									<!-- リボン名 + level_max バッジ -->
									<div class="min-w-0 flex-1">
										<div class="flex flex-wrap items-center gap-1.5">
											<span class="text-sm font-medium text-gray-800">{ribbon.name}</span>
											{#if hasLevelMax(ribbon)}
												<span class="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-bold text-orange-700">
													レベル上限注意
												</span>
											{/if}
										</div>
										{#if ribbon.requirements}
											<p class="mt-0.5 text-xs text-gray-500">{ribbon.requirements}</p>
										{/if}
									</div>

									<!-- カテゴリタグ -->
									<span class="shrink-0 rounded px-2 py-0.5 text-xs font-medium {getCategoryColor(ribbon.category)}">
										{ribbon.category}
									</span>

									<!-- ゲームタグ（横並び・折り返し） -->
									<div class="w-full flex flex-wrap gap-1">
										{#each ribbon.games as gameId (gameId)}
											<span class="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-600">
												{getGameName(gameId)}
											</span>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>

	<!-- ===== 転送ルートタブ ===== -->
	{:else if activeTab === 'transfer'}
		<div class="space-y-4">
			<div class="rounded-xl border border-red-200 bg-linear-to-r from-red-50 to-amber-50 p-4 shadow-sm">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p class="text-xs font-semibold tracking-wide text-red-700">不可逆転送アラート</p>
						<h2 class="mt-0.5 text-base font-bold text-gray-900">次世代へ送る前に、この画面で最終確認</h2>
						<p class="mt-1 text-xs text-gray-700">
							転送は取り返しがつかないため、手段・制約・廃止情報を必ず確認してください。
						</p>
					</div>
					<div class="grid grid-cols-2 gap-2 text-center">
						<div class="rounded-lg border border-red-200 bg-white px-3 py-2">
							<p class="text-[11px] text-gray-500">不可逆ルート</p>
							<p class="text-lg font-bold text-red-700">{irreversibleRouteCount}</p>
						</div>
						<div class="rounded-lg border border-orange-200 bg-white px-3 py-2">
							<p class="text-[11px] text-gray-500">要注意ルート</p>
							<p class="text-lg font-bold text-orange-700">{deprecatedRouteCount}</p>
						</div>
					</div>
				</div>
				<ul class="mt-3 space-y-1 text-xs text-gray-700">
					<li>1. 必要手段（いずれか）を満たしているか確認</li>
					<li>2. 一方通行・日次制限・サービス状況を確認</li>
					<li>3. リボンの取り残しがないことを確認してから実行</li>
				</ul>
			</div>

			<!-- 転送フロー図（テキストベース） -->
			<div class="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 shadow-sm">
				<div class="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-700 whitespace-nowrap">
					<span class="rounded bg-red-100 px-2 py-1 text-red-700">Gen3</span>
					<span class="text-gray-400">→ パルパーク →</span>
					<span class="rounded bg-blue-100 px-2 py-1 text-blue-700">Gen4</span>
					<span class="text-gray-400">→ ポケシフター →</span>
					<span class="rounded bg-gray-200 px-2 py-1 text-gray-700">Gen5</span>
					<span class="text-gray-400">→ ポケムーバー →</span>
					<span class="rounded bg-sky-100 px-2 py-1 text-sky-700">バンク</span>
					<span class="text-gray-400">→ HOME →</span>
					<span class="rounded bg-rose-100 px-2 py-1 text-rose-700">Gen8/9</span>
				</div>
			</div>

			<!-- 各ルートカード -->
			{#each TRANSFER_ROUTES as route (route.id)}
				{@const transferText = getTransferUxText(route.explanationKey)}
				<div class="overflow-hidden rounded-xl border shadow-sm
					{route.isDeprecated
						? 'border-red-200 bg-red-50/30'
						: route.isIrreversible
							? 'border-rose-200 bg-rose-50/30'
							: 'border-gray-200 bg-white'}">
					<!-- カードヘッダー -->
					<div class="flex flex-wrap items-center gap-3 px-4 py-3
						{route.isDeprecated
							? 'bg-red-50'
							: route.isIrreversible
								? 'bg-rose-50'
								: 'bg-gray-50'}">
						<div class="flex items-center gap-2">
							<span class="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
								{genLabel(route.fromGeneration)}
							</span>
							<span class="text-gray-400 text-xs">→</span>
							<span class="rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
								{genLabel(route.toGeneration)}
							</span>
						</div>
						<h3 class="text-sm font-bold text-gray-800">{route.methodName}</h3>
						{#if route.isIrreversible}
							<span class="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">不可逆</span>
						{/if}
						{#if route.isDeprecated}
							<span class="ml-auto rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
								注意: 廃止予定
							</span>
						{/if}
					</div>

					<!-- カード本体 -->
					<div class="px-4 py-3 space-y-2">
						<p class="rounded bg-white/80 px-2 py-1 text-xs text-gray-700 ring-1 ring-gray-100">{transferText.guideSummary}</p>
						<!-- 必要ハード -->
						<div class="flex flex-wrap gap-1 items-center">
							<span class="text-xs text-gray-500 mr-1">必要手段（いずれか）:</span>
							{#each route.requirements.anyOf as option (option.id)}
								<span class="rounded border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-700">
									{option.label}
								</span>
							{/each}
						</div>
						{#if route.hardwareNote}
							<p class="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">{route.hardwareNote}</p>
						{/if}
						{#if route.dailyLimit}
							<p class="text-xs text-gray-600">
								1日の転送上限: <strong>{route.dailyLimit}匹</strong>
							</p>
						{/if}
						<!-- 注意事項 -->
						<ul class="space-y-1">
							{#each route.restrictions as note (note)}
								<li class="flex items-start gap-1.5 text-xs text-gray-600">
									<span class="mt-0.5 shrink-0 text-gray-400">•</span>
									{note}
								</li>
							{/each}
						</ul>
						{#if route.deprecationNote}
							<p class="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
								{route.deprecationNote}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>

	<!-- ===== 攻略Tipsタブ ===== -->
	{:else if activeTab === 'tips'}
		<div class="space-y-6 text-sm text-gray-700">

			<!-- 1. 基本戦略 -->
			<section class="rounded-xl border border-gray-200 p-4 shadow-sm">
				<h2 class="mb-3 text-base font-bold text-gray-800">1. リボン制覇の基本戦略</h2>
				<ul class="space-y-2">
					<li class="flex items-start gap-2">
						<span class="mt-0.5 shrink-0 font-bold text-blue-500">→</span>
						<span>世代を進める前に、<strong>その世代のリボンを全取得</strong>してから転送する。一方通行なので後戻りできない。</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="mt-0.5 shrink-0 font-bold text-orange-500">!</span>
						<span><strong>level_max リボンは最優先。</strong>レベルが上限を超えると永久に取れなくなる。トラッカーの「今すぐ取れる！」セクションを必ず確認すること。</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="mt-0.5 shrink-0 font-bold text-pink-500">♥</span>
						<span>コンテスト系は時間がかかるので早めに着手。ポロック/ポフィン集めから始めよう。</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="mt-0.5 shrink-0 font-bold text-green-500">√</span>
						<span>1匹だけで全リボン制覇を目指す場合、Gen3 から育てたポケモンをずっと連れていくのが最効率。</span>
					</li>
				</ul>
			</section>

			<!-- 2. 世代別の注意点 -->
			<section class="rounded-xl border border-gray-200 p-4 shadow-sm">
				<h2 class="mb-3 text-base font-bold text-gray-800">2. 世代別の注意点</h2>
				<div class="space-y-3">
					{#each [
						{
							gen: 'Gen3',
							color: 'bg-red-50 border-red-200',
							accent: 'text-red-700',
							notes: [
								'コロシアム/XD のシャドウリボンはシャドウポケモン専用。通常ポケモンは対象外。',
								'コンテスト会場ごとにポロックが必要。先に大量作成しておくと楽。',
								'バトルフロンティア（エメラルド）のリボン数が最多世代のひとつ。早めに攻略を。',
							]
						},
						{
							gen: 'Gen4',
							color: 'bg-blue-50 border-blue-200',
							accent: 'text-blue-700',
							notes: [
								'コンテスト全マスター × 5部門 + バトルフロンティア全制覇で大量リボン。',
								'リボンシンジケートの曜日リボン（月〜日）は1日1個ずつ取得。毎日チェックを。',
								'ゴージャスロイヤルリボンは約100万円かかる。おまもりこばん必携。',
							]
						},
						{
							gen: 'Gen5',
							color: 'bg-gray-50 border-gray-200',
							accent: 'text-gray-700',
							notes: [
								'リボン種類が少ない世代。チャンピオンリボンとメモリアルリボンが主。',
								'ポケムーバーは2023年3月にeショップ販売終了済み。3DS を持っているなら即転送を。',
							]
						},
						{
							gen: 'Gen6',
							color: 'bg-sky-50 border-sky-200',
							accent: 'text-sky-700',
							notes: [
								'スーパートレーニングリボンは XY/ORAS のみ。Gen7以降では取得不可。',
								'ORAS のコンテストスターリボンは5部門全マスターで獲得。コンテスト好きには嬉しい。',
							]
						},
						{
							gen: 'Gen7',
							color: 'bg-amber-50 border-amber-200',
							accent: 'text-amber-700',
							notes: [
								'バトルツリーで50連勝が必要。レッド/グリーンが登場するので要注意。',
								'バトルロイヤルマスターランクは特殊なバトル形式。KO数戦略を理解してから挑もう。',
							]
						},
						{
							gen: 'Gen8',
							color: 'bg-rose-50 border-rose-200',
							accent: 'text-rose-700',
							notes: [
								'ランクマッチリボンはオンライン対戦でマスターボール級到達が必要。シーズン序盤が楽。',
								'ベストフレンドリボンはポケモンキャンプでなかよし度を最大に。',
								'「あかし」（マーク）は野生捕獲時にランダム付与。狙うには根気が必要。',
							]
						},
						{
							gen: 'Gen9',
							color: 'bg-violet-50 border-violet-200',
							accent: 'text-violet-700',
							notes: [
								'現在リボンデータ整備中（Phase 6 予定）。',
							]
						},
					] as item (item.gen)}
						<div class="rounded-lg border px-3 py-2 {item.color}">
							<h3 class="mb-1 text-xs font-bold {item.accent}">{item.gen}</h3>
							<ul class="space-y-1">
								{#each item.notes as note (note)}
									<li class="flex items-start gap-1.5 text-xs text-gray-700">
										<span class="mt-0.5 shrink-0 text-gray-400">•</span>
										{note}
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			</section>

			<!-- 3. HOME転送について -->
			<section class="rounded-xl border border-gray-200 p-4 shadow-sm">
				<h2 class="mb-3 text-base font-bold text-gray-800">3. ポケモン HOME 転送について</h2>
				<ul class="space-y-2">
					<li class="flex items-start gap-2">
						<span class="mt-0.5 shrink-0 font-bold text-green-500">√</span>
						<span>HOME 転送後もリボンは<strong>すべて保持</strong>される。リボンを付けてから転送して問題なし。</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="mt-0.5 shrink-0 font-bold text-blue-500">→</span>
						<span>Gen3〜5 のリボンはポケモンの「形見」として、HOMEや最新世代でも表示できる。</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="mt-0.5 shrink-0 font-bold text-orange-500">!</span>
						<span>ポケモンバンク経由の転送は実質終了済み（eショップ配信停止）。既存の 3DS DL版のみ利用可能。</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="mt-0.5 shrink-0 font-bold text-orange-500">!</span>
						<span>Switch版 FR/LG があれば Gen3 → HOME 直接転送が可能。GBA ルートをスキップできる。</span>
					</li>
				</ul>
			</section>

		</div>
	{/if}
</div>
