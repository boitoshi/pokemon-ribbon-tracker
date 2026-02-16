<template>
  <div class="bg-white border rounded-lg p-4 shadow-sm">
    <h3 class="text-lg font-bold mb-3">リボン獲得ガイド</h3>

    <div v-if="!selectedRibbon" class="text-gray-500 text-center py-8">
      左のリストからリボンを選択すると、詳細な獲得方法が表示されます
    </div>

    <div v-else>
      <div class="flex items-start mb-4">
        <div
          class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
        >
          <img
            v-if="selectedRibbon.image_url"
            :src="selectedRibbon.image_url"
            :alt="selectedRibbon.name"
            class="w-12 h-12"
          />
          <span v-else class="text-3xl">🎀</span>
        </div>
        <div>
          <h4 class="text-xl font-bold">{{ selectedRibbon.name }}</h4>
          <p class="text-gray-600">{{ selectedRibbon.description }}</p>
          <div class="mt-1 text-xs">
            <span class="inline-block bg-gray-200 rounded px-2 py-0.5"
              >第{{ selectedRibbon.generation }}世代</span
            >
            <span class="inline-block ml-1 bg-gray-200 rounded px-2 py-0.5">{{
              formatGames(selectedRibbon.games)
            }}</span>
          </div>
        </div>
      </div>

      <hr class="my-4" />

      <div class="mb-4">
        <h5 class="font-medium mb-2">獲得条件</h5>
        <p class="text-gray-700">{{ selectedRibbon.requirements }}</p>
      </div>

      <div class="mb-4">
        <h5 class="font-medium mb-2">詳細な獲得方法</h5>
        <div class="bg-gray-50 p-3 rounded text-gray-700">
          {{ getRibbonGuide(selectedRibbon.id) }}
        </div>
      </div>

      <div v-if="getRibbonTips(selectedRibbon.id)" class="mb-4">
        <h5 class="font-medium mb-2">獲得のコツ</h5>
        <ul class="list-disc pl-5 text-gray-700">
          <li v-for="(tip, index) in getRibbonTips(selectedRibbon.id)" :key="index" class="mb-1">
            {{ tip }}
          </li>
        </ul>
      </div>

      <div class="mt-4 text-sm text-gray-500">
        <p>最終更新: {{ new Date().toLocaleDateString('ja-JP') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ribbon } from '~/types';
import { getGameName } from '~/utils/gameNames';
import { getRibbonGuide, getRibbonTips } from '~/utils/ribbonGuideData';

defineProps<{
  selectedRibbon: Ribbon | null;
}>();

/** ゲームID配列を日本語名のカンマ区切りに変換 */
const formatGames = (games: string[]): string => {
  if (!games) return '';
  return games.map((game) => getGameName(game)).join('、');
};
</script>
