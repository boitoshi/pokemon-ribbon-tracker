<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { ribbonProgress } from '$lib/stores/ribbonProgress.svelte';
	import { setup } from '$lib/stores/setup.svelte';
	import ActivePokemonBar from '$lib/components/ui/ActivePokemonBar.svelte';

	const { children } = $props();

	// 主役バーと所持ソフト文脈をどの画面でも使えるよう、レイアウト側で初期化する
	// （どちらも冪等。各ルートの onMount と二重に呼んでも安全）
	onMount(() => {
		ribbonProgress.init();
		setup.init();
	});

	const navItems = [
		{ href: '/', label: 'さがす', icon: '🔎' },
		{ href: '/roadmap', label: 'ロードマップ', icon: '🗺️' },
		{ href: '/box', label: 'きろく', icon: '📦' },
		{ href: '/guide', label: 'ガイド', icon: '📖' },
		{ href: '/setup', label: '設定', icon: '⚙️' }
	];

	/** base とトレイリングスラッシュを考慮してナビのアクティブ状態を判定する */
	function isActive(pathname: string, href: string): boolean {
		const target = `${base}${href}`;
		return pathname === target || pathname === `${target}/`;
	}
</script>

<svelte:head>
	<title>ポケモンリボン制覇トラッカー</title>
	<meta name="description" content="ポケモンのリボンコンプリートを効率よく管理・計画するツール" />
</svelte:head>

<!--
	アプリシェル。h-dvh + flex 縦積みで「ヘッダー / 主役バー / 本文 / 底部ナビ」の
	高さを確定させ、本文だけがスクロールする形にしている。
	こうすることで各ページが h-full で高さを取れる（QuickCheck のスワイプUIが依存）。
	以前は各ページが calc(100dvh - 5rem) のようにビューポート高さを決め打ちしており、
	上部に要素を足すたびに壊れていた。
-->
<div class="flex h-dvh flex-col bg-gray-50">
	<!-- デスクトップ上部ナビ -->
	<header class="sticky top-0 z-40 hidden border-b border-gray-200 bg-white shadow-sm md:block">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
			<span class="text-lg font-bold text-blue-800">🎀 ポケモンリボン制覇トラッカー</span>
			<nav class="flex gap-1">
				{#each navItems as item (item.href)}
					<a
						href="{base}{item.href}"
						class="rounded-md px-4 py-2 text-sm font-medium transition-colors
							{isActive($page.url.pathname, item.href)
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-600 hover:bg-gray-100'}"
					>
						{item.icon}
						{item.label}
					</a>
				{/each}
			</nav>
		</div>
	</header>

	<!-- 主役ポケモンバー（PC・モバイル共通。主役未選択なら何も描画されない） -->
	<ActivePokemonBar />

	<!-- メインコンテンツ。ここだけがスクロールする -->
	<main class="min-h-0 flex-1 overflow-y-auto">
		{@render children()}
	</main>

	<!-- モバイル底部ナビ。シェルが flex なので fixed をやめ、通常フローで最下段に置く -->
	<nav class="shrink-0 border-t border-gray-200 bg-white md:hidden">
		<div class="flex pb-safe">
			{#each navItems as item (item.href)}
				<a
					href="{base}{item.href}"
					class="flex flex-1 flex-col items-center justify-center py-2 text-xs transition-colors
						{isActive($page.url.pathname, item.href) ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}"
				>
					<span class="text-lg leading-none">{item.icon}</span>
					<span class="mt-0.5">{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
