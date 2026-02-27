<script lang="ts">
	import { goto } from '$app/navigation';
	import { GAMES } from '$lib/data/games';
	import { TRANSFER_ROUTES } from '$lib/data/transfer-routes';
	import { setup } from '$lib/stores/setup.svelte';
	import type { Game, Hardware, TransferRoute } from '$lib/types';

	// ステップ管理
	let currentStep = $state<1 | 2 | 3>(1);

	// 世代別ゲームグループ
	const gamesByGen = $derived(
		GAMES.reduce(
			(acc, game) => {
				if (!acc[game.generation]) acc[game.generation] = [];
				acc[game.generation].push(game);
				return acc;
			},
			{} as Record<number, Game[]>
		)
	);

	// 世代一覧（昇順）
	const generations = $derived(
		Object.keys(gamesByGen)
			.map(Number)
			.sort((a, b) => a - b)
	);

	// ハード情報定義
	const HARDWARE_INFO: { id: Hardware; name: string; note: string }[] = [
		{ id: 'gba', name: 'ゲームボーイアドバンス / SP', note: 'Gen3 GBAカートリッジの実行に必要' },
		{
			id: 'ds_lite',
			name: 'DS Lite',
			note: 'パルパーク（Gen3→4）に必須（DSiは不可）'
		},
		{ id: 'dsi', name: 'DSi / DSi LL', note: 'ポケシフター（Gen4→5）で使用可' },
		{ id: '3ds', name: '3DS / 2DS / New3DS', note: 'ポケモンバンク（〜Gen5）で使用' },
		{ id: 'switch', name: 'Nintendo Switch', note: 'ポケモンHOME・Switch版FRLGに必要' }
	];

	// 転送ルート判定関数
	function isRouteAvailable(route: TransferRoute): boolean {
		return route.hardwareRequired.every((hw) => setup.ownedHardware.includes(hw));
	}

	function getMissingHardware(route: TransferRoute): Hardware[] {
		return route.hardwareRequired.filter((hw) => !setup.ownedHardware.includes(hw));
	}

	// ハード名を返すヘルパー
	function getHardwareName(hw: Hardware): string {
		return HARDWARE_INFO.find((h) => h.id === hw)?.name ?? hw;
	}

	// セットアップ完了処理
	function handleComplete(): void {
		setup.completeSetup();
		goto('/');
	}
</script>

<svelte:head>
	<title>セットアップ | ポケモンリボン制覇トラッカー</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-8">
	<!-- 設定済みバナー -->
	{#if setup.setupCompleted}
		<div class="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
			セットアップ済みです。内容を変更したい場合はそのまま進めてください。
		</div>
	{/if}

	<!-- ステップインジケーター -->
	<div class="mb-8 flex items-center justify-center gap-3">
		{#each [1, 2, 3] as step}
			<div class="flex items-center gap-3">
				{#if step > 1}
					<div class="h-px w-8 bg-gray-300"></div>
				{/if}
				<div class="flex items-center gap-2">
					<div
						class={[
							'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
							currentStep === step
								? 'bg-blue-600 text-white'
								: currentStep > step
									? 'bg-green-500 text-white'
									: 'border-2 border-gray-300 bg-white text-gray-400'
						].join(' ')}
					>
						{#if currentStep > step}
							&#10003;
						{:else}
							{step}
						{/if}
					</div>
					<span
						class={[
							'text-sm font-medium',
							currentStep === step ? 'text-blue-600' : 'text-gray-400'
						].join(' ')}
					>
						{step === 1 ? 'ゲーム' : step === 2 ? 'ハード' : '確認'}
					</span>
				</div>
			</div>
		{/each}
	</div>

	<!-- Step 1: 所持ゲームを選ぶ -->
	{#if currentStep === 1}
		<div>
			<h1 class="mb-2 text-xl font-bold text-gray-800">所持ゲームを選んでください</h1>
			<p class="mb-6 text-sm text-gray-500">持っているゲームソフトをすべて選択してください。</p>

			<div class="space-y-6">
				{#each generations as gen}
					<div>
						<h2 class="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
							第{gen}世代
						</h2>
						<div class="flex flex-wrap gap-2">
							{#each gamesByGen[gen] as game}
								<button
									type="button"
									onclick={() => setup.toggleGame(game.id)}
									class={[
										'rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors',
										setup.ownedGames.includes(game.id)
											? 'border-blue-500 bg-blue-50 text-blue-700'
											: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
									].join(' ')}
								>
									{game.shortName}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-8 flex justify-end">
				<button
					type="button"
					onclick={() => (currentStep = 2)}
					disabled={setup.ownedGames.length === 0}
					class="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
				>
					次へ →
				</button>
			</div>
		</div>

	<!-- Step 2: 所持ハードを選ぶ -->
	{:else if currentStep === 2}
		<div>
			<h1 class="mb-2 text-xl font-bold text-gray-800">所持ハードを選んでください</h1>
			<p class="mb-6 text-sm text-gray-500">
				持っているゲーム機をすべて選択してください。転送ルートの判定に使用します。
			</p>

			{#if setup.ownedHardware.length === 0}
				<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
					ハードを選ばないと転送ルートが使えません。
				</div>
			{/if}

			<div class="space-y-3">
				{#each HARDWARE_INFO as hw}
					<button
						type="button"
						onclick={() => setup.toggleHardware(hw.id)}
						class={[
							'w-full rounded-lg border-2 px-4 py-3 text-left transition-colors',
							setup.ownedHardware.includes(hw.id)
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
						].join(' ')}
					>
						<div class="flex items-center justify-between">
							<div>
								<div
									class={[
										'font-medium',
										setup.ownedHardware.includes(hw.id) ? 'text-blue-700' : 'text-gray-800'
									].join(' ')}
								>
									{hw.name}
								</div>
								<div class="mt-0.5 text-sm text-gray-500">{hw.note}</div>
							</div>
							<div
								class={[
									'ml-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
									setup.ownedHardware.includes(hw.id)
										? 'border-blue-500 bg-blue-500 text-white'
										: 'border-gray-300'
								].join(' ')}
							>
								{#if setup.ownedHardware.includes(hw.id)}
									<span class="text-xs">&#10003;</span>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>

			<div class="mt-8 flex justify-between">
				<button
					type="button"
					onclick={() => (currentStep = 1)}
					class="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
				>
					← 戻る
				</button>
				<button
					type="button"
					onclick={() => (currentStep = 3)}
					class="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
				>
					次へ →
				</button>
			</div>
		</div>

	<!-- Step 3: 転送ルート確認 -->
	{:else if currentStep === 3}
		<div>
			<h1 class="mb-2 text-xl font-bold text-gray-800">転送ルートの確認</h1>
			<p class="mb-6 text-sm text-gray-500">
				所持ハードに基づいて、利用可能な転送ルートを確認してください。
			</p>

			<div class="space-y-4">
				{#each TRANSFER_ROUTES as route}
					{@const available = isRouteAvailable(route)}
					{@const missing = getMissingHardware(route)}
					<div
						class={[
							'rounded-lg border-2 p-4',
							available ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'
						].join(' ')}
					>
						<div class="flex items-start justify-between gap-3">
							<div class="flex-1">
								<div class="flex flex-wrap items-center gap-2">
									<span class="font-semibold text-gray-800">
										{route.methodName}
									</span>
									{#if available}
										<span
											class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
										>
											利用可能
										</span>
									{:else}
										<span
											class="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500"
										>
											利用不可
										</span>
									{/if}
									{#if route.isDeprecated}
										<span
											class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
										>
											サービス終了
										</span>
									{/if}
								</div>

								<div class="mt-2 text-sm text-gray-500">
									Gen{route.fromGeneration} → Gen{route.toGeneration}
								</div>

								{#if route.hardwareRequired.length > 0}
									<div class="mt-2 flex flex-wrap gap-1">
										{#each route.hardwareRequired as hw}
											<span
												class={[
													'rounded border px-2 py-0.5 text-xs',
													setup.ownedHardware.includes(hw)
														? 'border-green-300 bg-green-100 text-green-700'
														: 'border-red-300 bg-red-50 text-red-600'
												].join(' ')}
											>
												{getHardwareName(hw)}
											</span>
										{/each}
									</div>
								{/if}

								{#if !available && missing.length > 0}
									<div class="mt-2 text-xs text-red-600">
										不足: {missing.map((hw) => getHardwareName(hw)).join('、')}
									</div>
								{/if}

								{#if route.isDeprecated && route.deprecationNote}
									<div class="mt-2 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
										{route.deprecationNote}
									</div>
								{/if}

								{#if route.restrictions.length > 0}
									<ul class="mt-2 space-y-0.5">
										{#each route.restrictions as restriction}
											<li class="text-xs text-gray-500">- {restriction}</li>
										{/each}
									</ul>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-8 flex justify-between">
				<button
					type="button"
					onclick={() => (currentStep = 2)}
					class="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
				>
					← 戻る
				</button>
				<button
					type="button"
					onclick={handleComplete}
					class="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
				>
					セットアップ完了
				</button>
			</div>
		</div>
	{/if}
</div>
