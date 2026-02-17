<template>
  <div class="container mx-auto px-2 md:px-4 py-3 md:py-8">
    <h1 class="text-xl md:text-3xl font-bold mb-3 md:mb-6 text-center">ポケモンリボン制覇支援ツール</h1>

    <!-- ポケモン検索セクション -->
    <div class="mb-4 md:mb-8">
      <div v-if="isLoading" class="py-16 text-center">
        <div class="inline-block animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <p class="mt-2 text-gray-500">リボンデータを読み込み中...</p>
      </div>
      <div v-else-if="error" class="py-8 text-center bg-red-50 rounded-lg">
        <p class="text-red-600">データの読み込みに失敗しました: {{ error }}</p>
        <button
          class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          @click="loadData"
        >
          再試行
        </button>
      </div>
      <PokemonSearch
        v-else
        :all-pokemon="store.pokemonList"
        :selected-pokemon="store.selectedPokemon"
        @select-pokemon="store.selectPokemon"
      />
    </div>

    <!-- マイポケモンパネル -->
    <div v-if="!isLoading && !error" class="mb-4 md:mb-8">
      <MyPokemonPanel />
    </div>

    <!-- 選択されたポケモン情報 -->
    <div v-if="store.selectedPokemon" class="mb-4 md:mb-8">
      <PokemonDetails :pokemon="store.selectedPokemon" />
    </div>

    <!-- メインタブ -->
    <div class="mb-4 md:mb-8">
      <div class="flex border-b overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['px-3 py-1.5 mr-1 text-sm md:px-4 md:py-2 md:mr-2 md:text-base whitespace-nowrap', activeTab === tab.id ? 'bg-blue-500 text-white rounded-t' : 'text-gray-700']"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- タブコンテンツ -->
      <div class="mt-2 md:mt-4">
        <RibbonManagement
          v-if="activeTab === 'manage'"
          :pokemon="store.selectedPokemon"
          :ribbons="store.ribbons"
          :games="store.games"
        />

        <ProgressDashboard
          v-if="activeTab === 'progress'"
          :pokemon="store.selectedPokemon"
          :ribbons="store.ribbons"
        />

        <TransferGuide v-if="activeTab === 'transfer'" />
      </div>
    </div>

    <!-- お役立ち情報セクション -->
    <HelpfulResources />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRibbonProgressStore } from '~/stores/ribbonProgress';
import { usePokemonData } from '~/utils/dataFetcher';

const store = useRibbonProgressStore();
const { isLoading, error, loadAll } = usePokemonData();

const activeTab = ref('manage');

const tabs = [
  { id: 'manage', label: 'リボン管理' },
  { id: 'progress', label: '進捗ダッシュボード' },
  { id: 'transfer', label: '転送ガイド' },
] as const;

const loadData = async (): Promise<void> => {
  try {
    const { pokemonData, ribbonData, gameData } = await loadAll();
    store.setPokemonList(pokemonData);
    store.setRibbons(ribbonData);
    store.setGames(gameData);
    store.loadMyPokemonList();
  } catch {
    // error は usePokemonData 内で管理される
  }
};

onMounted(loadData);
</script>
