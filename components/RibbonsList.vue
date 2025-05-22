<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">リボン一覧</h2>
      <p class="text-gray-600 text-sm">{{ ribbons.length }}個のリボン</p>
    </div>

    <div v-if="ribbons.length === 0" class="bg-gray-50 rounded-lg p-8 text-center">
      <p class="text-gray-500">条件に一致するリボンがありません😢</p>
      <p class="mt-2 text-sm text-gray-400">フィルターを変更してみてください</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- リボンカード -->
      <div 
        v-for="ribbon in ribbons" 
        :key="ribbon.id" 
        class="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        @click="selectRibbon(ribbon)">
        <div class="flex p-3">
          <!-- リボンのアイコン部分 -->
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <img v-if="ribbon.image_url" :src="ribbon.image_url" :alt="ribbon.name" class="w-9 h-9">
            <span v-else class="text-2xl">🎀</span>
          </div>
          
          <!-- リボン情報 -->
          <div class="flex-1">
            <h3 class="font-bold text-blue-800">{{ ribbon.name }}</h3>
            <p class="text-sm text-gray-600 line-clamp-2">{{ ribbon.description }}</p>
            
            <!-- リボンメタデータ -->
            <div class="mt-1 flex flex-wrap gap-1">
              <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                第{{ ribbon.generation }}世代
              </span>
              <span 
                v-if="isPokemonCompatible(ribbon)"
                class="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                取得可能
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// プロパティ定義
const props = defineProps({
  ribbons: {
    type: Array,
    required: true
  },
  pokemon: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['select-ribbon']);

// リボン選択ハンドラー
const selectRibbon = (ribbon) => {
  emit('select-ribbon', ribbon);
};

// 選択されたポケモンがリボンを取得可能かどうかをチェック
const isPokemonCompatible = (ribbon) => {
  if (!props.pokemon) return true;
  
  // 例：特別なポケモンには特定のリボンが取得できない場合がある
  if (ribbon.compatible_pokemon === 'all') return true;
  if (ribbon.compatible_pokemon === 'all-except-special' && !props.pokemon.is_special) return true;
  
  // 実際のアプリではより複雑な互換性チェックを行うことができる
  return true;
};
</script>
