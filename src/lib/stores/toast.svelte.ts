/** トースト通知の型定義 */
export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
	duration: number;
}

/** トースト通知を管理するストア */
class ToastStore {
	toasts = $state<Toast[]>([]);

	/** トーストを表示する */
	show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000): void {
		const id = crypto.randomUUID();
		this.toasts = [...this.toasts, { id, message, type, duration }];
		setTimeout(() => {
			this.remove(id);
		}, duration);
	}

	/** 成功トーストを表示する */
	success(message: string): void {
		this.show(message, 'success');
	}

	/** エラートーストを表示する */
	error(message: string): void {
		this.show(message, 'error');
	}

	/** 情報トーストを表示する */
	info(message: string): void {
		this.show(message, 'info');
	}

	/** 指定IDのトーストを削除する */
	remove(id: string): void {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}
}

export const toast = new ToastStore();
