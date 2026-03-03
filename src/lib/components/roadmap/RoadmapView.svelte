<script lang="ts">
	import type { RibbonGroup, TransferRoute } from '$lib/types';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { setup } from '$lib/stores/setup.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { TRANSFER_ROUTES } from '$lib/data/transfer-routes';
	import RoadmapStep from './RoadmapStep.svelte';
	import TransferArrow from './TransferArrow.svelte';

	const GENERATIONS = [3, 4, 5, 6, 7, 8, 9] as const;

	const irreversibleRoutes = $derived(TRANSFER_ROUTES.filter((route) => route.isIrreversible));
	const availableIrreversibleCount = $derived(
		irreversibleRoutes.filter((route) => isRouteAvailable(route)).length
	);
	const confirmedIrreversibleCount = $derived(
		!ribbonProgress.activeMyPokemonId
			? 0
			: irreversibleRoutes.filter((route) =>
					ribbonProgress.getRouteConfirmationDate(ribbonProgress.activeMyPokemonId as string, route.id)
				).length
	);

	// 世代別リボングループを計算
	const ribbonGroups: RibbonGroup[] = $derived(
		GENERATIONS.map((gen) => {
			const genRibbons = ribbonProgress.allRibbons.filter((r) => r.generation === gen);

			// 各リボンの取得状態
			const urgentRibbons = genRibbons.filter(
				(r) => ribbonProgress.ribbonStateMap.get(r.id) === 'urgent'
			);
			const missedRibbons = genRibbons.filter(
				(r) => ribbonProgress.ribbonStateMap.get(r.id) === 'missed'
			);
			const futureRibbons = genRibbons.filter(
				(r) => ribbonProgress.ribbonStateMap.get(r.id) === 'future'
			);
			const lockedRibbons = genRibbons.filter(
				(r) => ribbonProgress.ribbonStateMap.get(r.id) === 'locked'
			);

			// 通常（obtained / available）
			const normalRibbons = genRibbons.filter((r) => {
				const state = ribbonProgress.ribbonStateMap.get(r.id);
				return state === 'obtained' || state === 'available';
			});

			// フェーズ判定（マイポケモン未選択時は 'future' を返す）
			const currentGen = ribbonProgress.genMap.get(
				ribbonProgress.activeMyPokemon?.currentGame ?? ''
			);
			const phase: 'past' | 'current' | 'future' = currentGen === undefined
				? 'future'
				: gen < currentGen
					? 'past'
					: gen === currentGen
						? 'current'
						: 'future';

			return {
				generation: gen,
				phase,
				ribbons: normalRibbons,
				urgentRibbons,
				missedRibbons,
				futureRibbons,
				lockedRibbons
			} satisfies RibbonGroup;
		})
	);

	// 世代間の転送ルート取得
	function getTransferRoutes(fromGen: number): TransferRoute[] {
		return TRANSFER_ROUTES.filter((r) => r.fromGeneration === fromGen);
	}

	// 転送ルートが利用可能かどうか
	function isRouteAvailable(route: TransferRoute): boolean {
		return setup.evaluateRouteAvailability(route).available;
	}

	function getMissingHardware(route: TransferRoute): string[] {
		return setup.getRouteMissingHardware(route);
	}

	function getSatisfiedOptionLabel(route: TransferRoute): string | undefined {
		return setup.evaluateRouteAvailability(route).satisfiedOption?.label;
	}

	function handleConfirmRoute(routeId: string): void {
		const myPokemonId = ribbonProgress.activeMyPokemonId;
		if (!myPokemonId) {
			toast.info('マイポケモンを選択してから確認してください');
			return;
		}
		ribbonProgress.confirmIrreversibleTransfer(myPokemonId, routeId);
		toast.success('不可逆転送の確認を記録しました');
	}

	// リボントグルハンドラ
	function handleToggle(ribbonId: string): void {
		if (!ribbonProgress.activeMyPokemonId) {
			toast.info('マイポケモンを選択してください');
			return;
		}
		ribbonProgress.toggleRibbon(ribbonId);
	}

	// マイポケモン未選択かどうか
	const hasNoPokemon: boolean = $derived(ribbonProgress.activeMyPokemonId === null);
</script>

<div class="mx-auto max-w-3xl px-2 py-4 md:px-4 md:py-8">
	<!-- ページヘッダー -->
	<div class="mb-6">
		<h1 class="text-xl font-bold text-gray-900 md:text-2xl">🗺️ ロードマップ</h1>
		<p class="mt-1 text-sm text-gray-500">世代順にリボンを取得していくロードマップです</p>
	</div>

	<div class="mb-6 rounded-xl border border-red-200 bg-linear-to-r from-red-50 to-amber-50 p-4 shadow-sm">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<p class="text-xs font-semibold tracking-wide text-red-700">不可逆転送セーフティチェック</p>
				<h2 class="mt-0.5 text-base font-bold text-gray-900">転送前に必ず確認するポイント</h2>
				<p class="mt-1 text-xs text-gray-700">確認記録を残してから次世代へ進むことで、取り返し不能ミスを防げます。</p>
			</div>
			{#if ribbonProgress.activeMyPokemon}
				<span class="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
					対象: {ribbonProgress.activeMyPokemon.nickname || ribbonProgress.selectedPokemon?.name || '選択中ポケモン'}
				</span>
			{/if}
		</div>
		<div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
			<div class="rounded-lg border border-red-200 bg-white px-3 py-2">
				<p class="text-[11px] text-gray-500">不可逆ルート総数</p>
				<p class="text-lg font-bold text-red-700">{irreversibleRoutes.length}</p>
			</div>
			<div class="rounded-lg border border-blue-200 bg-white px-3 py-2">
				<p class="text-[11px] text-gray-500">利用可能ルート</p>
				<p class="text-lg font-bold text-blue-700">{availableIrreversibleCount}</p>
			</div>
			<div class="rounded-lg border border-emerald-200 bg-white px-3 py-2">
				<p class="text-[11px] text-gray-500">確認記録済み</p>
				<p class="text-lg font-bold text-emerald-700">{confirmedIrreversibleCount}</p>
			</div>
		</div>
		<p class="mt-2 text-[11px] text-gray-600">手順: 1) 必要手段を確認 2) 「不可逆」をチェック 3) 最終同意で記録</p>
	</div>

	<!-- マイポケモン未選択バナー -->
	{#if hasNoPokemon}
		<div class="mb-6 flex items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
			<span>ポケモンが選ばれていません</span>
			<a href="/" class="shrink-0 font-medium text-sky-700 underline hover:text-sky-900">← トラッカーで選ぶ</a>
		</div>
	{/if}

	<!-- 世代別セクション -->
	<div class="flex flex-col gap-1">
		{#each ribbonGroups as group, i (group.generation)}
			<!-- 世代セクション -->
			<RoadmapStep
				{group}
				genProgress={ribbonProgress.generationProgress[group.generation]}
				onToggle={handleToggle}
			/>

			<!-- 世代間の転送矢印（最後の世代以外） -->
			{#if i < GENERATIONS.length - 1}
				{@const routes = getTransferRoutes(group.generation)}
				{#if routes.length > 0}
					<div class="rounded-xl border border-gray-100 bg-gray-50/80 px-2 py-3">
						<p class="mb-2 px-1 text-xs font-medium text-gray-500">第{group.generation}世代からの転送判定</p>
						<div class="flex flex-col gap-2">
						{#each routes as route (route.id)}
							<TransferArrow
								{route}
								isAvailable={isRouteAvailable(route)}
								missingHardware={getMissingHardware(route)}
								satisfiedOptionLabel={getSatisfiedOptionLabel(route)}
								lastConfirmedDate={
									ribbonProgress.activeMyPokemonId
										? ribbonProgress.getRouteConfirmationDate(ribbonProgress.activeMyPokemonId, route.id)
										: undefined
								}
								onConfirm={() => handleConfirmRoute(route.id)}
							/>
						{/each}
						</div>
					</div>
				{/if}
			{/if}
		{/each}
	</div>
</div>
