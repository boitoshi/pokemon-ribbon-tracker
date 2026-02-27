<script lang="ts">
	import type { TransferRoute } from '$lib/types';

	let {
		route,
		isAvailable
	}: {
		route: TransferRoute;
		isAvailable: boolean;
	} = $props();

	let isExpanded = $state(false);

	const hardwareLabels: Record<string, string> = {
		gba: 'GBA',
		ds_lite: 'DS / DS Lite',
		dsi: 'DSi',
		'3ds': '3DS',
		switch: 'Switch'
	};
</script>

<div class="flex flex-col items-center">
	<!-- 上矢印ライン -->
	<div class="h-4 w-0.5 {isAvailable ? 'bg-blue-300' : 'bg-gray-300'}"></div>

	<!-- 転送カード -->
	<div
		class="w-full max-w-sm rounded-lg border px-4 py-2 text-center
			{isAvailable
				? route.isDeprecated
					? 'border-orange-200 bg-orange-50'
					: 'border-blue-200 bg-blue-50'
				: 'border-gray-200 bg-gray-50'}"
	>
		<!-- メソッド名 -->
		<div class="flex items-center justify-center gap-1.5">
			<span
				class="text-sm font-medium
					{isAvailable
						? route.isDeprecated
							? 'text-orange-800'
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
		{#if route.hardwareRequired.length > 0}
			<div class="mt-1 flex flex-wrap justify-center gap-1">
				{#each route.hardwareRequired as hw (hw)}
					<span
						class="rounded-full px-2 py-0.5 text-xs
							{isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}"
					>
						{hardwareLabels[hw] ?? hw} 必須
					</span>
				{/each}
			</div>
		{/if}

		<!-- ハードウェアメモ -->
		{#if route.hardwareNote}
			<p class="mt-1 text-xs text-gray-500">{route.hardwareNote}</p>
		{/if}

		<!-- アコーディオン：詳細 -->
		<button
			class="mt-1 text-xs text-gray-400 hover:text-gray-600"
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
	</div>

	<!-- 下矢印ライン -->
	<div class="h-4 w-0.5 {isAvailable ? 'bg-blue-300' : 'bg-gray-300'}"></div>
	<div
		class="h-0 w-0 border-l-4 border-r-4 border-t-8 border-solid border-l-transparent border-r-transparent
			{isAvailable ? 'border-t-blue-300' : 'border-t-gray-300'}"
	></div>
</div>
