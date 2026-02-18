<template>
  <div>
    <!-- RibbonFilter コンポーネント -->
    <RibbonFilter @filter-change="applyFilters" />

    <!-- リボン一覧ヘッダー -->
    <div class="flex justify-between items-center mb-2 md:mb-4">
      <h2 class="text-lg md:text-xl font-bold">リボン管理</h2>
      <p class="text-gray-600 text-sm">{{ filteredRibbons.length }}個のリボン</p>
    </div>

    <!-- 空の場合 -->
    <div
      v-if="filteredRibbons.length === 0"
      class="py-8 text-center text-gray-500 bg-gray-50 rounded-lg"
    >
      条件に一致するリボンがありません
    </div>

    <!-- リボンカードグリッド -->
    <div v-else class="space-y-2">
      <div
        v-for="ribbon in filteredRibbons"
        :key="ribbon.id"
        class="border rounded-lg overflow-hidden"
      >
        <!-- カードヘッダー（クリックでアコーディオン開閉） -->
        <div
          class="flex items-center p-2 md:p-3 cursor-pointer hover:bg-gray-50"
          :class="{ 'opacity-50': !isPokemonCompatible(ribbon) }"
          @click="toggleExpanded(ribbon.id)"
        >
          <!-- チェックボックス -->
          <input
            v-if="store.selectedPokemon"
            type="checkbox"
            :checked="store.currentCheckedRibbons.includes(ribbon.id)"
            class="w-5 h-5 mr-2 md:mr-3 flex-shrink-0"
            @click.stop="store.toggleRibbon(store.selectedPokemon.id, ribbon.id)"
          />

          <!-- リボンアイコン -->
          <div
            class="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0"
          >
            <img
              v-if="ribbon.image_url"
              :src="ribbon.image_url"
              :alt="ribbon.name"
              class="w-9 h-9"
            />
            <span v-else class="text-2xl">🎀</span>
          </div>

          <!-- リボン情報 -->
          <div class="flex-1">
            <h3 class="font-bold text-blue-800 text-sm md:text-base">{{ ribbon.name }}</h3>
            <p class="text-sm text-gray-600 line-clamp-1">{{ ribbon.description }}</p>
            <div class="mt-1 flex flex-wrap gap-1">
              <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                第{{ ribbon.generation }}世代
              </span>
              <span
                v-if="isPokemonCompatible(ribbon)"
                class="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded"
              >
                取得可能
              </span>
              <span
                v-else
                class="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded"
              >
                取得不可
              </span>
            </div>
          </div>

          <!-- 展開アイコン -->
          <span class="ml-2 text-gray-400">{{ expandedRibbonId === ribbon.id ? '▲' : '▼' }}</span>
        </div>

        <!-- アコーディオン展開部分（ガイド情報） -->
        <div v-if="expandedRibbonId === ribbon.id" class="border-t bg-gray-50 p-3 md:p-4">
          <!-- 獲得条件 -->
          <div class="mb-3">
            <h5 class="font-medium text-sm md:text-base mb-1">獲得条件</h5>
            <p class="text-gray-700 text-sm">{{ ribbon.requirements }}</p>
          </div>

          <!-- 詳細な獲得方法 -->
          <div class="mb-3">
            <h5 class="font-medium text-sm md:text-base mb-1">詳細な獲得方法</h5>
            <div class="bg-white p-2 md:p-3 rounded text-gray-700 text-sm">
              {{ getRibbonGuide(ribbon.id) }}
            </div>
          </div>

          <!-- 獲得のコツ -->
          <div v-if="getRibbonTips(ribbon.id)" class="mb-3">
            <h5 class="font-medium text-sm md:text-base mb-1">獲得のコツ</h5>
            <ul class="list-disc pl-4 text-gray-700 text-sm">
              <li v-for="(tip, index) in getRibbonTips(ribbon.id)" :key="index" class="mb-1">
                {{ tip }}
              </li>
            </ul>
          </div>

          <!-- 対応ゲーム -->
          <div class="text-xs text-gray-500">
            <span>対応ゲーム: {{ formatGames(ribbon.games) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { CATEGORY_MAP } from '~/utils/ribbonFilter';
import { getRibbonGuide, getRibbonTips } from '~/utils/ribbonGuideData';
import { getGameName } from '~/utils/gameNames';
import type { FilterState } from '~/types';

const store = useRibbonProgressStore();

const filters = ref<FilterState>({
  generation: null,
  type: null,
  status: null,
  search: '',
});

const expandedRibbonId = ref<string | null>(null);

/** フィルター変更を適用する */
const applyFilters = (newFilters: FilterState): void => {
  filters.value = { ...newFilters };
};

/** アコーディオンの開閉をトグルする */
const toggleExpanded = (ribbonId: string): void => {
  expandedRibbonId.value = expandedRibbonId.value === ribbonId ? null : ribbonId;
};

/** フィルター条件に合致するリボン一覧 */
const filteredRibbons = computed(() => {
  let result = store.ribbons;

  if (filters.value.generation) {
    result = result.filter((r) => r.generation === filters.value.generation);
  }

  if (filters.value.type) {
    const categoryName = CATEGORY_MAP[filters.value.type];
    if (categoryName) {
      result = result.filter((r) => r.category === categoryName);
    }
  }

  if (filters.value.search) {
    const q = filters.value.search.toLowerCase();
    result = result.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }

  if (filters.value.status === 'obtained') {
    result = result.filter((r) => store.currentCheckedRibbons.includes(r.id));
  } else if (filters.value.status === 'not-obtained') {
    result = result.filter((r) => !store.currentCheckedRibbons.includes(r.id));
  }

  return result;
});

/** 選択中のポケモンが指定リボンを取得可能かどうかを返す */
const isPokemonCompatible = (ribbon: { generation: number }): boolean => {
  const gen = store.selectedPokemonGeneration;
  if (gen === null) return true;
  return gen <= ribbon.generation;
};

/** ゲームIDの配列を日本語名の文字列にフォーマットする */
const formatGames = (games: string[]): string => {
  if (!games) return '';
  return games.map((game) => getGameName(game)).join('、');
};
</script>
