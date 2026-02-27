<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	const { children } = $props();

	const navItems = [
		{ href: '/', label: 'トラッカー', icon: '🎀' },
		{ href: '/roadmap', label: 'ロードマップ', icon: '🗺️' },
		{ href: '/guide', label: 'ガイド', icon: '📖' },
		{ href: '/setup', label: '設定', icon: '⚙️' }
	];
</script>

<svelte:head>
	<title>ポケモンリボン制覇トラッカー</title>
	<meta name="description" content="ポケモンのリボンコンプリートを効率よく管理・計画するツール" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- デスクトップ上部ナビ -->
	<header class="sticky top-0 z-40 hidden border-b border-gray-200 bg-white shadow-sm md:block">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
			<span class="text-lg font-bold text-blue-800">🎀 ポケモンリボン制覇トラッカー</span>
			<nav class="flex gap-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="rounded-md px-4 py-2 text-sm font-medium transition-colors
							{$page.url.pathname === item.href
							? 'bg-blue-100 text-blue-700'
							: 'text-gray-600 hover:bg-gray-100'}"
					>
						{item.icon} {item.label}
					</a>
				{/each}
			</nav>
		</div>
	</header>

	<!-- メインコンテンツ -->
	<main class="pb-20 md:pb-0">
		{@render children()}
	</main>

	<!-- モバイル底部ナビ -->
	<nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white md:hidden">
		<div class="flex">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex flex-1 flex-col items-center justify-center py-2 text-xs transition-colors
						{$page.url.pathname === item.href
						? 'text-blue-600'
						: 'text-gray-500 hover:text-gray-700'}"
				>
					<span class="text-lg leading-none">{item.icon}</span>
					<span class="mt-0.5">{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
