<script lang="ts">
	import type { TransferRoute } from '$lib/types';
	import { getTransferUxText } from '$lib/utils/transferUxText';

	let {
		route,
		isAvailable,
		missingHardware = [],
		satisfiedOptionLabel,
		lastConfirmedDate,
		onConfirm
	}: {
		route: TransferRoute;
		isAvailable: boolean;
		missingHardware?: string[];
		satisfiedOptionLabel?: string;
		lastConfirmedDate?: string;
		onConfirm?: () => void;
	} = $props();

	let isExpanded = $state(false);
	let confirmStep = $state<0 | 1 | 2>(0);
	let acknowledgeIrreversible = $state(false);
	let finalAgreement = $state(false);

	const hardwareLabels: Record<string, string> = {
		gba: 'GBA',
		ds_lite: 'DS / DS Lite',
		dsi: 'DSi',
		'3ds': '3DS',
		switch: 'Switch'
	};

	const canStartConfirm = $derived(isAvailable && route.isIrreversible);
	const uxText = $derived(getTransferUxText(route.explanationKey));
	const isConfirmed = $derived(!!lastConfirmedDate);

	function beginConfirmation(): void {
		if (!canStartConfirm) return;
		confirmStep = 1;
		acknowledgeIrreversible = false;
		finalAgreement = false;
	}

	function moveToFinalStep(): void {
		if (!acknowledgeIrreversible) return;
		confirmStep = 2;
	}

	function commitConfirmation(): void {
		if (!finalAgreement) return;
		onConfirm?.();
		confirmStep = 0;
		acknowledgeIrreversible = false;
		finalAgreement = false;
	}
</script>

<div class="flex flex-col items-center">
	<!-- 上矢印ライン -->
	<div class="h-4 w-0.5 {isAvailable ? 'bg-blue-300' : 'bg-gray-300'}"></div>

	<!-- 転送カード -->
	<div
		class="w-full max-w-xl rounded-xl border px-4 py-3 text-center shadow-sm transition-colors
			{isConfirmed && route.isIrreversible && confirmStep === 0
				? 'border-green-300 bg-green-50'
				: isAvailable
					? route.isDeprecated
						? 'border-orange-200 bg-orange-50'
						: route.isIrreversible
							? 'border-red-200 bg-red-50'
							: 'border-blue-200 bg-blue-50'
					: 'border-gray-200 bg-gray-50'}"
	>
		<div class="mb-2 flex flex-wrap items-center justify-center gap-1.5">
			<span class="rounded-full px-2 py-0.5 text-[11px] font-semibold {isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}">
				{isAvailable ? '利用可能' : '利用不可'}
			</span>
			{#if route.isIrreversible}
				<span class="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">不可逆</span>
			{/if}
			{#if route.isDeprecated}
				<span class="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">サービス注意</span>
			{/if}
		</div>

		<!-- メソッド名 -->
		<div class="flex items-center justify-center gap-1.5">
			<span
				class="text-sm font-bold
					{isAvailable
						? route.isDeprecated
							? 'text-orange-800'
							: route.isIrreversible
								? 'text-red-800'
								: 'text-blue-800'
						: 'text-gray-500'}"
			>
				🔄 {route.methodName}
			</span>
			{#if !isAvailable}
				<span class="text-xs text-red-500">❌ 機材不足</span>
			{/if}
		</div>

		<!-- 廃止警告 -->
		{#if route.isDeprecated && route.deprecationNote}
			<p class="mt-1 text-xs text-orange-700">{route.deprecationNote}</p>
		{/if}

		<!-- 必要ハード -->
		{#if route.requirements.anyOf.length > 0}
			<div class="mt-2 flex flex-wrap justify-center gap-1">
				{#if isAvailable}
					{#if satisfiedOptionLabel}
						<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
							✅ {satisfiedOptionLabel}
						</span>
					{/if}
				{:else}
					{#each route.requirements.anyOf as option (option.id)}
						<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
							{option.label}
						</span>
					{/each}
				{/if}
			</div>
		{/if}

		{#if !isAvailable && missingHardware.length > 0}
			<p class="mt-1 text-xs text-red-600">
				不足: {missingHardware.map((hw) => hardwareLabels[hw] ?? hw).join(' / ')}
			</p>
		{/if}

		<!-- ハードウェアメモ -->
		{#if route.hardwareNote}
			<p class="mt-1 text-xs text-gray-500">{route.hardwareNote}</p>
		{/if}

		<!-- アコーディオン：詳細 -->
		<button
			class="mt-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
			onclick={() => (isExpanded = !isExpanded)}
		>
			{isExpanded ? '▲ 詳細を閉じる' : '▼ 詳細を見る'}
		</button>

		{#if isExpanded}
			<div class="mt-2 text-left">
				{#if route.dailyLimit}
					<p class="text-xs text-gray-600">1日{route.dailyLimit}匹まで</p>
				{/if}
				{#if route.restrictions.length > 0}
					<ul class="mt-1 space-y-0.5">
						{#each route.restrictions as r (r)}
							<li class="text-xs text-gray-500">• {r}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}

		{#if route.isIrreversible}
			<div class="irreversible-warning mt-3 rounded-lg border p-3 text-left">
				<p class="text-sm font-semibold">⚠ {uxText.irreversibleAlert}</p>

				{#if confirmStep === 0}
					{#if isConfirmed}
						<!-- 確認済み状態 -->
						<div class="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-green-300 bg-green-100 px-3 py-2">
							<span class="font-bold text-green-700">✅ 確認済み</span>
							<span class="text-xs text-green-600">最終確認日: {lastConfirmedDate}</span>
						</div>
						<button
							class="mt-1.5 text-xs text-red-500 underline hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
							onclick={beginConfirmation}
							disabled={!canStartConfirm}
						>記録し直す</button>
					{:else}
						<!-- 未確認状態：大きな確認ボタン -->
						<button
							class="mt-3 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:bg-gray-400"
							onclick={beginConfirmation}
							disabled={!canStartConfirm}
						>
							不可逆転送を確認する
						</button>
					{/if}
				{:else if confirmStep === 1}
					<!-- Step 1: 理解確認チェックボックス -->
					<label class="mt-3 flex cursor-pointer items-start gap-2 text-sm">
						<input type="checkbox" bind:checked={acknowledgeIrreversible} class="mt-0.5 h-4 w-4 shrink-0 accent-red-600" />
						<span>{uxText.confirmStep1Label}</span>
					</label>
					<div class="mt-3 flex gap-2">
						<button
							class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
							onclick={() => (confirmStep = 0)}
						>キャンセル</button>
						<button
							class="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
							onclick={moveToFinalStep}
							disabled={!acknowledgeIrreversible}
						>最終確認へ →</button>
					</div>
				{:else}
					<!-- Step 2: 最終同意 -->
					<p class="mt-3 text-sm font-semibold text-red-700">最終同意: {uxText.finalAgreementLabel}</p>
					<label class="mt-2 flex cursor-pointer items-start gap-2 text-sm">
						<input type="checkbox" bind:checked={finalAgreement} class="mt-0.5 h-4 w-4 shrink-0 accent-red-600" />
						<span>{uxText.finalAgreementLabel}</span>
					</label>
					<div class="mt-3 flex gap-2">
						<button
							class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
							onclick={() => (confirmStep = 1)}
						>← 戻る</button>
						<button
							class="flex-1 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-gray-400"
							onclick={commitConfirmation}
							disabled={!finalAgreement}
						>確認を記録</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- 下矢印ライン -->
	<div class="h-4 w-0.5 {isAvailable ? 'bg-blue-300' : 'bg-gray-300'}"></div>
	<div
		class="h-0 w-0 border-l-4 border-r-4 border-t-8 border-solid border-l-transparent border-r-transparent
			{isAvailable ? 'border-t-blue-300' : 'border-t-gray-300'}"
	></div>
</div>
