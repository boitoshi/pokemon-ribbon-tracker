<template>
  <div class="mb-4 p-4 bg-gray-50 rounded-lg">
    <h3 class="font-bold mb-2">リボンフィルター</h3>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 世代フィルター -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">世代</label>
        <div class="flex flex-wrap gap-2">
          <button
            :class="[
              'px-2 py-1 text-xs rounded',
              !activeFilters.generation ? 'bg-blue-500 text-white' : 'bg-gray-200',
            ]"
            @click="toggleGeneration(null)"
          >
            すべて
          </button>
          <button
            v-for="gen in [3, 4, 5, 6, 7, 8]"
            :key="`gen-${gen}`"
            :class="[
              'px-2 py-1 text-xs rounded',
              activeFilters.generation === gen ? 'bg-blue-500 text-white' : 'bg-gray-200',
            ]"
            @click="toggleGeneration(gen)"
          >
            第{{ gen }}世代
          </button>
        </div>
      </div>

      <!-- タイプフィルター -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">リボンタイプ</label>
        <div class="flex flex-wrap gap-2">
          <button
            :class="[
              'px-2 py-1 text-xs rounded',
              !activeFilters.type ? 'bg-blue-500 text-white' : 'bg-gray-200',
            ]"
            @click="toggleType(null)"
          >
            すべて
          </button>
          <button
            v-for="type in ribbonTypes"
            :key="`type-${type.id}`"
            :class="[
              'px-2 py-1 text-xs rounded',
              activeFilters.type === type.id ? 'bg-blue-500 text-white' : 'bg-gray-200',
            ]"
            @click="toggleType(type.id)"
          >
            {{ type.name }}
          </button>
        </div>
      </div>

      <!-- 取得状況フィルター -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">取得状況</label>
        <div class="flex flex-wrap gap-2">
          <button
            :class="[
              'px-2 py-1 text-xs rounded',
              !activeFilters.status ? 'bg-blue-500 text-white' : 'bg-gray-200',
            ]"
            @click="toggleStatus(null)"
          >
            すべて
          </button>
          <button
            :class="[
              'px-2 py-1 text-xs rounded',
              activeFilters.status === 'obtained' ? 'bg-blue-500 text-white' : 'bg-gray-200',
            ]"
            @click="toggleStatus('obtained')"
          >
            取得済み
          </button>
          <button
            :class="[
              'px-2 py-1 text-xs rounded',
              activeFilters.status === 'not-obtained' ? 'bg-blue-500 text-white' : 'bg-gray-200',
            ]"
            @click="toggleStatus('not-obtained')"
          >
            未取得
          </button>
        </div>
      </div>
    </div>

    <!-- 検索バー -->
    <div class="mt-3">
      <label class="block text-sm font-medium text-gray-700 mb-1">リボン名検索</label>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="リボン名を入力..."
        class="w-full px-3 py-2 border rounded-md"
        @input="search"
      />
    </div>

    <!-- フィルターリセット -->
    <div class="mt-3 text-right">
      <button class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm" @click="resetFilters">
        フィルターをリセット
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FilterState } from '~/types';

const emit = defineEmits<{
  (e: 'filter-change', filters: FilterState): void;
}>();

// フィルター状態
const activeFilters = reactive<Omit<FilterState, 'search'>>({
  generation: null,
  type: null,
  status: null,
});

const searchQuery = ref<string>('');

// リボンタイプのリスト
const ribbonTypes: { id: string; name: string }[] = [
  { id: 'champion', name: 'チャンピオン' },
  { id: 'contest', name: 'コンテスト' },
  { id: 'battle', name: 'バトル施設' },
  { id: 'memory', name: '思い出' },
  { id: 'event', name: 'イベント' },
];

// 世代フィルター切り替え
const toggleGeneration = (generation: number | null): void => {
  activeFilters.generation = activeFilters.generation === generation ? null : generation;
  emitFilterChange();
};

// タイプフィルター切り替え
const toggleType = (type: string | null): void => {
  activeFilters.type = activeFilters.type === type ? null : type;
  emitFilterChange();
};

// 取得状況フィルター切り替え
const toggleStatus = (status: FilterState['status']): void => {
  activeFilters.status = activeFilters.status === status ? null : status;
  emitFilterChange();
};

// 検索
const search = (): void => {
  emitFilterChange();
};

// フィルターリセット
const resetFilters = (): void => {
  activeFilters.generation = null;
  activeFilters.type = null;
  activeFilters.status = null;
  searchQuery.value = '';
  emitFilterChange();
};

// フィルター変更をイベントとして発信
const emitFilterChange = (): void => {
  emit('filter-change', {
    ...activeFilters,
    search: searchQuery.value,
  });
};
</script>
