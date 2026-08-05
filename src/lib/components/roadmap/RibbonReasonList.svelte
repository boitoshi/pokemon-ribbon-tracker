<script lang="ts">
	import type { Ribbon, RibbonState } from '$lib/types';
	import RibbonIcon from '$lib/components/ui/RibbonIcon.svelte';
	import { getCategoryStyle } from '$lib/utils/ribbonCategory';
	import { getRibbonStateStyle } from '$lib/utils/ribbonStateStyle';

	/**
	 * 理由の文を持つリボンを並べるリスト。
	 *
	 * グリッドは多数を面で見るための形で、1件ずつ文を読ませる用途には向かない。
	 * 取り逃し・取得不可はたいてい数個で、かつ1件あたり理由の文が付くので、
	 * 「1件あたり文が付くならリスト」の判断基準に従ってリストを器にしている。
	 *
	 * 改訂前は理由が hover ツールチップと 8px ラベルの二重掲載だった。
	 * タッチでは前者が出ず、後者は読めないので、事実上どこにも表示されていなかった。
	 */
	let {
		ribbons,
		state,
		reasonFor,
		countLabel,
		description
	}: {
		ribbons: Ribbon[];
		state: Extract<RibbonState, 'missed' | 'locked'>;
		/** リボンごとの理由文を返す */
		reasonFor: (_ribbon: Ribbon) => string[];
		/** 見出しのバッジ文言。件数は呼び出し側が埋める */
		countLabel: string;
		/** 見出しに添える1文 */
		description: string;
	} = $props();

	const isMissed = $derived(state === 'missed');
	const stateStyle = $derived(getRibbonStateStyle(state));
</script>

<!--
	赤は「左の罫・見出しバッジ・斜線」の3点だけに絞り、地は白に戻す。
	改訂前は bg-red-100 の丸に text-red-400 ＋ opacity-80 でコントラスト比が 2 前後だった。
-->
<div
	class="overflow-hidden rounded-lg border bg-white {isMissed
		? 'border-red-200'
		: 'border-gray-200'}"
>
	<div
		class="flex flex-wrap items-baseline gap-2 border-b px-4 py-3 {isMissed
			? 'border-red-100 bg-red-50'
			: 'border-gray-100 bg-gray-50'}"
	>
		<span
			class="rounded-full px-2.5 py-0.5 text-xs font-bold text-white {isMissed
				? 'bg-state-missed-mark'
				: 'bg-gray-500'}"
		>
			{countLabel}
		</span>
		<span class="text-[12.5px] leading-relaxed {isMissed ? 'text-red-900' : 'text-gray-600'}">
			{description}
		</span>
	</div>

	<ul class="flex flex-col">
		{#each ribbons as ribbon (ribbon.id)}
			{@const category = getCategoryStyle(ribbon)}
			{@const reasons = reasonFor(ribbon)}
			<li
				class="flex items-start gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0
					{isMissed ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-gray-400'}"
			>
				<!-- グリッドと同じ状態表現を 44px で。塗りではなく枠線と斜線で示す -->
				<div class="ribbon-cell ribbon-cell--sm {stateStyle.cellClass} shrink-0">
					<RibbonIcon
						src={ribbon.image_url}
						alt={ribbon.name}
						sizeClass="h-6 w-6 text-lg"
						fallback={category.emoji}
					/>
					{#if stateStyle.strike}
						<span class="ribbon-cell__strike"></span>
					{/if}
				</div>

				<div class="flex min-w-0 flex-1 flex-col gap-1">
					<span class="text-[15px] font-semibold text-gray-900">{ribbon.name}</span>
					<!-- 理由は 13px の本文。hover もタップも要らない -->
					{#each reasons as reason (reason)}
						<span class="text-[13px] leading-relaxed text-gray-600">{reason}</span>
					{/each}
					{#if ribbon.requirements}
						<span class="text-[13px] leading-relaxed text-gray-500">
							必要だった条件: {ribbon.requirements}
						</span>
					{/if}
				</div>

				<!-- 分類＝薄地。一番弱い -->
				<span class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
					{ribbon.category}
				</span>
			</li>
		{/each}
	</ul>
</div>
