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

    <!-- マイポケモン情報 -->
    <div v-if="store.activeMyPokemon" class="mt-2 md:mt-4 bg-blue-50 p-2 md:p-3 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs text-blue-600 font-medium">マイポケモン</span>
          <p class="font-bold text-sm">{{ store.activeMyPokemon.nickname || pokemon.name }}</p>
          <p v-if="store.activeMyPokemon.originGame" class="text-xs text-gray-500">
            出身: {{ getGameDisplayName(store.activeMyPokemon.originGame) }}
          </p>
          <p v-if="store.activeMyPokemon.memo" class="text-xs text-gray-500 mt-0.5">
            {{ store.activeMyPokemon.memo }}
          </p>
        </div>
      </div>
    </div>

    <!-- リボン取得状況 -->
    <div class="mt-2 md:mt-4">
      <h3 class="font-bold text-base md:text-lg mb-1 md:mb-2">リボン取得状況</h3>
      <div class="flex gap-4 text-sm">
        <span>取得済み: <strong>{{ store.currentCheckedRibbons.length }}個</strong></span>
        <span>取得可能: <strong>{{ store.ribbons.length }}個</strong></span>
      </div>
    </div>

    <!-- リボン獲得率 -->
    <div class="mt-2 md:mt-4 bg-gray-50 p-2 md:p-3 rounded-lg">
      <div class="flex justify-between items-center">
        <span class="font-medium">リボン獲得率</span>
        <span class="font-bold">{{ ribbonPercentage }}%</span>
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

// リボン獲得率の計算
const ribbonPercentage = computed(() => {
  if (!props.pokemon) return 0;
  return store.totalCompletion;
});

/** ゲームIDから表示名を取得 */
const getGameDisplayName = (gameId: string): string => getGameName(gameId);

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
