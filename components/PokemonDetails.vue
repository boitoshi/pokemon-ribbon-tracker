<template>
  <div v-if="pokemon" class="pokemon-details bg-white p-4 rounded-lg shadow">
    <!-- ポケモン基本情報セクション -->
    <div class="flex items-center mb-4">
      <div class="mr-4">
        <img 
          :src="pokemon.imageUrl" 
          :alt="pokemon.name" 
          class="w-24 h-24 object-contain"
        />
      </div>
      
      <div>
        <h2 class="text-xl font-bold">{{ pokemon.name }}</h2>
        <p class="text-gray-600">#{{ pokemon.number }}</p>
        
        <!-- タイプ表示 -->
        <div class="flex mt-1 gap-2">
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
    
    <!-- リボン取得状況 -->
    <div class="mt-4">
      <h3 class="font-bold text-lg mb-2">リボン取得状況</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div 
          v-for="ribbon in pokemon.ribbons" 
          :key="ribbon.id"
          class="p-2 border rounded flex items-center"
          :class="{ 'bg-green-50 border-green-200': ribbon.obtained }"
        >
          <div class="w-6 h-6 mr-2 flex-shrink-0">
            <span v-if="ribbon.obtained" class="text-green-500">✓</span>
            <span v-else class="text-gray-300">○</span>
          </div>
          <span class="text-sm">{{ ribbon.name }}</span>
        </div>
      </div>
    </div>
    
    <!-- リボン獲得率 -->
    <div class="mt-4 bg-gray-50 p-3 rounded-lg">
      <div class="flex justify-between items-center">
        <span class="font-medium">リボン獲得率</span>
        <span class="font-bold">{{ ribbonPercentage }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div 
          class="bg-blue-500 h-2 rounded-full" 
          :style="`width: ${ribbonPercentage}%`"
        ></div>
      </div>
    </div>
  </div>
  
  <div v-else class="p-8 text-center bg-gray-50 rounded-lg">
    <p class="text-gray-500">ポケモンを選択してください😊</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Pokemon } from '~/types';

// プロパティ定義
const props = defineProps<{
  pokemon: Pokemon | null;
}>();

// リボン獲得率の計算
const ribbonPercentage = computed(() => {
  if (!props.pokemon) return 0;
  
  const obtainedCount = props.pokemon.ribbons.filter(r => r.obtained).length;
  return Math.round((obtainedCount / props.pokemon.ribbons.length) * 100);
});

// ポケモンタイプに応じたCSSクラスを返す
const getTypeClass = (type: string): string => {
  const typeClasses: Record<string, string> = {
    'ノーマル': 'bg-gray-400',
    'ほのお': 'bg-red-500',
    'みず': 'bg-blue-500',
    'でんき': 'bg-yellow-400',
    'くさ': 'bg-green-500',
    'こおり': 'bg-blue-300',
    'かくとう': 'bg-red-700',
    'どく': 'bg-purple-500',
    'じめん': 'bg-yellow-700',
    'ひこう': 'bg-blue-400',
    'エスパー': 'bg-pink-400',
    'むし': 'bg-lime-500',
    'いわ': 'bg-yellow-600',
    'ゴースト': 'bg-purple-700',
    'ドラゴン': 'bg-indigo-600',
    'あく': 'bg-gray-700',
    'はがね': 'bg-gray-500',
    'フェアリー': 'bg-pink-300',
  };
  
  return typeClasses[type] || 'bg-gray-400';
};

</script>
