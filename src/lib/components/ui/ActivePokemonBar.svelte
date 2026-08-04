<script lang="ts">
	import type { RibbonState } from '$lib/types';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { getRibbonEvaluation } from '$lib/utils/ribbonEligibility';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import MyPokemonPanel from '$lib/components/tracker/MyPokemonPanel.svelte';

	/** ボトムシートの表示状態 */
	let sheetOpen = $state(false);
	/** シートを開いたトリガー要素（閉じたときにフォーカス復帰させる） */
	let triggerEl = $state<HTMLElement | null>(null);

	/** 現在の主役ポケモン（未選択なら null） */
	const active = $derived(ribbonProgress.activeMyPokemon);

	/** 主役ポケモンの画像URL */
	const image = $derived(
		active ? ribbonProgress.allPokemon.find((p) => p.id === active.pokemonId)?.image : undefined
	);

	/** 表示名（ニックネーム優先、なければ種族名） */
	const displayName = $derived(
		(() => {
			if (!active) return '';
			if (active.nickname) return active.nickname;
			const detail = ribbonProgress.allPokemon.find((p) => p.id === active.pokemonId);
			return detail?.name ?? active.pokemonId;
		})()
	);

	/** 分母に数える状態（取得済み + まだ取れる） */
	const COUNTABLE_STATES: readonly RibbonState[] = ['obtained', 'available', 'urgent'];

	/**
	 * 主役ポケモンのリボン取得数（取得済み / この個体で狙える数）。
	 *
	 * ストアの generationProgress は ribbonStateMap 経由で「今画面で見ている種族
	 * （selectedPokemon）」に依存するため、他の種族を閲覧中は分母がブレる。
	 * 主役バーは常に「主役の個体そのもの」を出したいので、種族を主役の pokemonId に
	 * 固定して generationProgress と同じ集計ロジックをここで走らせる。
	 * 集計条件（obtained/available/urgent を分母に、手動 missed を除外）は
	 * ribbonProgress.generationProgress と揃えてある。
	 */
	const ribbonCount = $derived(
		(() => {
			if (!active) return { obtained: 0, total: 0 };
			const species = ribbonProgress.allPokemon.find((p) => p.id === active.pokemonId) ?? null;
			const checked = ribbonProgress.currentCheckedSet;
			let obtained = 0;
			let total = 0;
			for (const ribbon of ribbonProgress.allRibbons) {
				const isChecked = checked.has(ribbon.id);
				const evaluation = getRibbonEvaluation(
					ribbon,
					species,
					active,
					isChecked,
					ribbonProgress.genMap
				);
				const manualMissed = active.manualRibbonOverrides?.[ribbon.id]?.isMissed === true;
				const state: RibbonState =
					manualMissed && evaluation.state !== 'obtained' ? 'missed' : evaluation.state;
				if (!COUNTABLE_STATES.includes(state)) continue;
				total++;
				if (state === 'obtained') obtained++;
			}
			return { obtained, total };
		})()
	);

	function openSheet(e: MouseEvent): void {
		triggerEl = e.currentTarget as HTMLElement;
		sheetOpen = true;
	}

	function closeSheet(): void {
		sheetOpen = false;
		triggerEl?.focus();
		triggerEl = null;
	}
</script>

<!-- 主役バー（主役未選択のときは丸ごと描画しない） -->
{#if active}
	<div class="border-b border-blue-100 bg-blue-50">
		<button
			type="button"
			class="mx-auto flex h-10 w-full max-w-7xl items-center gap-2 px-3 text-left
				transition-colors hover:bg-blue-100 active:bg-blue-200"
			aria-haspopup="dialog"
			aria-expanded={sheetOpen}
			onclick={openSheet}
		>
			<span class="shrink-0 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
				主役
			</span>

			{#if image}
				<img src={image} alt="" class="h-8 w-8 shrink-0 object-contain" />
			{:else}
				<span class="h-8 w-8 shrink-0 rounded-full bg-gray-200"></span>
			{/if}

			<span class="truncate text-sm font-semibold text-gray-800">{displayName}</span>
			<span class="shrink-0 text-xs text-gray-500">Lv.{active.level}</span>

			{#if ribbonCount.total > 0}
				<span class="ml-auto shrink-0 text-xs font-bold tabular-nums text-blue-700">
					{ribbonCount.obtained}/{ribbonCount.total}
				</span>
			{:else}
				<span class="ml-auto"></span>
			{/if}
			<span class="shrink-0 text-xs text-gray-400" aria-hidden="true">▾</span>
			<span class="sr-only">主役ポケモンを切り替える</span>
		</button>
	</div>
{/if}

<!-- 切り替えシート（主役が消えても開いたままにして選び直せるようにする） -->
<BottomSheet open={sheetOpen} onClose={closeSheet} title="主役ポケモンを切り替え">
	<!-- シートを開いた時点で一覧が見えるよう、パネルは開いた状態で始める -->
	<MyPokemonPanel defaultOpen />
</BottomSheet>
