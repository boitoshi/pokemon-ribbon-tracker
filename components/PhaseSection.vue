<template>
  <div class="mb-3 border rounded-lg overflow-hidden">
    <!-- ヘッダー -->
    <button
      class="w-full flex items-center justify-between px-3 py-2.5 text-left"
      :class="{
        'bg-red-50 border-b border-red-200': color === 'red',
        'bg-yellow-50 border-b border-yellow-200': color === 'yellow',
        'bg-green-50 border-b border-green-200': color === 'green',
        'bg-gray-50 border-b border-gray-200': color === 'gray',
      }"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-2">
        <!-- フェーズカラーアイコン -->
        <span
          class="text-xs font-bold"
          :class="{
            'text-red-600': color === 'red',
            'text-yellow-600': color === 'yellow',
            'text-green-600': color === 'green',
            'text-gray-400': color === 'gray',
          }"
        >
          {{ colorIcon }}
        </span>
        <span
          class="font-semibold text-sm"
          :class="{
            'text-red-800': color === 'red',
            'text-yellow-800': color === 'yellow',
            'text-green-800': color === 'green',
            'text-gray-600': color === 'gray',
          }"
        >{{ title }}</span>
        <!-- 取得数バッジ -->
        <span
          class="text-xs px-1.5 py-0.5 rounded-full"
          :class="{
            'bg-red-100 text-red-700': color === 'red',
            'bg-yellow-100 text-yellow-700': color === 'yellow',
            'bg-green-100 text-green-700': color === 'green',
            'bg-gray-100 text-gray-500': color === 'gray',
          }"
        >
          {{ obtainedCount }} / {{ count }}
        </span>
      </div>
      <span class="text-gray-400 text-xs ml-2">{{ isOpen ? '▲' : '▼' }}</span>
    </button>

    <!-- ノート（フェーズ説明） -->
    <div
      v-if="note && isOpen"
      class="px-3 py-1.5 text-xs border-b"
      :class="{
        'bg-red-50 text-red-700 border-red-100': color === 'red',
        'bg-yellow-50 text-yellow-700 border-yellow-100': color === 'yellow',
        'bg-green-50 text-green-700 border-green-100': color === 'green',
        'bg-gray-50 text-gray-500 border-gray-100': color === 'gray',
      }"
    >
      {{ note }}
    </div>

    <!-- コンテンツ -->
    <div v-if="isOpen">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
  count: number;
  obtainedCount: number;
  color: 'red' | 'yellow' | 'green' | 'gray';
  note?: string;
  defaultOpen: boolean;
}>();

const isOpen = ref(props.defaultOpen);

const colorIcon = {
  red: '⚠',
  yellow: '🎪',
  green: '✦',
  gray: '—',
}[props.color];
</script>
