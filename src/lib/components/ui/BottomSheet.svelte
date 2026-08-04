<script lang="ts">
	import type { Snippet } from 'svelte';
	import { focusTrap } from '$lib/actions/focusTrap';

	/**
	 * 汎用ボトムシート。
	 *
	 * - 背景オーバーレイのクリック / Escape で閉じる（どちらも onClose を呼ぶ）
	 * - 中身はフォーカストラップされる
	 * - 閉じたあとのフォーカス復帰は呼び出し側の責務（トリガー要素を保持しておくこと）
	 */
	interface Props {
		/** シートの表示状態 */
		open: boolean;
		/** 閉じる要求（オーバーレイクリック / Escape / ✕ボタン） */
		onClose: () => void;
		/** ヘッダーに出すタイトル（省略時はヘッダーに✕ボタンのみ） */
		title?: string;
		/** シート本体の中身 */
		children: Snippet;
	}

	const { open, onClose, title, children }: Props = $props();
</script>

{#if open}
	<!-- バックドロップ（クリックで閉じる） -->
	<div class="fixed inset-0 z-55 bg-black/50" role="presentation" onclick={onClose}></div>

	<!-- シート本体 -->
	<div
		class="fixed inset-x-0 bottom-0 z-60 mx-auto max-h-[80vh] w-full max-w-2xl overflow-y-auto
			rounded-t-2xl bg-white shadow-2xl"
		role="dialog"
		aria-modal="true"
		aria-label={title ?? 'ダイアログ'}
		use:focusTrap={{ onEscape: onClose }}
	>
		<div
			class="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-white px-4 py-3"
		>
			{#if title}
				<h2 class="text-sm font-bold">{title}</h2>
			{:else}
				<span></span>
			{/if}
			<button
				type="button"
				class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				aria-label="閉じる"
				onclick={onClose}
			>
				✕
			</button>
		</div>
		<div class="p-3">
			{@render children()}
		</div>
	</div>
{/if}
