<script lang="ts">
	import type { MyPokemon } from '$lib/types';
	import { ribbonProgress, type RibbonCount } from '$lib/stores/ribbonProgress.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { DEFAULT_GEN_THEME, getGenTheme, type GenTheme } from '$lib/utils/genTheme';
	import { getMyPokemonDisplayName, getMyPokemonImage } from '$lib/utils/myPokemonDisplay';

	/** 割合をパーセント表記にするときの倍率 */
	const PERCENT_SCALE = 100;

	/** 世代別ミニ進捗の1行分 */
	interface GenerationProgressEntry {
		gen: number;
		obtained: number;
		total: number;
	}

	/** 主役ポケモン（未選択なら null。未選択のときはカードごと描画しない） */
	const active: MyPokemon | null = $derived(ribbonProgress.activeMyPokemon);

	/** 主役の出身世代（出身ソフトが不明なら undefined） */
	const activeGen: number | undefined = $derived(
		active ? ribbonProgress.genMap.get(active.originGame) : undefined
	);

	/** 世代カラーテーマ（世代不明ならフォールバック） */
	const theme: GenTheme = $derived(
		activeGen === undefined ? DEFAULT_GEN_THEME : getGenTheme(activeGen)
	);

	/** 表示名（ニックネーム優先） */
	const displayName: string = $derived(
		active ? getMyPokemonDisplayName(active, ribbonProgress.allPokemon) : ''
	);

	/** 主役の画像URL */
	const image: string | undefined = $derived(
		active ? getMyPokemonImage(active.pokemonId, ribbonProgress.allPokemon) : undefined
	);

	/**
	 * 進捗は主役個体に固定した集計を使う。
	 * generationProgress 由来の値は「いま画面で見ている種族（selectedPokemon）」に依存して
	 * 分母が動くので、同じ画面に出ている主役バーと数字が食い違ってしまう。
	 */
	const ribbonCount: RibbonCount = $derived(ribbonProgress.activeRibbonCount);

	const completionPercent: number = $derived(
		ribbonCount.total > 0
			? Math.round((ribbonCount.obtained / ribbonCount.total) * PERCENT_SCALE)
			: 0
	);

	const remainingCount: number = $derived(ribbonCount.total - ribbonCount.obtained);

	/** 取り逃し件数 */
	const missedCount: number = $derived(
		ribbonProgress.allRibbons.filter((r) => ribbonProgress.getRibbonState(r) === 'missed').length
	);

	/** 世代別ミニ進捗（世代順） */
	const generationProgressEntries: GenerationProgressEntry[] = $derived(
		Object.entries(ribbonProgress.generationProgress)
			.map(([gen, data]) => ({ gen: Number(gen), ...data }))
			.sort((a, b) => a.gen - b.gen)
	);

	/** 不可逆転送の最終確認日 */
	const lastConfirmedDate: string | undefined = $derived(
		active ? ribbonProgress.getLastConfirmationDate(active.id) : undefined
	);

	/** リセット確認の表示状態 */
	let showResetConfirm = $state(false);

	/** 世代別ミニ進捗のバー幅（％） */
	function genPercent(obtained: number, total: number): number {
		return total > 0 ? Math.round((obtained / total) * PERCENT_SCALE) : 0;
	}

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
</script>

<!--
	主役ポケモンのヒーローカード。
	縦をそれなりに食うので、一覧モードでだけ出すこと（スワイプモードでは主役バーで足りる）。
-->
{#if active}
	<div class="mb-4 overflow-hidden rounded-xl border shadow-sm {theme.border}">
		<!-- ヒーローカード本体 -->
		<div class="bg-linear-to-r {theme.gradient} p-4">
			<div class="flex items-center gap-4">
				<!-- ポケモン画像（大） -->
				<div class="h-24 w-24 shrink-0">
					{#if image}
						<img src={image} alt={displayName} class="h-full w-full object-contain drop-shadow-md" />
					{:else}
						<div
							class="flex h-full w-full items-center justify-center rounded-full bg-white/50 text-4xl"
						>
							🐾
						</div>
					{/if}
				</div>
				<!-- テキスト情報 -->
				<div class="min-w-0 flex-1">
					<h2 class="text-xl font-bold {theme.accent}">{displayName}</h2>
					{#if activeGen}
						<p class="mb-2 text-sm text-gray-500">Gen{activeGen}</p>
					{/if}
					<!-- プログレスバー -->
					<div class="mb-1 h-3 w-full overflow-hidden rounded-full bg-white/70">
						<div
							class="h-full rounded-full bg-linear-to-r from-green-400 to-emerald-500 transition-all duration-500"
							style="width: {completionPercent}%"
						></div>
					</div>
					<div class="flex items-center justify-between text-xs text-gray-600">
						<span>{ribbonCount.obtained}個取得 / 残り{remainingCount}個</span>
						<span class="font-bold {theme.accent}">{completionPercent}%</span>
					</div>
					{#if missedCount > 0}
						<p class="text-xs font-medium text-red-600">❌ 取り逃し {missedCount}個</p>
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
				type="button"
				class="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
				onclick={handleExport}>エクスポート ▼</button
			>
			<label class="cursor-pointer rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200">
				インポート
				<input type="file" accept=".json" class="hidden" onchange={handleImport} />
			</label>
			<button
				type="button"
				class="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
				onclick={handleResetProgress}>リセット</button
			>
		</div>

		{#if showResetConfirm}
			<div class="border-t border-red-100 bg-white/80 px-3 py-2">
				<div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
					<p class="mb-2 text-red-700">リボン進捗をリセットしますか？</p>
					<div class="flex gap-2">
						<button
							type="button"
							class="rounded bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300"
							onclick={() => (showResetConfirm = false)}>キャンセル</button
						>
						<button
							type="button"
							class="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
							onclick={executeResetProgress}>リセット</button
						>
					</div>
				</div>
			</div>
		{/if}

		<!-- 世代別ミニ進捗グリッド -->
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
							style="width: {genPercent(obtained, total)}%"
						></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
