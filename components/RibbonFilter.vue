<template>
  <div class="mb-2 md:mb-4">
    <!-- 検索バーとフィルタートグル（常時表示） -->
    <div class="flex gap-2 items-center">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="リボンを検索..."
        class="flex-1 px-3 py-2 border rounded-md text-sm"
        @input="search"
      />
      <button
        :class="[
          'flex items-center gap-1 px-3 py-2 rounded text-sm border',
          isExpanded ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ]"
        @click="isExpanded = !isExpanded"
      >
        フィルター
        <span v-if="activeFilterCount > 0" class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold" :class="isExpanded ? 'bg-white text-blue-500' : 'bg-blue-500 text-white'">
          {{ activeFilterCount }}
        </span>
        <span class="text-xs">{{ isExpanded ? '▲' : '▼' }}</span>
      </button>
    </div>

    <!-- アクティブフィルターチップ（フィルター適用中かつ折りたたみ時） -->
    <div v-if="!isExpanded && activeFilterCount > 0" class="flex flex-wrap gap-1 mt-1.5">
      <span
        v-if="activeFilters.generation"
        class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
      >
        第{{ activeFilters.generation }}世代
        <button class="hover:text-blue-500" @click="toggleGeneration(null)">×</button>
      </span>
      <span
        v-if="activeFilters.type"
        class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
      >
        {{ getRibbonTypeName(activeFilters.type) }}
        <button class="hover:text-blue-500" @click="toggleType(null)">×</button>
      </span>
      <span
        v-if="activeFilters.status"
        class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
      >
        {{ activeFilters.status === 'obtained' ? '取得済み' : '未取得' }}
        <button class="hover:text-blue-500" @click="toggleStatus(null)">×</button>
      </span>
    </div>

    <!-- 折りたたみフィルターパネル -->
    <div v-if="isExpanded" class="mt-2 p-3 bg-gray-50 rounded-lg border">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- 世代フィルター -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">世代</label>
          <div class="flex flex-wrap gap-1">
            <button
              :class="['px-2 py-1 text-xs rounded', !activeFilters.generation ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="toggleGeneration(null)"
            >すべて</button>
            <button
              v-for="gen in [3, 4, 5, 6, 7, 8]"
              :key="`gen-${gen}`"
              :class="['px-2 py-1 text-xs rounded', activeFilters.generation === gen ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="toggleGeneration(gen)"
            >第{{ gen }}世代</button>
          </div>
        </div>

        <!-- タイプフィルター -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">リボンタイプ</label>
          <div class="flex flex-wrap gap-1">
            <button
              :class="['px-2 py-1 text-xs rounded', !activeFilters.type ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="toggleType(null)"
            >すべて</button>
            <button
              v-for="type in ribbonTypes"
              :key="`type-${type.id}`"
              :class="['px-2 py-1 text-xs rounded', activeFilters.type === type.id ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="toggleType(type.id)"
            >{{ type.name }}</button>
          </div>
        </div>

        <!-- 取得状況フィルター -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">取得状況</label>
          <div class="flex flex-wrap gap-1">
            <button
              :class="['px-2 py-1 text-xs rounded', !activeFilters.status ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="toggleStatus(null)"
            >すべて</button>
            <button
              :class="['px-2 py-1 text-xs rounded', activeFilters.status === 'obtained' ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="toggleStatus('obtained')"
            >取得済み</button>
            <button
              :class="['px-2 py-1 text-xs rounded', activeFilters.status === 'not-obtained' ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="toggleStatus('not-obtained')"
            >未取得</button>
          </div>
        </div>
      </div>

      <!-- フィルターリセット -->
      <div class="mt-2 text-right">
        <button class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs" @click="resetFilters">
          リセット
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { FilterState } from '~/types';

const emit = defineEmits<{
  (e: 'filter-change', filters: FilterState): void;
}>();

const isExpanded = ref(false);

const activeFilters = reactive<Omit<FilterState, 'search'>>({
  generation: null,
  type: null,
  status: null,
});

const searchQuery = ref<string>('');

const ribbonTypes: { id: string; name: string }[] = [
  { id: 'champion', name: 'チャンピオン' },
  { id: 'contest', name: 'コンテスト' },
  { id: 'battle', name: 'バトル施設' },
  { id: 'memory', name: '思い出' },
  { id: 'event', name: 'イベント' },
  { id: 'special', name: '特殊' },
];

/** アクティブなフィルター数 */
const activeFilterCount = computed(() => {
  let count = 0;
  if (activeFilters.generation) count++;
  if (activeFilters.type) count++;
  if (activeFilters.status) count++;
  return count;
});

/** タイプIDから日本語名を取得 */
const getRibbonTypeName = (typeId: string): string => {
  return ribbonTypes.find((t) => t.id === typeId)?.name ?? typeId;
};

const toggleGeneration = (generation: number | null): void => {
  activeFilters.generation = activeFilters.generation === generation ? null : generation;
  emitFilterChange();
};

const toggleType = (type: string | null): void => {
  activeFilters.type = activeFilters.type === type ? null : type;
  emitFilterChange();
};

const toggleStatus = (status: FilterState['status']): void => {
  activeFilters.status = activeFilters.status === status ? null : status;
  emitFilterChange();
};

const search = (): void => {
  emitFilterChange();
};

const resetFilters = (): void => {
  activeFilters.generation = null;
  activeFilters.type = null;
  activeFilters.status = null;
  searchQuery.value = '';
  emitFilterChange();
};

const emitFilterChange = (): void => {
  emit('filter-change', {
    ...activeFilters,
    search: searchQuery.value,
  });
};
</script>
