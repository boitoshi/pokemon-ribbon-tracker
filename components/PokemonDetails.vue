<template>
  <div v-if="pokemon" class="pokemon-details bg-white p-2 md:p-4 rounded-lg shadow">
    <!-- ポケモン基本情報セクション -->
    <div class="flex items-center mb-2 md:mb-4">
      <div class="mr-2 md:mr-4">
        <img :src="pokemon.imageUrl" :alt="pokemon.name" class="w-16 h-16 md:w-24 md:h-24 object-contain" />
      </div>

      <div>
        <h2 class="text-lg md:text-xl font-bold">{{ pokemon.name }}</h2>
        <p class="text-gray-600">#{{ pokemon.number }}</p>

        <!-- タイプ表示 -->
        <div class="flex mt-1 gap-1 md:gap-2">
          <span
            v-for="type in pokemon.types"
            :key="type"
            class="px-2 py-1 text-xs rounded text-white"
            :class="getTypeClass(type)"
          >
            {{ type }}
          </span>
        </div>
      </div>
    </div>

    <!-- マイポケモン追加情報 -->
    <div v-if="store.activeMyPokemon" class="mt-2 md:mt-3 p-2 md:p-3 bg-blue-50 rounded-lg">
      <div class="flex flex-wrap gap-2 text-sm">
        <span v-if="store.activeMyPokemon.nickname" class="inline-flex items-center gap-1">
          <span class="text-gray-500">NN:</span>
          <span class="font-medium">{{ store.activeMyPokemon.nickname }}</span>
        </span>
        <span v-if="store.activeMyPokemon.originGame" class="inline-flex items-center gap-1">
          <span class="text-gray-500">出身:</span>
          <span class="font-medium">{{ getGameName(store.activeMyPokemon.originGame) }}</span>
        </span>
      </div>
      <p v-if="store.activeMyPokemon.memo" class="mt-1 text-xs text-gray-600">
        {{ store.activeMyPokemon.memo }}
      </p>
    </div>

    <!-- リボン取得状況 -->
    <div class="mt-2 md:mt-4">
      <h3 class="font-bold text-base md:text-lg mb-1 md:mb-2">リボン取得状況</h3>
      <div v-if="store.ribbons.length" class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div
          v-for="ribbon in store.ribbons"
          :key="ribbon.id"
          class="p-2 border rounded flex items-center"
          :class="{ 'bg-green-50 border-green-200': store.currentCheckedRibbons.includes(ribbon.id) }"
        >
          <div class="w-6 h-6 mr-2 flex-shrink-0">
            <span v-if="store.currentCheckedRibbons.includes(ribbon.id)" class="text-green-500">✓</span>
            <span v-else class="text-gray-300">○</span>
          </div>
          <span class="text-sm">{{ ribbon.name }}</span>
        </div>
      </div>
      <p v-else class="text-gray-500 text-sm">リボンデータはリボン王チャートで管理できます</p>
    </div>

    <!-- リボン獲得率 -->
    <div class="mt-2 md:mt-4 bg-gray-50 p-2 md:p-3 rounded-lg">
      <div class="flex justify-between items-center">
        <span class="font-medium">リボン獲得率</span>
        <span class="font-bold"
          >{{ store.currentCheckedRibbons.length }} / {{ store.ribbons.length }} ({{ ribbonPercentage }}%)</span
        >
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div class="bg-blue-500 h-2 rounded-full" :style="`width: ${ribbonPercentage}%`"></div>
      </div>
    </div>
  </div>

  <div v-else class="p-4 md:p-8 text-center bg-gray-50 rounded-lg">
    <p class="text-gray-500">ポケモンを選択してください😊</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Pokemon } from '~/types';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { getGameName } from '~/utils/gameNames';

// プロパティ定義
const props = defineProps<{
  pokemon: Pokemon | null;
}>();

const store = useRibbonProgressStore();

// リボン獲得率の計算（store のリアルタイムデータを使用）
const ribbonPercentage = computed(() => {
  if (!props.pokemon) return 0;
  if (store.ribbons.length === 0) return 0;
  return Math.round((store.currentCheckedRibbons.length / store.ribbons.length) * 100);
});

// ポケモンタイプに応じたCSSクラスを返す
const getTypeClass = (type: string): string => {
  const typeClasses: Record<string, string> = {
    ノーマル: 'bg-gray-400',
    ほのお: 'bg-red-500',
    みず: 'bg-blue-500',
    でんき: 'bg-yellow-400',
    くさ: 'bg-green-500',
    こおり: 'bg-blue-300',
    かくとう: 'bg-red-700',
    どく: 'bg-purple-500',
    じめん: 'bg-yellow-700',
    ひこう: 'bg-blue-400',
    エスパー: 'bg-pink-400',
    むし: 'bg-lime-500',
    いわ: 'bg-yellow-600',
    ゴースト: 'bg-purple-700',
    ドラゴン: 'bg-indigo-600',
    あく: 'bg-gray-700',
    はがね: 'bg-gray-500',
    フェアリー: 'bg-pink-300',
  };

  return typeClasses[type] || 'bg-gray-400';
};
</script>
