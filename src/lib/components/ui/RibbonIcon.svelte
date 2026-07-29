<script lang="ts">
	/**
	 * リボン/あかし画像アイコン。
	 * 画像が未配置（404）や読み込み失敗のときは絵文字フォールバックを表示する。
	 */
	let {
		src,
		alt,
		sizeClass = 'h-6 w-6',
		fallback = '🎀'
	}: {
		src?: string;
		alt: string;
		sizeClass?: string;
		fallback?: string;
	} = $props();

	/** 画像の読み込みに失敗したか */
	let failed = $state<boolean>(false);

	/** src が変わったら失敗状態をリセットする（詳細パネルの遷移などで再利用されるため） */
	$effect(() => {
		void src;
		failed = false;
	});
</script>

{#if src && !failed}
	<img
		{src}
		{alt}
		loading="lazy"
		class="{sizeClass} shrink-0 object-contain"
		onerror={() => (failed = true)}
	/>
{:else}
	<span
		class="{sizeClass} flex shrink-0 items-center justify-center leading-none"
		role="img"
		aria-label={alt}
	>
		{fallback}
	</span>
{/if}
