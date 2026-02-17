<template>
  <div>
    <h2 class="text-lg md:text-xl font-bold mb-2 md:mb-4">進捗ダッシュボード</h2>

    <div v-if="!pokemon" class="bg-yellow-100 border-yellow-400 border p-2 md:p-4 rounded text-sm md:text-base">
      ポケモンを選択すると、リボン取得の進捗状況が表示されます。
    </div>

    <div v-else>
      <!-- 総合進捗 -->
      <div class="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <p class="text-lg font-bold">{{ pokemon.name }} のリボン進捗</p>
            <p class="text-sm text-gray-600 mt-1">
              獲得したリボン: <strong>{{ store.currentCheckedRibbons.length }}</strong> / {{ ribbons.length }}
            </p>
          </div>
          <div class="text-3xl md:text-4xl font-bold" :class="store.totalCompletion === 100 ? 'text-yellow-600' : 'text-blue-600'">
            {{ store.totalCompletion }}%
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mt-3">
          <div
            class="h-3 rounded-full transition-all duration-300"
            :class="store.totalCompletion === 100 ? 'bg-yellow-500' : 'bg-blue-500'"
            :style="`width: ${store.totalCompletion}%`"
          ></div>
        </div>
      </div>

      <!-- 世代別進捗グリッド -->
      <div class="mb-4 md:mb-6">
        <h3 class="font-bold text-sm md:text-base mb-2 md:mb-3">世代別進捗</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          <div
            v-for="gen in generations"
            :key="gen"
            class="text-center p-3 bg-white rounded-lg shadow-sm border"
          >
            <div class="text-xs font-medium text-gray-500 mb-1">第{{ gen }}世代</div>
            <div class="text-2xl font-bold" :class="getCompletionByGeneration(gen) === 100 ? 'text-yellow-600' : 'text-blue-600'">
              {{ getCompletionByGeneration(gen) }}%
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ getCheckedCountByGeneration(gen) }} / {{ getRibbonsByGeneration(gen).length }}
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                class="h-1.5 rounded-full transition-all duration-300"
                :class="getCompletionByGeneration(gen) === 100 ? 'bg-yellow-500' : 'bg-blue-500'"
                :style="`width: ${getCompletionByGeneration(gen)}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- カテゴリ別進捗 -->
      <div class="mb-4 md:mb-6">
        <h3 class="font-bold text-sm md:text-base mb-2 md:mb-3">カテゴリ別進捗</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          <div
            v-for="cat in categoryProgress"
            :key="cat.name"
            class="flex items-center p-3 bg-white rounded-lg shadow-sm border"
          >
            <div class="flex-1">
              <div class="text-sm font-medium">{{ cat.name }}</div>
              <div class="text-xs text-gray-500">{{ cat.checked }} / {{ cat.total }}</div>
            </div>
            <div class="text-lg font-bold" :class="cat.percentage === 100 ? 'text-yellow-600' : 'text-blue-600'">
              {{ cat.percentage }}%
            </div>
          </div>
        </div>
      </div>

      <!-- エクスポート/インポート/リセット -->
      <div class="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg">
        <h3 class="font-bold text-sm md:text-base mb-2 md:mb-3">データ管理</h3>
        <div class="flex flex-wrap gap-2">
          <button
            class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
            @click="exportProgress"
          >
            進捗をエクスポート
          </button>
          <button
            class="px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
            @click="triggerImport"
          >
            進捗をインポート
          </button>
          <button
            class="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
            @click="confirmReset"
          >
            進捗をリセット
          </button>
          <input
            ref="importFile"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleImportFile"
          />
        </div>
      </div>

      <!-- 認定証セクション -->
      <div
        v-if="store.totalCompletion === 100"
        class="border-2 border-yellow-400 p-3 md:p-4 rounded-lg bg-yellow-50"
      >
        <h3 class="text-center text-lg md:text-xl font-bold text-yellow-800 mb-2 md:mb-3">🏆 リボン制覇達成！ 🏆</h3>
        <p class="text-center mb-4">
          おめでとうございます！{{ pokemon.name }}はすべてのリボンを集めました！
        </p>
        <button
          class="block mx-auto px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          @click="generateCertificate"
        >
          認定証を生成する
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { CATEGORY_MAP } from '~/utils/ribbonFilter';
import type { Pokemon, Ribbon } from '~/types';

const props = defineProps<{
  pokemon: Pokemon | null;
  ribbons: Ribbon[];
}>();

const store = useRibbonProgressStore();

const generations = computed(() => {
  const gens = new Set(props.ribbons.map((r) => r.generation));
  return [...gens].sort((a, b) => a - b);
});

const getRibbonsByGeneration = (generation: number): Ribbon[] => {
  return props.ribbons.filter((r) => r.generation === generation);
};

const getCheckedCountByGeneration = (generation: number): number => {
  const genRibbons = getRibbonsByGeneration(generation);
  return genRibbons.filter((r) => store.currentCheckedRibbons.includes(r.id)).length;
};

const getCompletionByGeneration = (generation: number): number => {
  const genRibbons = getRibbonsByGeneration(generation);
  if (genRibbons.length === 0) return 0;
  return Math.round((getCheckedCountByGeneration(generation) / genRibbons.length) * 100);
};

const categoryProgress = computed(() => {
  return Object.entries(CATEGORY_MAP).map(([, name]) => {
    const catRibbons = props.ribbons.filter((r) => r.category === name);
    const checked = catRibbons.filter((r) => store.currentCheckedRibbons.includes(r.id)).length;
    return {
      name,
      total: catRibbons.length,
      checked,
      percentage: catRibbons.length === 0 ? 0 : Math.round((checked / catRibbons.length) * 100),
    };
  });
});

/** Canvas API でリボン王認定証を生成し、PNGとしてダウンロード */
const generateCertificate = (): void => {
  if (!props.pokemon) return;

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 背景
  const gradient = ctx.createLinearGradient(0, 0, 800, 500);
  gradient.addColorStop(0, '#fef9c3');
  gradient.addColorStop(1, '#fde68a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 500);

  // 枠線
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, 760, 460);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, 740, 440);

  // タイトル
  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('リボン王 認定証', 400, 90);

  // 装飾ライン
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 110);
  ctx.lineTo(600, 110);
  ctx.stroke();

  // ポケモン名
  ctx.fillStyle = '#1e3a5f';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(props.pokemon.name, 400, 190);

  // 認定テキスト
  ctx.fillStyle = '#374151';
  ctx.font = '20px sans-serif';
  ctx.fillText('上記のポケモンは、すべてのリボンを獲得し', 400, 250);
  ctx.fillText('リボン王の称号を得たことをここに認定します。', 400, 280);

  // 統計情報
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(`取得リボン数: ${store.currentCheckedRibbons.length} / ${props.ribbons.length}`, 400, 330);
  ctx.fillText(`達成率: ${store.totalCompletion}%`, 400, 360);

  // 日付
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(`認定日: ${today}`, 400, 420);

  // フッター
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#d1d5db';
  ctx.fillText('ポケモンリボン制覇支援ツール', 400, 460);

  // ダウンロード
  const link = document.createElement('a');
  link.download = `ribbon-master-${props.pokemon.id}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

/** 進捗データをJSONファイルとしてダウンロード */
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

const importFile = ref<HTMLInputElement | null>(null);

/** ファイル選択ダイアログを開く */
const triggerImport = (): void => {
  importFile.value?.click();
};

/** 選択されたJSONファイルから進捗をインポート */
const handleImportFile = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = e.target?.result as string;
      store.importProgress(json);
      // Reload current pokemon's progress if selected
      if (store.currentProgressKey) {
        store.loadProgress(store.currentProgressKey);
      }
      alert('進捗データをインポートしました');
    } catch (err) {
      alert(`インポートに失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    }
  };
  reader.readAsText(file);
  // Reset file input so same file can be selected again
  target.value = '';
};

/** 確認ダイアログを表示してから進捗をリセット */
const confirmReset = (): void => {
  if (!props.pokemon || !store.currentProgressKey) return;
  const ok = confirm(`${props.pokemon.name} の進捗をリセットしますか？この操作は元に戻せません。`);
  if (ok) {
    store.clearProgress(store.currentProgressKey);
  }
};
</script>
