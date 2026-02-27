<script lang="ts">
	import type { RibbonGroup, TransferRoute } from '$lib/types';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { setup } from '$lib/stores/setup.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { TRANSFER_ROUTES } from '$lib/data/transfer-routes';
	import RoadmapStep from './RoadmapStep.svelte';
	import TransferArrow from './TransferArrow.svelte';

	const GENERATIONS = [3, 4, 5, 6, 7, 8, 9] as const;

	// 世代別リボングループを計算
	const ribbonGroups: RibbonGroup[] = $derived(
		GENERATIONS.map((gen) => {
			const genRibbons = ribbonProgress.allRibbons.filter((r) => r.generation === gen);

			// 緊急（レベル制限・未取得）
			const urgentRibbons = genRibbons.filter(
				(r) =>
					r.eligibility?.type === 'level_max' &&
					!ribbonProgress.currentCheckedRibbons.includes(r.id)
			);

			// ロック（所持ゲームがない && セットアップ済み）
			const lockedRibbons = setup.setupCompleted
				? genRibbons.filter(
						(r) =>
							!urgentRibbons.includes(r) &&
							r.games.length > 0 &&
							!r.games.some((g) => setup.ownedGames.includes(g))
					)
				: [];

			// 通常（緊急・ロック以外）
			const normalRibbons = genRibbons.filter(
				(r) => !urgentRibbons.includes(r) && !lockedRibbons.includes(r)
			);

			return { generation: gen, ribbons: normalRibbons, urgentRibbons, lockedRibbons } satisfies RibbonGroup;
		})
	);

	// 世代間の転送ルート取得
	function getTransferRoutes(fromGen: number): TransferRoute[] {
		return TRANSFER_ROUTES.filter((r) => r.fromGeneration === fromGen);
	}

	// 転送ルートが利用可能かどうか
	function isRouteAvailable(route: TransferRoute): boolean {
		return route.hardwareRequired.every((hw) => setup.ownedHardware.includes(hw));
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

	<!-- マイポケモン未選択バナー -->
	{#if hasNoPokemon}
		<div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<p class="text-sm text-blue-700">
					ℹ マイポケモンを選択するとリボン取得状況・進捗が追跡されます
				</p>
				<a
					href="/"
					class="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
				>
					トラッカーでポケモンを選択 →
				</a>
			</div>
		</div>
	{/if}

	<!-- 世代別セクション -->
	<div class="flex flex-col gap-0">
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
					<div class="flex flex-col gap-2 py-2">
						{#each routes as route (route.id)}
							<TransferArrow {route} isAvailable={isRouteAvailable(route)} />
						{/each}
					</div>
				{/if}
			{/if}
		{/each}
	</div>
</div>
