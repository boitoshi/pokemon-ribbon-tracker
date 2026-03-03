<script lang="ts">
	import { toast } from '$lib/stores/toast.svelte';

	/** タイプ別スタイルマッピング */
	const TYPE_STYLES: Record<string, string> = {
		success: 'bg-green-500 text-white',
		error: 'bg-red-500 text-white',
		info: 'bg-blue-500 text-white'
	};

	/** タイプ別アイコンマッピング */
	const TYPE_ICONS: Record<string, string> = {
		success: '✓',
		error: '✕',
		info: 'i'
	};
</script>

<!-- トーストスタック（モバイル上部・デスクトップ右下固定） -->
<div class="fixed right-4 top-4 z-50 flex flex-col gap-2 md:bottom-4 md:top-auto">
	{#each toast.toasts as t (t.id)}
		<div
			class="flex min-w-60 max-w-80 items-start gap-2 rounded-lg px-4 py-3 shadow-lg {TYPE_STYLES[t.type] ??
				TYPE_STYLES.info}"
			role="alert"
		>
			<!-- アイコン -->
			<span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
				{TYPE_ICONS[t.type] ?? TYPE_ICONS.info}
			</span>

			<!-- メッセージ -->
			<p class="flex-1 text-sm">{t.message}</p>

			<!-- 閉じるボタン -->
			<button
				onclick={() => toast.remove(t.id)}
				class="shrink-0 rounded p-0.5 text-white/70 hover:text-white"
				aria-label="閉じる"
			>
				✕
			</button>
		</div>
	{/each}
</div>
