<template>
  <div>
    <h2 class="text-lg md:text-xl font-bold mb-2 md:mb-4">リボン管理</h2>

    <!-- フィルターバー -->
    <div class="mb-2 md:mb-4 p-2 md:p-4 bg-gray-50 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
        <!-- 世代フィルター -->
        <div>
          <label class="block text-xs md:text-sm font-medium text-gray-700 mb-0.5 md:mb-1">世代</label>
          <div class="flex flex-wrap gap-1">
            <button
              :class="['px-2 py-1 text-xs rounded', !filters.generation ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="filters.generation = null"
            >すべて</button>
            <button
              v-for="gen in [3, 4, 5, 6, 7, 8]"
              :key="gen"
              :class="['px-2 py-1 text-xs rounded', filters.generation === gen ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="filters.generation = filters.generation === gen ? null : gen"
            >第{{ gen }}世代</button>
          </div>
        </div>

        <!-- カテゴリフィルター -->
        <div>
          <label class="block text-xs md:text-sm font-medium text-gray-700 mb-0.5 md:mb-1">カテゴリ</label>
          <div class="flex flex-wrap gap-1">
            <button
              :class="['px-2 py-1 text-xs rounded', !filters.type ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="filters.type = null"
            >すべて</button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              :class="['px-2 py-1 text-xs rounded', filters.type === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="filters.type = filters.type === cat.id ? null : cat.id"
            >{{ cat.name }}</button>
          </div>
        </div>

        <!-- 取得状況フィルター -->
        <div>
          <label class="block text-xs md:text-sm font-medium text-gray-700 mb-0.5 md:mb-1">取得状況</label>
          <div class="flex flex-wrap gap-1">
            <button
              :class="['px-2 py-1 text-xs rounded', !filters.status ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="filters.status = null"
            >すべて</button>
            <button
              :class="['px-2 py-1 text-xs rounded', filters.status === 'obtained' ? 'bg-green-500 text-white' : 'bg-gray-200']"
              @click="filters.status = filters.status === 'obtained' ? null : 'obtained'"
            >取得済み</button>
            <button
              :class="['px-2 py-1 text-xs rounded', filters.status === 'not-obtained' ? 'bg-orange-500 text-white' : 'bg-gray-200']"
              @click="filters.status = filters.status === 'not-obtained' ? null : 'not-obtained'"
            >未取得</button>
          </div>
        </div>

        <!-- 検索 -->
        <div>
          <label class="block text-xs md:text-sm font-medium text-gray-700 mb-0.5 md:mb-1">検索</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="リボン名を入力..."
            class="w-full px-3 py-1.5 border rounded-md text-sm"
          />
        </div>
      </div>

      <!-- フィルターリセット + 結果数 -->
      <div class="mt-2 flex justify-between items-center">
        <span class="text-sm text-gray-600">{{ filteredRibbons.length }}個のリボン</span>
        <button class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm" @click="resetFilters">リセット</button>
      </div>
    </div>

    <!-- リボンカードリスト -->
    <div v-if="filteredRibbons.length === 0" class="bg-gray-50 rounded-lg p-4 md:p-8 text-center">
      <p class="text-gray-500">条件に一致するリボンがありません</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="ribbon in filteredRibbons"
        :key="ribbon.id"
        :class="['border rounded-lg overflow-hidden transition-shadow', isPokemonCompatible(ribbon) ? 'hover:shadow-md' : 'opacity-50']"
      >
        <!-- カードヘッダー -->
        <div class="flex items-center p-2 md:p-3" @click="isPokemonCompatible(ribbon) && toggleExpand(ribbon.id)">
          <!-- チェックボックス -->
          <input
            v-if="pokemon"
            type="checkbox"
            :checked="store.currentCheckedRibbons.includes(ribbon.id)"
            class="w-5 h-5 mr-2 md:mr-3 flex-shrink-0"
            @click.stop="store.currentProgressKey && store.toggleRibbon(store.currentProgressKey, ribbon.id)"
            @change.stop
          />

          <!-- リボンアイコン -->
          <div class="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
            <img v-if="ribbon.image_url" :src="ribbon.image_url" :alt="ribbon.name" class="w-9 h-9" />
            <span v-else class="text-2xl">🎀</span>
          </div>

          <!-- リボン情報 -->
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-blue-800 text-sm md:text-base">{{ ribbon.name }}</h3>
            <p class="text-sm text-gray-600 line-clamp-1">{{ ribbon.description }}</p>
            <div class="mt-1 flex flex-wrap gap-1">
              <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">第{{ ribbon.generation }}世代</span>
              <span v-if="isPokemonCompatible(ribbon)" class="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">取得可能</span>
              <span v-else class="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded">取得不可</span>
              <span v-if="store.currentCheckedRibbons.includes(ribbon.id)" class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">取得済み</span>
            </div>
          </div>

          <!-- 展開アイコン -->
          <div v-if="isPokemonCompatible(ribbon)" class="ml-2 text-gray-400 flex-shrink-0 cursor-pointer">
            <span :class="expandedRibbonId === ribbon.id ? 'rotate-180 inline-block' : 'inline-block'">▼</span>
          </div>
        </div>

        <!-- アコーディオン展開: ガイド詳細 -->
        <div v-if="expandedRibbonId === ribbon.id" class="border-t bg-gray-50 p-3 md:p-4">
          <!-- 取得条件 -->
          <div v-if="ribbon.requirements" class="mb-3">
            <h5 class="font-medium text-sm mb-1">取得条件</h5>
            <p class="text-sm text-gray-700">{{ ribbon.requirements }}</p>
          </div>

          <!-- 対応ゲーム -->
          <div v-if="ribbon.games?.length" class="mb-3">
            <h5 class="font-medium text-sm mb-1">対応ゲーム</h5>
            <div class="flex flex-wrap gap-1">
              <span v-for="game in ribbon.games" :key="game" class="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">{{ getGameName(game) }}</span>
            </div>
          </div>

          <!-- 詳細ガイド -->
          <div v-if="getRibbonGuide(ribbon.id)" class="mb-3">
            <h5 class="font-medium text-sm mb-1">獲得方法</h5>
            <div class="bg-white p-2 md:p-3 rounded text-sm text-gray-700">{{ getRibbonGuide(ribbon.id) }}</div>
          </div>

          <!-- コツ -->
          <div v-if="getRibbonTips(ribbon.id)?.length">
            <h5 class="font-medium text-sm mb-1">獲得のコツ</h5>
            <ul class="list-disc pl-4 text-sm text-gray-700">
              <li v-for="(tip, i) in getRibbonTips(ribbon.id)" :key="i" class="mb-1">{{ tip }}</li>
            </ul>
          </div>

          <!-- ガイドがない場合 -->
          <p v-if="!getRibbonGuide(ribbon.id) && !ribbon.requirements" class="text-sm text-gray-500">このリボンの詳細ガイドはまだ作成されていません</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { CATEGORY_MAP } from '~/utils/ribbonFilter';
import { getGameName } from '~/utils/gameNames';
import { getRibbonGuide, getRibbonTips } from '~/utils/ribbonGuideData';
import type { Pokemon, Ribbon, Game, FilterState } from '~/types';

const props = defineProps<{
  pokemon: Pokemon | null;
  ribbons: Ribbon[];
  games: Game[];
}>();

const store = useRibbonProgressStore();

/** カテゴリ選択肢 */
const categories = [
  { id: 'champion', name: 'チャンピオン' },
  { id: 'contest', name: 'コンテスト' },
  { id: 'battle', name: 'バトル施設' },
  { id: 'memory', name: '思い出' },
  { id: 'event', name: 'イベント' },
];

/** フィルター状態 */
const filters = ref<FilterState>({
  generation: null,
  type: null,
  status: null,
  search: '',
});

/** アコーディオン展開中のリボンID */
const expandedRibbonId = ref<string | null>(null);

/**
 * アコーディオンの開閉を切り替える。
 * 同じリボンを再クリックすると閉じる。
 */
const toggleExpand = (ribbonId: string): void => {
  expandedRibbonId.value = expandedRibbonId.value === ribbonId ? null : ribbonId;
};

/**
 * 選択されたポケモンがリボンを取得可能かどうかをチェック。
 * ポケモンの出身世代以降のリボンのみ取得可能。
 */
const isPokemonCompatible = (ribbon: Ribbon): boolean => {
  const gen = store.selectedPokemonGeneration;
  if (gen === null) return true;
  return gen <= ribbon.generation;
};

/** フィルター条件を適用したリボン一覧 */
const filteredRibbons = computed((): Ribbon[] => {
  let result = props.ribbons;

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

/** すべてのフィルターをリセットする */
const resetFilters = (): void => {
  filters.value = { generation: null, type: null, status: null, search: '' };
};
</script>
