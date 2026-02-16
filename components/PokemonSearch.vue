<template>
  <div class="pokemon-search p-4 bg-white rounded-lg shadow">
    <div class="mb-4">
      <label class="block text-gray-700 text-sm font-bold mb-2">
        ポケモンを検索してね～💖
      </label>
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          class="w-full px-4 py-2 border rounded-lg"
          placeholder="ピカチュウ、ヒトカゲなど..."
          @input="searchPokemon"
        />
        <div v-if="isLoading" class="absolute right-3 top-2.5">
          <span class="animate-spin">🔄</span>
        </div>
      </div>
    </div>

    <!-- 検索結果表示 -->
    <div v-if="results.length > 0" class="mt-2 max-h-80 overflow-y-auto">
      <div
        v-for="pokemon in results"
        :key="pokemon.id"
        class="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
        @click="selectPokemon(pokemon)"
      >
        <div class="w-10 h-10 mr-3">
          <img
            v-if="pokemon.imageUrl"
            :src="pokemon.imageUrl"
            :alt="pokemon.name"
            class="w-full h-full object-contain"
          />
          <div v-else class="w-full h-full bg-gray-200 rounded-full"></div>
        </div>
        <div>
          <div class="font-medium">{{ pokemon.name }}</div>
          <div class="text-xs text-gray-500">{{ pokemon.number }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="searchQuery && !isLoading" class="text-center py-4">
      <p class="text-gray-500">ポケモンが見つからないよ～😢</p>
      <p class="text-sm text-gray-400">別の名前で検索してみてね！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Pokemon } from '~/types';

// 検索状態の変数
const searchQuery = ref('');
const results = ref<Pokemon[]>([]); // 👈型をしっかり指定！
const isLoading = ref(false);
const selectedPokemon = ref<Pokemon | null>(null);

// イベント
const emit = defineEmits<{
  (e: 'select-pokemon', pokemon: Pokemon): void;
}>();

// ポケモン検索関数
const searchPokemon = async () => {
  if (!searchQuery.value) {
    results.value = [];
    return;
  }

  isLoading.value = true;
  
  try {
    // 実際のアプリではAPI呼び出しをするよ～
    // ここではダミーデータを使うね💕
    await new Promise(resolve => setTimeout(resolve, 300)); // APIリクエストの模擬
    
    results.value = [
      { id: '001', name: 'フシギダネ', number: '001', types: ['くさ', 'どく'], imageUrl: '/pokemon/001.png' },
      { id: '004', name: 'ヒトカゲ', number: '004', types: ['ほのお'], imageUrl: '/pokemon/004.png' },
      { id: '007', name: 'ゼニガメ', number: '007', types: ['みず'], imageUrl: '/pokemon/007.png' },
    ].filter(p => p.name.includes(searchQuery.value));
    
  } catch (error) {
    console.error('検索中にエラーが発生したよ～😭', error);
    results.value = [];
  } finally {
    isLoading.value = false;
  }
};

// ポケモン選択関数
const selectPokemon = (pokemon: Pokemon) => {
  selectedPokemon.value = pokemon;
  emit('select-pokemon', pokemon);
  searchQuery.value = ''; // 検索欄をクリア
  results.value = []; // 結果をクリア
};

onMounted(() => {
  // コンポーネントがマウントされたときの初期化処理
  // 例：最近検索したポケモンを表示するなど
});
</script>
