<template>
  <div>
    <div class="flex justify-between items-center mb-2 md:mb-4">
      <h2 class="text-lg md:text-xl font-bold">リボン一覧</h2>
      <p class="text-gray-600 text-sm">{{ ribbons.length }}個のリボン</p>
    </div>

    <div v-if="ribbons.length === 0" class="bg-gray-50 rounded-lg p-4 md:p-8 text-center">
      <p class="text-gray-500">条件に一致するリボンがありません😢</p>
      <p class="mt-2 text-sm text-gray-400">フィルターを変更してみてください</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
      <!-- リボンカード -->
      <div
        v-for="ribbon in ribbons"
        :key="ribbon.id"
        :class="[
          'border rounded-lg overflow-hidden transition-shadow',
          isPokemonCompatible(ribbon)
            ? 'hover:shadow-md cursor-pointer'
            : 'opacity-50 cursor-default',
        ]"
        @click="isPokemonCompatible(ribbon) && selectRibbon(ribbon)"
      >
        <div class="flex p-2 md:p-3">
          <!-- リボンのアイコン部分 -->
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
            <p class="text-sm text-gray-600 line-clamp-2">{{ ribbon.description }}</p>

            <!-- リボンメタデータ -->
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
                v-if="!isPokemonCompatible(ribbon)"
                class="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded"
              >
                取得不可
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ribbon, Pokemon } from '~/types';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';

defineProps<{
  ribbons: Ribbon[];
  pokemon: Pokemon | null;
}>();

const emit = defineEmits<{
  (e: 'select-ribbon', ribbon: Ribbon): void;
}>();

const store = useRibbonProgressStore();

// リボン選択ハンドラー
const selectRibbon = (ribbon: Ribbon): void => {
  emit('select-ribbon', ribbon);
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
</script>
