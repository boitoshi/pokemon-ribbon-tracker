import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const toasts = ref<Toast[]>([]);

/** トースト通知を表示する */
export const useToast = () => {
  const show = (message: string, type: ToastType = 'info', duration = 3000): void => {
    const id = crypto.randomUUID();
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  };

  const remove = (id: string): void => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const success = (message: string): void => show(message, 'success');
  const error = (message: string): void => show(message, 'error');
  const info = (message: string): void => show(message, 'info');

  return { toasts, show, remove, success, error, info };
};
