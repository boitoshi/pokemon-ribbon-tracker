<template>
  <div>
    <!-- 進捗サマリー -->
    <div v-if="store.selectedPokemon" class="mb-3 p-3 bg-blue-50 rounded-lg">
      <div class="flex flex-wrap gap-2 items-center justify-between mb-2">
        <span class="text-sm font-medium text-blue-800">
          進捗: {{ store.currentCheckedRibbons.length }} / {{ store.ribbons.length }} ({{ store.totalCompletion }}%)
        </span>
        <button
          class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
          @click="store.clearProgress(store.selectedPokemon!.id)"
        >
          進捗をリセット
        </button>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div class="bg-blue-500 h-2 rounded-full transition-all" :style="`width: ${store.totalCompletion}%`"></div>
      </div>
      <!-- 世代別進捗 -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-1">
        <div
          v-for="gen in generations"
          :key="`prog-${gen}`"
          class="text-center p-1.5 bg-white rounded text-xs shadow-sm"
        >
          <div class="text-gray-500">第{{ gen }}世代</div>
          <div class="font-bold text-blue-700">{{ getCompletionByGeneration(gen) }}%</div>
        </div>
      </div>
    </div>

    <!-- レベル制限リボン警告 -->
    <div
      v-if="levelRestrictedUnobtained.length > 0"
      class="mb-3 p-3 bg-amber-50 border border-amber-300 rounded-lg"
    >
      <h4 class="font-semibold text-amber-800 text-sm mb-1">
        ⚠ レベル上限前に取得すべきリボン ({{ levelRestrictedUnobtained.length }}個)
      </h4>
      <p class="text-xs text-amber-700 mb-2">
        以下のリボンにはレベル制限があります。<strong>ポケモンがそのレベルを超える前</strong>に取得しておきましょう。
      </p>
      <div class="space-y-1">
        <div
          v-for="ribbon in levelRestrictedUnobtained"
          :key="ribbon.id"
          class="flex items-center gap-2 text-xs bg-white rounded px-2 py-1 border border-amber-200"
        >
          <span class="text-amber-500 font-bold flex-shrink-0">⚠</span>
          <span class="font-medium">{{ ribbon.name }}</span>
          <span class="text-amber-600 ml-auto flex-shrink-0">Lv.{{ ribbon.eligibility?.maxLevel }}以下</span>
        </div>
      </div>
    </div>

    <!-- リボン一覧ヘッダー -->
    <div class="flex justify-between items-center mb-2 md:mb-4">
      <h2 class="text-lg md:text-xl font-bold">リボン管理</h2>
      <div class="flex items-center gap-2">
        <div class="flex rounded border overflow-hidden text-xs">
          <button
            :class="['px-2 py-1', viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50']"
            @click="viewMode = 'list'"
          >リスト</button>
          <button
            :class="['px-2 py-1', viewMode === 'chart' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50']"
            @click="viewMode = 'chart'"
          >チャート</button>
        </div>
        <p v-if="viewMode === 'list'" class="text-gray-600 text-sm">{{ filteredRibbons.length }}個のリボン</p>
      </div>
    </div>

    <!-- リスト表示 -->
    <div v-if="viewMode === 'list'">
      <!-- RibbonFilter コンポーネント -->
      <RibbonFilter @filter-change="applyFilters" />

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
            :class="{ 'opacity-50': !getRibbonEligibility(ribbon).eligible }"
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
                  v-if="getRibbonEligibility(ribbon).eligible"
                  class="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded"
                >
                  取得可能
                </span>
                <span
                  v-else
                  class="inline-block bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded"
                >
                  {{ getRibbonEligibility(ribbon).reason || '取得不可' }}
                </span>
                <!-- Level warning (eligible but with reason) -->
                <span
                  v-if="getRibbonEligibility(ribbon).eligible && getRibbonEligibility(ribbon).reason"
                  class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded"
                >
                  ⚠ {{ getRibbonEligibility(ribbon).reason }}
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

    <!-- チャート表示 -->
    <RibbonChart v-else />

    <!-- エクスポート/インポート -->
    <div v-if="store.selectedPokemon" class="mt-4 pt-3 border-t flex flex-wrap gap-2">
      <button
        class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
        @click="exportProgress"
      >
        進捗をエクスポート
      </button>
      <button
        class="px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
        @click="triggerImport"
      >
        進捗をインポート
      </button>
      <input
        ref="importFile"
        type="file"
        accept=".json"
        class="hidden"
        @change="handleImportFile"
      />
    </div>

    <!-- 認定証セクション -->
    <div
      v-if="store.totalCompletion === 100 && store.selectedPokemon"
      class="mt-4 border-2 border-yellow-400 p-3 rounded-lg bg-yellow-50"
    >
      <h3 class="text-center text-lg font-bold text-yellow-800 mb-2">🏆 リボン制覇達成！ 🏆</h3>
      <p class="text-center text-sm mb-3">
        おめでとうございます！{{ store.selectedPokemon.name }}はすべてのリボンを集めました！
      </p>
      <button
        class="block mx-auto px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        @click="generateCertificate"
      >
        認定証を生成する
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { CATEGORY_MAP } from '~/utils/ribbonFilter';
import { getRibbonGuide, getRibbonTips } from '~/utils/ribbonGuideData';
import { getGameName } from '~/utils/gameNames';
import { canPokemonGetRibbon } from '~/utils/ribbonEligibility';
import { useToast } from '~/composables/useToast';
import type { FilterState, Ribbon } from '~/types';

const store = useRibbonProgressStore();

const filters = ref<FilterState>({
  generation: null,
  type: null,
  status: null,
  search: '',
});

const expandedRibbonId = ref<string | null>(null);

const viewMode = ref<'list' | 'chart'>('list');

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

/** 選択中のポケモンが指定リボンを取得可能かどうかを判定する */
const getRibbonEligibility = (ribbon: Ribbon): { eligible: boolean; reason?: string } => {
  if (!store.selectedPokemon) return { eligible: true };
  const detail = store.pokemonList.find((p) => p.id === store.selectedPokemon?.id);
  if (!detail) return { eligible: true };
  return canPokemonGetRibbon(detail, ribbon, store.activeMyPokemon ?? undefined);
};

/** ゲームIDの配列を日本語名の文字列にフォーマットする */
const formatGames = (games: string[]): string => {
  if (!games) return '';
  return games.map((game) => getGameName(game)).join('、');
};

const { success, error: toastError } = useToast();
const importFile = ref<HTMLInputElement | null>(null);

/** 未取得のレベル制限ありリボン一覧 */
const levelRestrictedUnobtained = computed(() => {
  if (!store.selectedPokemon) return [];
  return store.ribbons.filter(
    (r) =>
      r.eligibility?.type === 'level_max' && !store.currentCheckedRibbons.includes(r.id)
  );
});

/** 世代リスト */
const generations = computed(() => {
  const gens = new Set(store.ribbons.map((r) => r.generation));
  return [...gens].sort((a, b) => a - b);
});

/** 世代別完了率 */
const getCompletionByGeneration = (generation: number): number => {
  const genRibbons = store.ribbons.filter((r) => r.generation === generation);
  if (genRibbons.length === 0) return 0;
  const checked = genRibbons.filter((r) => store.currentCheckedRibbons.includes(r.id)).length;
  return Math.round((checked / genRibbons.length) * 100);
};

/** 進捗データをエクスポート */
const exportProgress = (): void => {
  const json = store.exportProgress();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ribbon-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const triggerImport = (): void => {
  importFile.value?.click();
};

const handleImportFile = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = e.target?.result as string;
      store.importProgress(json);
      if (store.selectedPokemon) {
        store.loadProgress(store.selectedPokemon.id);
      }
      success('進捗データをインポートしました');
    } catch (err) {
      toastError(`インポートに失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    }
  };
  reader.readAsText(file);
  target.value = '';
};

/** Canvas API でリボン王認定証を生成 */
const generateCertificate = (): void => {
  if (!store.selectedPokemon) return;
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const gradient = ctx.createLinearGradient(0, 0, 800, 500);
  gradient.addColorStop(0, '#fef9c3');
  gradient.addColorStop(1, '#fde68a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 500);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, 760, 460);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, 740, 440);
  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('リボン王 認定証', 400, 90);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 110);
  ctx.lineTo(600, 110);
  ctx.stroke();
  ctx.fillStyle = '#1e3a5f';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(store.selectedPokemon.name, 400, 190);
  ctx.fillStyle = '#374151';
  ctx.font = '20px sans-serif';
  ctx.fillText('上記のポケモンは、すべてのリボンを獲得し', 400, 250);
  ctx.fillText('リボン王の称号を得たことをここに認定します。', 400, 280);
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(`取得リボン数: ${store.currentCheckedRibbons.length} / ${store.ribbons.length}`, 400, 330);
  ctx.fillText(`達成率: ${store.totalCompletion}%`, 400, 360);
  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(`認定日: ${today}`, 400, 420);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#d1d5db';
  ctx.fillText('ポケモンリボン制覇支援ツール', 400, 460);
  const link = document.createElement('a');
  link.download = `ribbon-master-${store.selectedPokemon.id}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
</script>
