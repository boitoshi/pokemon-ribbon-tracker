<template>
  <div>
    <h2 class="text-lg md:text-xl font-bold mb-2 md:mb-4">リボン王チャート</h2>

    <div v-if="!pokemon" class="bg-yellow-100 border-yellow-400 border p-2 md:p-4 rounded text-sm md:text-base">
      ポケモンを選択すると、獲得可能なすべてのリボンのチェックリストが表示されます。
    </div>

    <div v-else>
      <div class="mb-2 md:mb-4 p-2 md:p-4 bg-green-50 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <p>
            <strong>{{ pokemon.name }}</strong> のリボン王チャート
          </p>
          <p class="text-sm mt-1">
            獲得したリボン: {{ store.currentCheckedRibbons.length }} / {{ ribbons.length }}
          </p>
        </div>
        <button
          class="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          @click="store.clearProgress(pokemon.id)"
        >
          進捗をリセット
        </button>
      </div>

      <!-- エクスポート/インポート -->
      <div class="mb-2 md:mb-4 flex flex-wrap gap-2">
        <button
          class="px-2 md:px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs md:text-sm hover:bg-blue-200"
          @click="exportProgress"
        >
          進捗をエクスポート
        </button>
        <button
          class="px-2 md:px-3 py-1 bg-green-100 text-green-700 rounded text-xs md:text-sm hover:bg-green-200"
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

      <!-- 世代ごとのリボンチェックリスト -->
      <div class="space-y-3 md:space-y-6">
        <div v-for="gen in generations" :key="gen" class="border rounded-lg overflow-hidden">
          <div class="bg-gray-100 p-2 md:p-3 text-sm md:text-base font-bold">第{{ gen }}世代リボン</div>
          <div class="p-2 md:p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              <div
                v-for="ribbon in getRibbonsByGeneration(gen)"
                :key="ribbon.id"
                class="flex items-center p-2 hover:bg-gray-50 rounded"
              >
                <input
                  :id="ribbon.id"
                  type="checkbox"
                  :checked="store.currentCheckedRibbons.includes(ribbon.id)"
                  class="w-5 h-5 mr-3"
                  @change="store.toggleRibbon(pokemon.id, ribbon.id)"
                />
                <label :for="ribbon.id" class="flex-1 cursor-pointer">
                  <div class="font-medium">{{ ribbon.name }}</div>
                  <div class="text-xs text-gray-600">{{ ribbon.requirements }}</div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 進捗まとめ -->
      <div class="mt-4 md:mt-6 bg-blue-50 p-2 md:p-4 rounded">
        <h3 class="font-bold text-sm md:text-base mb-1 md:mb-2">進捗サマリー</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
          <div
            v-for="gen in generations"
            :key="`summary-${gen}`"
            class="text-center p-2 bg-white rounded shadow-sm"
          >
            <div class="text-sm font-medium mb-1">第{{ gen }}世代</div>
            <div class="text-lg font-bold">{{ getCompletionByGeneration(gen) }}%</div>
          </div>
          <div class="text-center p-2 bg-blue-100 rounded shadow-sm">
            <div class="text-sm font-medium mb-1">総合進捗</div>
            <div class="text-lg font-bold">{{ store.totalCompletion }}%</div>
          </div>
        </div>
      </div>

      <!-- 認定証セクション -->
      <div
        v-if="store.totalCompletion === 100"
        class="mt-4 md:mt-6 border-2 border-yellow-400 p-3 md:p-4 rounded-lg bg-yellow-50"
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

const getRibbonsByGeneration = (generation: number) => {
  return props.ribbons.filter((r) => r.generation === generation);
};

const getCompletionByGeneration = (generation: number): number => {
  const genRibbons = getRibbonsByGeneration(generation);
  if (genRibbons.length === 0) return 0;
  const checked = genRibbons.filter((r) => store.currentCheckedRibbons.includes(r.id)).length;
  return Math.round((checked / genRibbons.length) * 100);
};

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
      if (props.pokemon) {
        store.loadProgress(props.pokemon.id);
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
</script>
