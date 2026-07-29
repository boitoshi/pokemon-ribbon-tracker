<script lang="ts">
	import { loadAllData } from '$lib/utils/dataFetcher';
	import { searchPokemon, searchRibbons, searchGames } from '$lib/utils/unifiedSearch';
	import { getCategoryColor } from '$lib/utils/categoryColor';

	/** 全データをロード（SSG: onMount 不要） */
	const { pokemonData, ribbonData, gameData } = loadAllData();

	/** 統合検索クエリ */
	let searchQuery = $state<string>('');

	/** カテゴリ横断の検索結果（各カテゴリ最大8件） */
	const pokemonResults = $derived(searchPokemon(pokemonData, searchQuery));
	const ribbonResults = $derived(searchRibbons(ribbonData, searchQuery));
	const gameResults = $derived(searchGames(gameData, searchQuery));

	const hasQuery = $derived(searchQuery.trim() !== '');
	const totalResultCount = $derived(
		pokemonResults.length + ribbonResults.length + gameResults.length
	);

	/** 空検索時の導線カード */
	const entryCards = [
		{
			href: '/pokemon',
			icon: '🔍',
			title: 'ポケモンから探す',
			description: 'この子は何個リボンをつけられる？を世代別に逆引き'
		},
		{
			href: '/ribbon',
			icon: '🎀',
			title: 'リボンから探す',
			description: '取得条件・対象ソフト・つけられるポケモンを確認'
		},
		{
			href: '/game',
			icon: '🕹️',
			title: 'ソフトから探す',
			description: 'このソフトで取れるリボン/あかしを一覧でチェック'
		}
	] as const;

	/** 図鑑番号を3桁ゼロ埋めでフォーマットする */
	function formatDexNumber(n: number): string {
		return String(n).padStart(3, '0');
	}
</script>

<svelte:head>
	<title>さがす | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 md:py-12">
	<!-- ヒーロー部 -->
	<div class="mb-6 text-center">
		<h1 class="text-2xl font-bold text-gray-800 md:text-3xl">🎀 ポケモンリボン制覇トラッカー</h1>
		<p class="mt-2 text-sm text-gray-500">
			ポケモン・リボン・ソフトを1箱で横断検索して、リボン制覇を計画しよう
		</p>
	</div>

	<!-- 統合検索ボックス -->
	<div class="relative mb-6">
		<span class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg">🔎</span>
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="ポケモン名・リボン名・ソフト名で検索…"
			class="w-full rounded-2xl border border-gray-300 bg-white py-3.5 pr-10 pl-12 text-base text-gray-800 placeholder-gray-400 shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none"
		/>
		{#if searchQuery}
			<button
				class="absolute top-1/2 right-3 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				aria-label="検索をクリア"
				onclick={() => (searchQuery = '')}
			>
				✕
			</button>
		{/if}
	</div>

	{#if hasQuery}
		<!-- ===== 検索結果（グループ表示） ===== -->
		{#if totalResultCount === 0}
			<div
				class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
			>
				「{searchQuery}」に一致するものが見つかりませんでした
			</div>
		{:else}
			<div class="space-y-4">
				{#if pokemonResults.length > 0}
					<section>
						<h2 class="mb-1.5 px-1 text-xs font-bold tracking-wide text-gray-500">ポケモン</h2>
						<div
							class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
						>
							{#each pokemonResults as pokemon (pokemon.id)}
								<a
									href="/pokemon?p={pokemon.id}"
									class="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-sky-50"
								>
									<div class="h-10 w-10 shrink-0">
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
									<span class="text-sm font-medium text-gray-800">{pokemon.name}</span>
									<span class="text-xs text-gray-400">#{formatDexNumber(pokemon.dexNumber)}</span>
								</a>
							{/each}
						</div>
					</section>
				{/if}

				{#if ribbonResults.length > 0}
					<section>
						<h2 class="mb-1.5 px-1 text-xs font-bold tracking-wide text-gray-500">
							リボン・あかし
						</h2>
						<div
							class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
						>
							{#each ribbonResults as ribbon (ribbon.id)}
								<a
									href="/ribbon?r={ribbon.id}"
									class="flex flex-wrap items-center gap-2 px-3 py-2.5 transition-colors hover:bg-sky-50"
								>
									<span
										class="shrink-0 rounded px-2 py-0.5 text-xs font-medium {getCategoryColor(
											ribbon.category
										)}"
									>
										{ribbon.category}
									</span>
									<span class="text-sm font-medium text-gray-800">{ribbon.name}</span>
									{#if ribbon.type === 'mark'}
										<span class="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-bold text-teal-700">
											あかし
										</span>
									{/if}
								</a>
							{/each}
						</div>
					</section>
				{/if}

				{#if gameResults.length > 0}
					<section>
						<h2 class="mb-1.5 px-1 text-xs font-bold tracking-wide text-gray-500">ソフト</h2>
						<div
							class="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
						>
							{#each gameResults as game (game.id)}
								<a
									href="/game?g={game.id}"
									class="flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-sky-50"
								>
									<span class="text-sm font-medium text-gray-800">{game.shortName}</span>
									<span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
										Gen{game.generation}
									</span>
								</a>
							{/each}
						</div>
					</section>
				{/if}
			</div>
		{/if}
	{:else}
		<!-- ===== 空検索時: 導線カード ===== -->
		<div class="grid gap-3 sm:grid-cols-3">
			{#each entryCards as card (card.href)}
				<a
					href={card.href}
					class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50"
				>
					<div class="text-2xl">{card.icon}</div>
					<h2 class="mt-2 text-sm font-bold text-gray-800">{card.title}</h2>
					<p class="mt-1 text-xs text-gray-500">{card.description}</p>
				</a>
			{/each}
		</div>

		<!-- サブ導線 -->
		<div class="mt-4 grid gap-3 sm:grid-cols-2">
			<a
				href="/roadmap"
				class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50"
			>
				<span class="text-xl">🗺️</span>
				<div>
					<p class="text-sm font-bold text-gray-800">ロードマップ</p>
					<p class="text-xs text-gray-500">世代順の取得計画を立てる</p>
				</div>
			</a>
			<a
				href="/box"
				class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50"
			>
				<span class="text-xl">📦</span>
				<div>
					<p class="text-sm font-bold text-gray-800">きろく</p>
					<p class="text-xs text-gray-500">マイポケモンの取得状況をチェック</p>
				</div>
			</a>
		</div>

		<p class="mt-6 text-center text-xs text-gray-400">
			マイポケモンのチェックは 📦<a href="/box" class="underline hover:text-gray-600">きろく</a>
			へ移動しました
		</p>
	{/if}
</div>
