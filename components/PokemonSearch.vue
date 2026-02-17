<template>
  <div class="pokemon-search p-2 md:p-4 bg-white rounded-lg shadow">
    <div class="mb-2 md:mb-4">
      <label class="block text-gray-700 text-xs md:text-sm font-bold mb-1 md:mb-2"> ポケモンを検索してね～💖 </label>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          class="w-full px-3 py-1.5 md:px-4 md:py-2 border rounded-lg text-sm md:text-base"
          placeholder="ピカチュウ、ヒトカゲなど..."
        />
        <div v-if="isLoading" class="absolute right-3 top-2.5">
          <span class="animate-spin">🔄</span>
        </div>
      </div>
    </div>

    <!-- 検索結果表示 -->
    <div v-if="results.length > 0" class="mt-2 max-h-60 md:max-h-80 overflow-y-auto">
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
import { ref, computed } from 'vue';
import { toPokemon } from '~/utils/pokemonMapper';
import type { Pokemon, PokemonDetail } from '~/types';

const props = defineProps<{
  allPokemon: PokemonDetail[];
  selectedPokemon: Pokemon | null;
}>();

const emit = defineEmits<{
  (e: 'select-pokemon', pokemon: Pokemon): void;
}>();

const searchQuery = ref('');

/** 検索クエリに一致するポケモンをフィルタリング */
const results = computed<Pokemon[]>(() => {
  const query = searchQuery.value.trim();
  if (!query) return [];
  return props.allPokemon.filter((p) => p.name.includes(query)).map(toPokemon);
});

const isLoading = computed(() => false);

/** ポケモン選択: 親に emit して検索欄をクリア */
const selectPokemon = (pokemon: Pokemon): void => {
  emit('select-pokemon', pokemon);
  searchQuery.value = '';
};
</script>
