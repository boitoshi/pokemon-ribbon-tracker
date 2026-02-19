<template>
  <div
    class="flex items-center gap-2 px-3 py-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
    :class="{ 'bg-green-50': isChecked }"
    @click="$emit('toggle')"
  >
    <!-- チェックボックス -->
    <input
      type="checkbox"
      :checked="isChecked"
      class="w-4 h-4 flex-shrink-0 cursor-pointer"
      @click.stop="$emit('toggle')"
    />

    <!-- リボン情報 -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-sm font-medium" :class="{ 'text-green-700 line-through': isChecked }">
          {{ ribbon.name }}
        </span>
        <!-- レベル制限バッジ -->
        <span
          v-if="ribbon.eligibility?.type === 'level_max'"
          class="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded"
        >
          Lv.{{ ribbon.eligibility.maxLevel }}以下
        </span>
      </div>
      <!-- 取得条件（1行） -->
      <p v-if="ribbon.requirements" class="text-xs text-gray-500 truncate mt-0.5">
        {{ ribbon.requirements }}
      </p>
    </div>

    <!-- 対応ゲームチップ（右端） -->
    <span class="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
      {{ formatGames(ribbon.games) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { Ribbon } from '~/types';
import { getGameName } from '~/utils/gameNames';

defineProps<{
  ribbon: Ribbon;
  isChecked: boolean;
}>();

defineEmits<{
  (e: 'toggle'): void;
}>();

/** ゲームIDの配列を略称文字列にフォーマットする */
const formatGames = (games: string[]): string => {
  if (!games || games.length === 0) return '';
  // 略称マップ
  const SHORT: Record<string, string> = {
    ruby: 'R',
    sapphire: 'S',
    emerald: 'E',
    firered: 'FR',
    leafgreen: 'LG',
    colosseum: 'Col',
    xd: 'XD',
  };
  return games.map((g) => SHORT[g] ?? getGameName(g)).join('/');
};
</script>
